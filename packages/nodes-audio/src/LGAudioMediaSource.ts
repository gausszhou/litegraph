import { BuiltInSlotType, LGraphStatus } from "@gausszhou/litegraph-core/src/types";
import LGAudio from "./LGAudio";

export default function LGAudioMediaSource() {
  this.properties = {
    gain: 0.5,
  };

  this._audionodes = [];
  this._media_stream = null;

  this.addOutput("out", "audio");
  this.addInput("gain", "number");

  //create gain node to control volume
  var context = LGAudio.getAudioContext();
  this.audionode = context.createGain();
  this.audionode.graphnode = this;
  this.audionode.gain.value = this.properties.gain;
}

LGAudioMediaSource.prototype.onAdded = function (graph) {
  if (graph.status === LGraphStatus.STATUS_RUNNING) {
    this.onStart();
  }
};

LGAudioMediaSource.prototype.onStart = function () {
  if (this._media_stream == null && !this._waiting_confirmation) {
    this.openStream();
  }
};

LGAudioMediaSource.prototype.onStop = function () {
  this.audionode.gain.value = 0;
};

LGAudioMediaSource.prototype.onPause = function () {
  this.audionode.gain.value = 0;
};

LGAudioMediaSource.prototype.onUnpause = function () {
  this.audionode.gain.value = this.properties.gain;
};

LGAudioMediaSource.prototype.onRemoved = function () {
  this.audionode.gain.value = 0;
  if (this.audiosource_node) {
    this.audiosource_node.disconnect(this.audionode);
    this.audiosource_node = null;
  }
  if (this._media_stream) {
    var tracks = this._media_stream.getTracks();
    if (tracks.length) {
      tracks[0].stop();
    }
  }
};

LGAudioMediaSource.prototype.openStream = function () {
  if (!navigator.mediaDevices) {
    console.log(
      "getUserMedia() is not supported in your browser, use chrome and enable WebRTC from about://flags"
    );
    return;
  }

  this._waiting_confirmation = true;

  // Not showing vendor prefixes.
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(this.streamReady.bind(this))
    .catch(onFailSoHard);

  var that = this;
  function onFailSoHard(err) {
    console.log("Media rejected", err);
    that._media_stream = false;
    that.boxcolor = "red";
  }
};

LGAudioMediaSource.prototype.streamReady = function (localMediaStream) {
  this._media_stream = localMediaStream;
  //this._waiting_confirmation = false;

  //init context
  if (this.audiosource_node) {
    this.audiosource_node.disconnect(this.audionode);
  }
  var context = LGAudio.getAudioContext();
  this.audiosource_node = context.createMediaStreamSource(localMediaStream);
  this.audiosource_node.graphnode = this;
  this.audiosource_node.connect(this.audionode);
  this.boxcolor = "white";
};

LGAudioMediaSource.prototype.onExecute = function () {
  if (this._media_stream == null && !this._waiting_confirmation) {
    this.openStream();
  }

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
      if (input.name == "gain") {
        this.audionode.gain.value = this.properties.gain = v;
      }
    }
  }
};

LGAudioMediaSource.prototype.onAction = function (event) {
  if (event == "Play") {
    this.audionode.gain.value = this.properties.gain;
  } else if (event == "Stop") {
    this.audionode.gain.value = 0;
  }
};

LGAudioMediaSource.prototype.onPropertyChanged = function (name, value) {
  if (name == "gain") {
    this.audionode.gain.value = value;
  }
};

// Helps connect/disconnect AudioNodes when new connections are made in the node
LGAudioMediaSource.prototype.onConnectionsChange = LGAudio.onConnectionsChange;

LGAudioMediaSource.prototype.onGetInputs = function () {
  return [
    ["playbackRate", "number"],
    ["Play", BuiltInSlotType.ACTION],
    ["Stop", BuiltInSlotType.ACTION],
  ];
};
