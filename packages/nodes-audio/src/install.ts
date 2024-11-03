import { LiteGraph } from "@gausszhou/litegraph-core";
import LGAudioADSR from "./LGAudioADSR";
import LGAudioAnalyser from "./LGAudioAnalyser";
import LGAudioBandSignal from "./LGAudioBandSignal";
import LGAudioBiquadFilter from "./LGAudioBiquadFilter";
import LGAudioConvolver from "./LGAudioConvolver";
import LGAudioDelay from "./LGAudioDelay";
import LGAudioDestination from "./LGAudioDestination";
import LGAudioDynamicsCompressor from "./LGAudioDynamicsCompressor";
import LGAudioGain from "./LGAudioGain";
import LGAudioMediaSource from "./LGAudioMediaSource";
import LGAudioMixer from "./LGAudioMixer";
import LGAudioOscillatorNode from "./LGAudioOscillatorNode";
import LGAudioScript from "./LGAudioScript";
import LGAudioSource from "./LGAudioSource";
import LGAudioVisualization from "./LGAudioVisualization";
import LGAudioWaveShaper from "./LGAudioWaveShaper";

export const install = (LiteGraphClass: any) => {
  LiteGraphClass.registerNodeType({
    type: "audio/adsr",
    class: LGAudioADSR,
    title: "ADSR",
    desc: "Audio envelope",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/analyser",
    class: LGAudioAnalyser,
    title: "Analyser",
    desc: "Audio Analyser",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/signal",
    class: LGAudioBandSignal,
    title: "Signal",
    desc: "extract the signal of some frequency",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/biquadfilter",
    class: LGAudioBiquadFilter,
    title: "BiquadFilter",
    desc: "Audio filter",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/convolver",
    class: LGAudioConvolver,
    title: "Convolver",
    desc: "Convolves the signal (used for reverb)",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/delay",
    class: LGAudioDelay,
    title: "Delay",
    desc: "Audio delay",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/destination",
    class: LGAudioDestination,
    title: "Destination",
    desc: "Audio output",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/dynamicsCompressor",
    title: "DynamicsCompressor",
    class: LGAudioDynamicsCompressor,
    desc: "Dynamics Compressor",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/gain",
    title: "Gain",
    class: LGAudioGain,
    desc: "Audio gain",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/media_source",
    title: "MediaSource",
    class: LGAudioMediaSource,
    desc: "Plays microphone",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/mixer",
    title: "Mixer",
    class: LGAudioMixer,
    desc: "Audio mixer",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/oscillator",
    title: "Oscillator",
    class: LGAudioOscillatorNode,
    desc: "Oscillator",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/script",
    title: "Script",
    class: LGAudioScript,
    desc: "apply script to signal",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/source",
    title: "Source",
    class: LGAudioSource,
    desc: "Plays audio",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/visualization",
    title: "Visualization",
    class: LGAudioVisualization,
    desc: "Audio Visualization",
  });

  LiteGraphClass.registerNodeType({
    type: "audio/waveShaper",
    title: "WaveShaper",
    class: LGAudioWaveShaper,
    desc: "Distortion using wave shape",
  });
};
