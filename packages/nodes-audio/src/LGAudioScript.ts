import LGAudio from "./LGAudio";

export default function LGAudioScript() {
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

LGAudioScript.prototype.onAdded = function (graph) {
  if (graph.status == LGraph.STATUS_RUNNING) {
    this.audionode.onaudioprocess = this._callback;
  }
};

LGAudioScript["@code"] = { widget: "code", type: "code" };

LGAudioScript.prototype.onStart = function () {
  this.audionode.onaudioprocess = this._callback;
};

LGAudioScript.prototype.onStop = function () {
  this.audionode.onaudioprocess = LGAudioScript._bypass_function;
};

LGAudioScript.prototype.onPause = function () {
  this.audionode.onaudioprocess = LGAudioScript._bypass_function;
};

LGAudioScript.prototype.onUnpause = function () {
  this.audionode.onaudioprocess = this._callback;
};

LGAudioScript.prototype.onExecute = function () {
  //nothing! because we need an onExecute to receive onStart... fix that
};

LGAudioScript.prototype.onRemoved = function () {
  this.audionode.onaudioprocess = LGAudioScript._bypass_function;
};


LGAudioScript.prototype.processCode = function () {
  try {
    var func = new Function("properties", this.properties.code);
    this._script = new func(this.properties);
    this._old_code = this.properties.code;
    this._callback = this._script.onaudioprocess;
  } catch (err) {
    console.error("Error in onaudioprocess code", err);
    this._callback = LGAudioScript._bypass_function;
    this.audionode.onaudioprocess = this._callback;
  }
};

LGAudioScript.prototype.onPropertyChanged = function (name, value) {
  if (name == "code") {
    this.properties.code = value;
    this.processCode();
    if (this.graph && this.graph.status == LGraph.STATUS_RUNNING) {
      this.audionode.onaudioprocess = this._callback;
    }
  }
};

LGAudioScript.default_function = function () {
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
};

LGAudio.createAudioNodeWrapper(LGAudioScript);