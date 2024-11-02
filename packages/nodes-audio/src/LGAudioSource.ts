import { BuiltInSlotShape, BuiltInSlotType, LGraph, LGraphStatus } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

//****************************************************
export default function LGAudioSource() {
  this.properties = {
    src: "",
    gain: 0.5,
    loop: true,
    autoplay: true,
    playbackRate: 1,
  };

  this._loading_audio = false;
  this._audiobuffer = null; //points to AudioBuffer with the audio samples decoded
  this._audionodes = [];
  this._last_sourcenode = null; //the last AudioBufferSourceNode (there could be more if there are several sounds playing)

  this.addOutput("out", "audio");
  this.addInput("gain", "number");

  //init context
  var context = LGAudio.getAudioContext();

  //create gain node to control volume
  this.audionode = context.createGain();
  this.audionode.graphnode = this;
  this.audionode.gain.value = this.properties.gain;

  //debug
  if (this.properties.src) {
    this.loadSound(this.properties.src);
  }
}

LGAudioSource.desc = "Plays an audio file";
LGAudioSource["@src"] = { widget: "resource" };
LGAudioSource.supported_extensions = ["wav", "ogg", "mp3"];

LGAudioSource.prototype.onAdded = function (graph) {
  if (graph.status === LGraphStatus.STATUS_RUNNING) {
    this.onStart();
  }
};

LGAudioSource.prototype.onStart = function () {
  if (!this._audiobuffer) {
    return;
  }

  if (this.properties.autoplay) {
    this.playBuffer(this._audiobuffer);
  }
};

LGAudioSource.prototype.onStop = function () {
  this.stopAllSounds();
};

LGAudioSource.prototype.onPause = function () {
  this.pauseAllSounds();
};

LGAudioSource.prototype.onUnpause = function () {
  this.unpauseAllSounds();
  //this.onStart();
};

LGAudioSource.prototype.onRemoved = function () {
  this.stopAllSounds();
  if (this._dropped_url) {
    URL.revokeObjectURL(this._url);
  }
};

LGAudioSource.prototype.stopAllSounds = function () {
  //iterate and stop
  for (var i = 0; i < this._audionodes.length; ++i) {
    if (this._audionodes[i].started) {
      this._audionodes[i].started = false;
      this._audionodes[i].stop();
    }
    //this._audionodes[i].disconnect( this.audionode );
  }
  this._audionodes.length = 0;
};

LGAudioSource.prototype.pauseAllSounds = function () {
  LGAudio.getAudioContext().suspend();
};

LGAudioSource.prototype.unpauseAllSounds = function () {
  LGAudio.getAudioContext().resume();
};

LGAudioSource.prototype.onExecute = function () {
  if (this.inputs) {
    for (var i = 0; i < this.inputs.length; ++i) {
      var input = this.inputs[i];
      if (input.link == null) {
        continue;
      }
      var v = this.getInputData(i);
      if (v === undefined) {
        continue;
      }
      if (input.name == "gain") this.audionode.gain.value = v;
      else if (input.name == "src") {
        this.setProperty("src", v);
      } else if (input.name == "playbackRate") {
        this.properties.playbackRate = v;
        for (var j = 0; j < this._audionodes.length; ++j) {
          this._audionodes[j].playbackRate.value = v;
        }
      }
    }
  }

  if (this.outputs) {
    for (var i = 0; i < this.outputs.length; ++i) {
      var output = this.outputs[i];
      if (output.name == "buffer" && this._audiobuffer) {
        this.setOutputData(i, this._audiobuffer);
      }
    }
  }
};

LGAudioSource.prototype.onAction = function (event) {
  if (this._audiobuffer) {
    if (event == "Play") {
      this.playBuffer(this._audiobuffer);
    } else if (event == "Stop") {
      this.stopAllSounds();
    }
  }
};

LGAudioSource.prototype.onPropertyChanged = function (name, value) {
  if (name == "src") {
    this.loadSound(value);
  } else if (name == "gain") {
    this.audionode.gain.value = value;
  } else if (name == "playbackRate") {
    for (var j = 0; j < this._audionodes.length; ++j) {
      this._audionodes[j].playbackRate.value = value;
    }
  }
};

LGAudioSource.prototype.playBuffer = function (buffer) {
  var that = this;
  var context = LGAudio.getAudioContext();

  //create a new audionode (this is mandatory, AudioAPI doesnt like to reuse old ones)
  var audionode = context.createBufferSource(); //create a AudioBufferSourceNode
  this._last_sourcenode = audionode;
  audionode.graphnode = this;
  audionode.buffer = buffer;
  audionode.loop = this.properties.loop;
  audionode.playbackRate.value = this.properties.playbackRate;
  this._audionodes.push(audionode);
  audionode.connect(this.audionode); //connect to gain

  this._audionodes.push(audionode);

  this.trigger("start");

  audionode.onended = function () {
    //console.log("ended!");
    that.trigger("ended");
    //remove
    var index = that._audionodes.indexOf(audionode);
    if (index != -1) {
      that._audionodes.splice(index, 1);
    }
  };

  if (!audionode.started) {
    audionode.started = true;
    audionode.start();
  }
  return audionode;
};

LGAudioSource.prototype.loadSound = function (url) {
  var that = this;

  //kill previous load
  if (this._request) {
    this._request.abort();
    this._request = null;
  }

  this._audiobuffer = null; //points to the audiobuffer once the audio is loaded
  this._loading_audio = false;

  if (!url) {
    return;
  }

  this._request = LGAudio.loadSound(url, inner);

  this._loading_audio = true;
  this.boxcolor = "#AA4";

  function inner(buffer) {
    this.boxcolor = LiteGraph.NODE_DEFAULT_BOXCOLOR;
    that._audiobuffer = buffer;
    that._loading_audio = false;
    //if is playing, then play it
    if (that.graph && that.graph.status === LGraph.STATUS_RUNNING) {
      that.onStart();
    } //this controls the autoplay already
  }
};

//Helps connect/disconnect AudioNodes when new connections are made in the node
LGAudioSource.prototype.onConnectionsChange = LGAudio.onConnectionsChange;

LGAudioSource.prototype.onGetInputs = function () {
  return [
    ["playbackRate", "number"],
    ["src", "string"],
    ["Play", LiteGraph.ACTION],
    ["Stop", LiteGraph.ACTION],
  ];
};

LGAudioSource.prototype.onGetOutputs = function () {
  return [
    ["buffer", "audiobuffer"],
    ["start", LiteGraph.EVENT],
    ["ended", LiteGraph.EVENT],
  ];
};

LGAudioSource.prototype.onDropFile = function (file) {
  if (this._dropped_url) {
    URL.revokeObjectURL(this._dropped_url);
  }
  var url = URL.createObjectURL(file);
  this.properties.src = url;
  this.loadSound(url);
  this._dropped_url = url;
};
