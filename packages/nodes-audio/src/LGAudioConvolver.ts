import LGAudio from "./LGAudio";

export default function LGAudioConvolver() {
  //default
  this.properties = {
    impulse_src: "",
    normalize: true,
  };

  this.audionode = LGAudio.getAudioContext().createConvolver();
  this.addInput("in", "audio");
  this.addOutput("out", "audio");
}



LGAudioConvolver.prototype.onRemove = function () {
  if (this._dropped_url) {
    URL.revokeObjectURL(this._dropped_url);
  }
};

LGAudioConvolver.prototype.onPropertyChanged = function (name, value) {
  if (name == "impulse_src") {
    this.loadImpulse(value);
  } else if (name == "normalize") {
    this.audionode.normalize = value;
  }
};

LGAudioConvolver.prototype.onDropFile = function (file) {
  if (this._dropped_url) {
    URL.revokeObjectURL(this._dropped_url);
  }
  this._dropped_url = URL.createObjectURL(file);
  this.properties.impulse_src = this._dropped_url;
  this.loadImpulse(this._dropped_url);
};

LGAudioConvolver.prototype.loadImpulse = function (url) {
  var that = this;

  //kill previous load
  if (this._request) {
    this._request.abort();
    this._request = null;
  }

  this._impulse_buffer = null;
  this._loading_impulse = false;

  if (!url) {
    return;
  }

  //load new sample
  this._request = LGAudio.loadSound(url, inner);
  this._loading_impulse = true;

  // Decode asynchronously
  function inner(buffer) {
    that._impulse_buffer = buffer;
    that.audionode.buffer = buffer;
    console.log("Impulse signal set");
    that._loading_impulse = false;
  }
};

LGAudio.createAudioNodeWrapper(LGAudioConvolver);
