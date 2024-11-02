import LGAudio from "./LGAudio";

export default function LGAudioDelay() {
  //default
  this.properties = {
    delayTime: 0.5,
  };

  this.audionode = LGAudio.getAudioContext().createDelay(10);
  this.audionode.delayTime.value = this.properties.delayTime;
  this.addInput("in", "audio");
  this.addInput("time", "number");
  this.addOutput("out", "audio");
}

LGAudio.createAudioNodeWrapper(LGAudioDelay);

LGAudioDelay.prototype.onExecute = function () {
  var v = this.getInputData(1);
  if (v !== undefined) {
    this.audionode.delayTime.value = v;
  }
};
