import { LGraphNode } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

export default class LGAudioDelay extends LGraphNode {
  audionode: DelayNode;
  constructor() {
    super();
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

  onExecute() {
    var v = this.getInputData(1);
    if (v !== undefined) {
      this.audionode.delayTime.value = v;
    }
  }
}

LGAudio.createAudioNodeWrapper(LGAudioDelay);