import LGAudio from "./LGAudio";

export default function LGAudioADSR() {
  //default
  this.properties = {
    A: 0.1,
    D: 0.1,
    S: 0.1,
    R: 0.1,
  };

  this.audionode = LGAudio.getAudioContext().createGain();
  this.audionode.gain.value = 0;
  this.addInput("in", "audio");
  this.addInput("gate", "boolean");
  this.addOutput("out", "audio");
  this.gate = false;
}

LGAudioADSR.prototype.onExecute = function () {
  var audioContext = LGAudio.getAudioContext();
  var now = audioContext.currentTime;
  var node = this.audionode;
  var gain = node.gain;
  var current_gate = this.getInputData(1);

  var A = this.getInputOrProperty("A");
  var D = this.getInputOrProperty("D");
  var S = this.getInputOrProperty("S");
  var R = this.getInputOrProperty("R");

  if (!this.gate && current_gate) {
    gain.cancelScheduledValues(0);
    gain.setValueAtTime(0, now);
    gain.linearRampToValueAtTime(1, now + A);
    gain.linearRampToValueAtTime(S, now + A + D);
  } else if (this.gate && !current_gate) {
    gain.cancelScheduledValues(0);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + R);
  }

  this.gate = current_gate;
};

LGAudioADSR.prototype.onGetInputs = function () {
  return [
    ["A", "number"],
    ["D", "number"],
    ["S", "number"],
    ["R", "number"],
  ];
};

LGAudio.createAudioNodeWrapper(LGAudioADSR);

