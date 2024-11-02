import LGAudio from "./LGAudio";

export default function LGAudioBiquadFilter() {
  //default
  this.properties = {
    frequency: 350,
    detune: 0,
    Q: 1,
  };
  this.addProperty("type", "lowpass", "enum", {
    values: [
      "lowpass",
      "highpass",
      "bandpass",
      "lowshelf",
      "highshelf",
      "peaking",
      "notch",
      "allpass",
    ],
  });

  //create node
  this.audionode = LGAudio.getAudioContext().createBiquadFilter();

  //slots
  this.addInput("in", "audio");
  this.addOutput("out", "audio");
}

LGAudioBiquadFilter.prototype.onExecute = function () {
  if (!this.inputs || !this.inputs.length) {
    return;
  }

  for (var i = 1; i < this.inputs.length; ++i) {
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

LGAudioBiquadFilter.prototype.onGetInputs = function () {
  return [
    ["frequency", "number"],
    ["detune", "number"],
    ["Q", "number"],
  ];
};

LGAudio.createAudioNodeWrapper(LGAudioBiquadFilter);

