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
import LGAudioVisualization from "./LGAudioVisualization";
import LGAudioWaveShaper from "./LGAudioWaveShaper";
import { LiteGraph } from "./type";

export const install = (LiteGraph: LiteGraph) => {
  LiteGraph.registerNodeType({
    type: "audio/adsr",
    class: LGAudioADSR,
    title: "ADSR",
    desc: "Audio envelope",
  });

  LiteGraph.registerNodeType({
    type: "audio/analyser",
    class: LGAudioAnalyser,
    title: "Analyser",
    desc: "Audio Analyser",
  });

  LiteGraph.registerNodeType({
    type: "audio/signal",
    class: LGAudioBandSignal,
    title: "Signal",
    desc: "extract the signal of some frequency",
  });

  LiteGraph.registerNodeType({
    type: "audio/biquadfilter",
    class: LGAudioBiquadFilter,
    title: "BiquadFilter",
    desc: "Audio filter",
  });

  LiteGraph.registerNodeType({
    type: "audio/convolver",
    class: LGAudioConvolver,
    title: "Convolver",
    desc: "Convolves the signal (used for reverb)",
  });

  LiteGraph.registerNodeType({
    type: "audio/delay",
    class: LGAudioDelay,
    title: "Delay",
    desc: "Audio delay",
  });

  LiteGraph.registerNodeType({
    type: "audio/destination",
    title: "Destination",
    class: LGAudioDestination,
    desc: "Audio output",
  });

  LiteGraph.registerNodeType({
    type: "audio/dynamicsCompressor",
    title: "DynamicsCompressor",
    class: LGAudioDynamicsCompressor,
    desc: "Dynamics Compressor",
  });

  LiteGraph.registerNodeType({
    type: "audio/gain",
    title: "Gain",
    class: LGAudioGain,
    desc: "Audio gain",
  });

  LiteGraph.registerNodeType({
    type: "audio/media_source",
    title: "MediaSource",
    class: LGAudioMediaSource,
    desc: "Plays microphone",
  });

  LiteGraph.registerNodeType({
    type: "audio/mixer",
    title: "Mixer",
    class: LGAudioMixer,
    desc: "Audio mixer",
  });

  LiteGraph.registerNodeType({
    type: "audio/oscillator",
    title: "Oscillator",
    class: LGAudioOscillatorNode,
    desc: "Oscillator",
  });

  LiteGraph.registerNodeType({
    type: "audio/script",
    title: "Script",
    class: LGAudioScript,
    desc: "apply script to signal",
  });

  LiteGraph.registerNodeType({
    type: "audio/source",
    title: "Source",
    class: LGAudioSource,
    desc: "Plays audio",
  });

  LiteGraph.registerNodeType({
    type: "audio/visualization",
    title: "Visualization",
    class: LGAudioVisualization,
    desc: "Audio Visualization",
  });

  LiteGraph.registerNodeType({
    type: "audio/waveShaper",
    title: "WaveShaper",
    class: LGAudioWaveShaper,
    desc: "Distortion using wave shape",
  });
};
