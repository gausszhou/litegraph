import LGAudio from "./LGAudio";

export default function LGAudioDestination() {
  this.audionode = LGAudio.getAudioContext().destination;
  this.addInput("in", "audio");
}