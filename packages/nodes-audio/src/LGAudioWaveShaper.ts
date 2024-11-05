import { LGraphNode } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

export default class LGAudioWaveShaper extends LGraphNode{
  audionode: WaveShaperNode
  constructor() {
    super();
    //default
    this.properties = {};

    this.audionode = LGAudio.getAudioContext().createWaveShaper();
    this.addInput("in", "audio");
    this.addInput("shape", "waveshape");
    this.addOutput("out", "audio");
  }

  onExecute() {
    if (!this.inputs || !this.inputs.length) {
      return;
    }
    var v = this.getInputData(1);
    if (v === undefined) {
      return;
    }
    this.audionode.curve = v;
  }

  setWaveShape(shape) {
    this.audionode.curve = shape;
  }
}


LGAudio.createAudioNodeWrapper(LGAudioWaveShaper);

