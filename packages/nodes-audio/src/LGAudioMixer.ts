import { LGraphNode } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

export default class LGAudioMixer extends LGraphNode {
  audionode: GainNode
  audionode1: GainNode
  audionode2: GainNode
  constructor() {
    super();
    //default
    this.properties = {
      gain1: 0.5,
      gain2: 0.5,
    };

    this.audionode = LGAudio.getAudioContext().createGain();

    this.audionode1 = LGAudio.getAudioContext().createGain();
    this.audionode1.gain.value = this.properties.gain1;
    this.audionode2 = LGAudio.getAudioContext().createGain();
    this.audionode2.gain.value = this.properties.gain2;

    this.audionode1.connect(this.audionode);
    this.audionode2.connect(this.audionode);

    this.addInput("in1", "audio");
    this.addInput("in1 gain", "number");
    this.addInput("in2", "audio");
    this.addInput("in2 gain", "number");

    this.addOutput("out", "audio");
  }

  getAudioNodeInInputSlot(slot) {
    if (slot == 0) {
      return this.audionode1;
    } else if (slot == 2) {
      return this.audionode2;
    }
  }

  onPropertyChanged(name, value) {
    if (name == "gain1") {
      this.audionode1.gain.value = value;
    } else if (name == "gain2") {
      this.audionode2.gain.value = value;
    }
  }

  onExecute() {
    if (!this.inputs || !this.inputs.length) {
      return;
    }

    for (var i = 1; i < this.inputs.length; ++i) {
      var input = this.inputs[i];

      if (input.link == null || input.type == "audio") {
        continue;
      }

      var v = this.getInputData(i);
      if (v === undefined) {
        continue;
      }

      if (i == 1) {
        this.audionode1.gain.value = v;
      } else if (i == 3) {
        this.audionode2.gain.value = v;
      }
    }
  }
}
LGAudio.createAudioNodeWrapper(LGAudioMixer);
