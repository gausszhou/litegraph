import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";
import LGAudio from "./LGAudio";

export default class LGAudioAnalyser extends LGraphNode {
  properties
  audionode: AnalyserNode
  _freq_bin
  _time_bin
  constructor(title) {
    super();
    this.properties = {
      fftSize: 2048,
      minDecibels: -100,
      maxDecibels: -10,
      smoothingTimeConstant: 0.5,
    };

    var context = LGAudio.getAudioContext();

    this.audionode = context.createAnalyser();
    // this.audionode.graphnode = this;
    this.audionode.fftSize = this.properties.fftSize;
    this.audionode.minDecibels = this.properties.minDecibels;
    this.audionode.maxDecibels = this.properties.maxDecibels;
    this.audionode.smoothingTimeConstant = this.properties.smoothingTimeConstant;

    this.addInput("in", "audio");
    this.addOutput("freqs", "array");
    this.addOutput("samples", "array");

    this._freq_bin = null;
    this._time_bin = null;
  }

  onPropertyChanged(name, value) {
    this.audionode[name] = value;
  }

  onExecute() {
    if (this.isOutputConnected(0)) {
      //send FFT
      var bufferLength = this.audionode.frequencyBinCount;
      if (!this._freq_bin || this._freq_bin.length != bufferLength) {
        this._freq_bin = new Uint8Array(bufferLength);
      }
      this.audionode.getByteFrequencyData(this._freq_bin);
      this.setOutputData(0, this._freq_bin);
    }

    //send analyzer
    if (this.isOutputConnected(1)) {
      //send Samples
      var bufferLength = this.audionode.frequencyBinCount;
      if (!this._time_bin || this._time_bin.length != bufferLength) {
        this._time_bin = new Uint8Array(bufferLength);
      }
      this.audionode.getByteTimeDomainData(this._time_bin);
      this.setOutputData(1, this._time_bin);
    }

    //properties
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
      ["minDecibels", "number"],
      ["maxDecibels", "number"],
      ["smoothingTimeConstant", "number"],
    ];
  }

  onGetOutputs() {
    return [
      ["freqs", "array"],
      ["samples", "array"],
    ];
  }
}