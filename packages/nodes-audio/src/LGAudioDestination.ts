import { LGraphNode } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

export default class LGAudioDestination extends LGraphNode {
  audionode: AudioDestinationNode
  constructor() {
    super();
    this.audionode = LGAudio.getAudioContext().destination;
    this.addInput("in", "audio");
  }
}