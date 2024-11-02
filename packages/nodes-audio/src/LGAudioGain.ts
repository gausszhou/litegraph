import LGAudio from "./LGAudio";

export default function LGAudioGain() {
  //default
  this.properties = {
    gain: 1,
  };

  this.audionode = LGAudio.getAudioContext().createGain();
  this.addInput("in", "audio");
  this.addInput("gain", "number");
  this.addOutput("out", "audio");
}

LGAudioGain.prototype.onExecute = function () {
  if (!this.inputs || !this.inputs.length) {
    return;
  }

  for (var i = 1; i < this.inputs.length; ++i) {
    var input = this.inputs[i];
    var v = this.getInputData(i);
    if (v !== undefined) {
      this.audionode[input.name].value = v;
    }
  }
};

LGAudio.createAudioNodeWrapper(LGAudioGain);
