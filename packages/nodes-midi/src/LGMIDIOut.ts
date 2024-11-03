import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIInterface from "./MIDIInterface";
import { MIDI_COLOR } from "./MIDIEvent";

export default function LGMIDIOut() {
  this.addInput("send", BuiltInSlotType.EVENT);
  this.properties = { port: 0 };

  var that = this;
  new MIDIInterface(function(midi) {
      that._midi = midi;
that.widget.options.values = that.getMIDIOutputs();
  });
this.widget = this.addWidget("combo","Device",this.properties.port,{ property: "port", values: this.getMIDIOutputs.bind(this) });
this.size = [340,60];
}

LGMIDIOut.MIDIInterface = MIDIInterface;

LGMIDIOut.title = "MIDI Output";
LGMIDIOut.desc = "Sends MIDI to output channel";
LGMIDIOut.color = MIDI_COLOR;

LGMIDIOut.prototype.onGetPropertyInfo = function(name) {
  if (!this._midi) {
      return;
  }

  if (name == "port") {
var values = this.getMIDIOutputs();
      return { type: "enum", values: values };
  }
};
LGMIDIOut.default_ports = {0:"unknown"};

LGMIDIOut.prototype.getMIDIOutputs = function()
{
var values = {};
if(!this._midi)
return LGMIDIOut.default_ports;
if(this._midi.output_ports_info)
for (var i = 0; i < this._midi.output_ports_info.length; ++i) {
var output = this._midi.output_ports_info[i];
if(!output)
  continue;
var name = i + ".- " + output.name + " version:" + output.version;
values[i] = name;
}
return values;
}

LGMIDIOut.prototype.onAction = function(event, midi_event) {
  //console.log(midi_event);
  if (!this._midi) {
      return;
  }
  if (event == "send") {
      this._midi.sendMIDI(this.properties.port, midi_event);
  }
  this.trigger("midi", midi_event);
};

LGMIDIOut.prototype.onGetInputs = function() {
  return [["send", LiteGraph.ACTION]];
};

LGMIDIOut.prototype.onGetOutputs = function() {
  return [["on_midi", LiteGraph.EVENT]];
};