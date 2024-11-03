import { LGraphNode } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

export default class LGAudioBiquadFilter extends LGraphNode {
  audionode: BiquadFilterNode
  constructor() {
    super()
    //default
    this.properties = {
      frequency: 350,
      detune: 0,
      Q: 1,
    };
    this.addProperty("type", "lowpass", "enum", {
      values: [
        "lowpass",
        "highpass",
        "bandpass",
        "lowshelf",
        "highshelf",
        "peaking",
        "notch",
        "allpass",
      ],
    });

    //create node
    this.audionode = LGAudio.getAudioContext().createBiquadFilter();

    //slots
    this.addInput("in", "audio");
    this.addOutput("out", "audio");
  }

  onExecute() {
    if (!this.inputs || !this.inputs.length) {
      return;
    }

    for (var i = 1; i < this.inputs.length; ++i) {
      var input = this.inputs[i];
      if (input.link == null) {
        continue;
      }
      var v = this.getInputData(i);
      if (v !== undefined) {
        this.audionode[input.name].value = v;
      }
    }
  }

  onGetInputs() {
    return [
      ["frequency", "number"],
      ["detune", "number"],
      ["Q", "number"],
    ];
  }
}

LGAudio.createAudioNodeWrapper(LGAudioBiquadFilter);

