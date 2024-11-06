import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIInterface from "./MIDIInterface";
import { MIDI_COLOR } from "./MIDIEvent";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default class LGMIDIOut extends LGraphNode {
  static MIDIInterface = MIDIInterface;
  static title = "MIDI Output";
  static desc = "Sends MIDI to output channel";
  static color = MIDI_COLOR;
  static default_ports = { 0: "unknown" };
  _midi;
  widget;
  constructor() {
    super();
    this.addInput("send", BuiltInSlotType.EVENT);
    this.properties = { port: 0 };

    var that = this;
    new MIDIInterface((midi) => {
      this._midi = midi;
      this.widget.options.values = that.getMIDIOutputs();
    });
    this.widget = this.addWidget("combo", "Device", this.properties.port, {
      property: "port",
      values: this.getMIDIOutputs.bind(this),
    } as any);
    this.size = [340, 60];
  }

  onGetPropertyInfo(name) {
    if (!this._midi) {
      return;
    }

    if (name == "port") {
      var values = this.getMIDIOutputs();
      return { type: "enum", values: values };
    }
  }

  getMIDIOutputs() {
    var values = {};
    if (!this._midi) return LGMIDIOut.default_ports;
    if (this._midi.output_ports_info)
      for (var i = 0; i < this._midi.output_ports_info.length; ++i) {
        var output = this._midi.output_ports_info[i];
        if (!output) continue;
        var name = i + ".- " + output.name + " version:" + output.version;
        values[i] = name;
      }
    return values;
  }

  onAction(event, midi_event) {
    //console.log(midi_event);
    if (!this._midi) {
      return;
    }
    if (event == "send") {
      this._midi.sendMIDI(this.properties.port, midi_event);
    }
    this.trigger("midi", midi_event);
  }

  onGetInputs() {
    return [["send", BuiltInSlotType.ACTION]];
  }

  onGetOutputs() {
    return [["on_midi", BuiltInSlotType.EVENT]];
  }
}
