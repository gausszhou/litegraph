import LGAudio from "./LGAudio";

export default function LGAudioBandSignal() {
  //default
  this.properties = {
    band: 440,
    amplitude: 1,
  };

  this.addInput("freqs", "array");
  this.addOutput("signal", "number");
}

LGAudioBandSignal.prototype.onExecute = function () {
  this._freqs = this.getInputData(0) as number[];
  if (!this._freqs) {
    return;
  }

  var band = this.properties.band;
  var v = this.getInputData(1);
  if (v !== undefined) {
    band = v;
  }

  var samplerate = LGAudio.getAudioContext().sampleRate;
  var binfreq = samplerate / this._freqs.length;
  var index = 2 * (band / binfreq);
  v = 0;
  if (index < 0) {
    v = this._freqs[0];
  }
  if (index >= this._freqs.length) {
    v = this._freqs[this._freqs.length - 1];
  } else {
    var pos = index | 0;
    var v0 = this._freqs[pos];
    var v1 = this._freqs[pos + 1];
    var f = index - pos;
    v = v0 * (1 - f) + v1 * f;
  }

  this.setOutputData(0, (v / 255) * this.properties.amplitude);
};

LGAudioBandSignal.prototype.onGetInputs = function () {
  return [["band", "number"]];
};
