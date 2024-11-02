import LGAudio from "./LGAudio";

export default function LGAudioOscillatorNode() {
  //default
  this.properties = {
    frequency: 440,
    detune: 0,
    type: "sine",
  };
  this.addProperty("type", "sine", "enum", {
    values: ["sine", "square", "sawtooth", "triangle", "custom"],
  });

  //create node
  this.audionode = LGAudio.getAudioContext().createOscillator();

  //slots
  this.addOutput("out", "audio");
}

LGAudioOscillatorNode.prototype.onStart = function () {
  if (!this.audionode.started) {
    this.audionode.started = true;
    try {
      this.audionode.start();
    } catch (err) {}
  }
};

LGAudioOscillatorNode.prototype.onStop = function () {
  if (this.audionode.started) {
    this.audionode.started = false;
    this.audionode.stop();
  }
};

LGAudioOscillatorNode.prototype.onPause = function () {
  this.onStop();
};

LGAudioOscillatorNode.prototype.onUnpause = function () {
  this.onStart();
};

LGAudioOscillatorNode.prototype.onExecute = function () {
  if (!this.inputs || !this.inputs.length) {
    return;
  }

  for (var i = 0; i < this.inputs.length; ++i) {
    var input = this.inputs[i];
    if (input.link == null) {
      continue;
    }
    var v = this.getInputData(i);
    if (v !== undefined) {
      this.audionode[input.name].value = v;
    }
  }
};

LGAudioOscillatorNode.prototype.onGetInputs = function () {
  return [
    ["frequency", "number"],
    ["detune", "number"],
    ["type", "string"],
  ];
};

LGAudio.createAudioNodeWrapper(LGAudioOscillatorNode);