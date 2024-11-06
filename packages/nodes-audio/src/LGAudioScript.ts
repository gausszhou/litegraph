import { LGraphNode, LGraphStatus } from "@gausszhou/litegraph-core";
import LGAudio from "./LGAudio";

export default class LGAudioScript extends LGraphNode {
  static default_code
  static _bypass_function
  static onaudioprocess
  audionode
  _callback
  _script
  _old_code
  constructor() {
    super();
    if (!LGAudioScript.default_code) {
      var code = LGAudioScript.default_function.toString();
      var index = code.indexOf("{") + 1;
      var index2 = code.lastIndexOf("}");
      LGAudioScript.default_code = code.substr(index, index2 - index);
    }
    //default
    this.properties = {
      code: LGAudioScript.default_code,
    };

    //create node
    var ctx = LGAudio.getAudioContext();
    if (ctx.createScriptProcessor) {
      this.audionode = ctx.createScriptProcessor(4096, 1, 1);
    }
    //buffer size, input channels, output channels
    else {
      console.warn("ScriptProcessorNode deprecated");
      this.audionode = ctx.createGain(); //bypass audio
    }

    this.processCode();
    if (!LGAudioScript._bypass_function) {
      LGAudioScript._bypass_function = this.audionode.onaudioprocess;
    }

    //slots
    this.addInput("in", "audio");
    this.addOutput("out", "audio");
  }

  static default_function() {
    this.onaudioprocess = function (audioProcessingEvent) {
      // The input buffer is the song we loaded earlier
      var inputBuffer = audioProcessingEvent.inputBuffer;

      // The output buffer contains the samples that will be modified and played
      var outputBuffer = audioProcessingEvent.outputBuffer;

      // Loop through the output channels (in this case there is only one)
      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);

        // Loop through the 4096 samples
        for (var sample = 0; sample < inputBuffer.length; sample++) {
          // make output equal to the same as the input
          outputData[sample] = inputData[sample];
        }
      }
    };
  }

  onAdded(graph) {
    if (graph.status == LGraphStatus.STATUS_RUNNING) {
      this.audionode.onaudioprocess = this._callback;
    }
  }

  onStart() {
    this.audionode.onaudioprocess = this._callback;
  }

  onStop() {
    this.audionode.onaudioprocess = LGAudioScript._bypass_function;
  }

  onPause() {
    this.audionode.onaudioprocess = LGAudioScript._bypass_function;
  }

  onUnpause() {
    this.audionode.onaudioprocess = this._callback;
  }

  onExecute() {
    //nothing! because we need an onExecute to receive onStart... fix that
  }

  onRemoved() {
    this.audionode.onaudioprocess = LGAudioScript._bypass_function;
  }

  processCode() {
    try {
      const func = new Function("properties", this.properties.code);
      this._script = func(this.properties);
      this._old_code = this.properties.code;
      this._callback = this._script.onaudioprocess;
    } catch (err) {
      console.error("Error in onaudioprocess code", err);
      this._callback = LGAudioScript._bypass_function;
      this.audionode.onaudioprocess = this._callback;
    }
  }

  onPropertyChanged(name, value) {
    if (name == "code") {
      this.properties.code = value;
      this.processCode();
      if (this.graph && this.graph.status == LGraphStatus.STATUS_RUNNING) {
        this.audionode.onaudioprocess = this._callback;
      }
    }
  }
}

LGAudioScript["@code"] = { widget: "code", type: "code" };

LGAudio.createAudioNodeWrapper(LGAudioScript);