import { LGraphNode } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

export default class LGAudioOscillatorNode extends LGraphNode {
  audionode
  constructor() {
    super();
    //default
    this.properties = {
      frequency: 440,
      detune: 0,
      type: "sine",
    };
    this.addProperty("type", "sine", "enum", {
      values: ["sine", "square", "sawtooth", "triangle", "custom"],
    });

    //create node
    this.audionode = LGAudio.getAudioContext().createOscillator();

    //slots
    this.addOutput("out", "audio");
  }

  onStart() {
    if (!this.audionode.started) {
      this.audionode.started = true;
      try {
        this.audionode.start();
      } catch (err) {}
    }
  }

  onStop() {
    if (this.audionode.started) {
      this.audionode.started = false;
      this.audionode.stop();
    }
  }

  onPause() {
    this.onStop();
  }

  onUnpause() {
    this.onStart();
  }

  onExecute() {
    if (!this.inputs || !this.inputs.length) {
      return;
    }

    for (var i = 0; i < this.inputs.length; ++i) {
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
      ["type", "string"],
    ];
  }
}


LGAudio.createAudioNodeWrapper(LGAudioOscillatorNode);