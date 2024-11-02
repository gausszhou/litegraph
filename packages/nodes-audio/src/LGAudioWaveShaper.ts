import LGAudio from "./LGAudio";

export default function LGAudioWaveShaper() {
  //default
  this.properties = {};

  this.audionode = LGAudio.getAudioContext().createWaveShaper();
  this.addInput("in", "audio");
  this.addInput("shape", "waveshape");
  this.addOutput("out", "audio");
}

LGAudioWaveShaper.prototype.onExecute = function () {
  if (!this.inputs || !this.inputs.length) {
    return;
  }
  var v = this.getInputData(1);
  if (v === undefined) {
    return;
  }
  this.audionode.curve = v;
};

LGAudioWaveShaper.prototype.setWaveShape = function (shape) {
  this.audionode.curve = shape;
};

LGAudio.createAudioNodeWrapper(LGAudioWaveShaper);

