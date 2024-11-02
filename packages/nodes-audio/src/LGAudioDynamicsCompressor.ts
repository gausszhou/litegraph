import LGAudio from "./LGAudio";

export default function LGAudioDynamicsCompressor() {
  //default
  this.properties = {
    threshold: -50,
    knee: 40,
    ratio: 12,
    reduction: -20,
    attack: 0,
    release: 0.25,
  };

  this.audionode = LGAudio.getAudioContext().createDynamicsCompressor();
  this.addInput("in", "audio");
  this.addOutput("out", "audio");
}



LGAudioDynamicsCompressor.prototype.onExecute = function () {
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

LGAudioDynamicsCompressor.prototype.onGetInputs = function () {
  return [
    ["threshold", "number"],
    ["knee", "number"],
    ["ratio", "number"],
    ["reduction", "number"],
    ["attack", "number"],
    ["release", "number"],
  ];
};

LGAudio.createAudioNodeWrapper(LGAudioDynamicsCompressor);