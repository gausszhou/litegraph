import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default class LGMIDIFilter  extends LGraphNode{
  static title = "MIDI Filter";
  static desc = "Filters MIDI messages";
  static color = MIDI_COLOR;
  _learning
  constructor() {
    super();
    this.properties = {
      channel: -1,
      cmd: -1,
      min_value: -1,
      max_value: -1,
    };

    var that = this;
    this._learning = false;
    this.addWidget("button", "Learn", "", function () {
      that._learning = true;
      that.boxcolor = "#FA3";
    });

    this.addInput("in", BuiltInSlotType.EVENT);
    this.addOutput("on_midi", BuiltInSlotType.EVENT);
    this.boxcolor = "#AAA";
  }

  getTitle() {
    var str = null;
    if (this.properties.cmd == -1) {
      str = "Nothing";
    } else {
      str = MIDIEvent.commands_short[this.properties.cmd] || "Unknown";
    }

    if (this.properties.min_value != -1 && this.properties.max_value != -1) {
      str +=
        " " +
        (this.properties.min_value == this.properties.max_value
          ? this.properties.max_value
          : this.properties.min_value + ".." + this.properties.max_value);
    }

    return "Filter: " + str;
  }

  onPropertyChanged(name, value) {
    if (name == "cmd") {
      var num = Number(value);
      if (isNaN(num)) {
        num = MIDIEvent.commands[value] || 0;
      }
      this.properties.cmd = num;
    }
  }

  onAction(event, midi_event) {
    if (!midi_event || midi_event.constructor !== MIDIEvent) {
      return;
    }

    if (this._learning) {
      this._learning = false;
      this.boxcolor = "#AAA";
      this.properties.channel = midi_event.channel;
      this.properties.cmd = midi_event.cmd;
      this.properties.min_value = this.properties.max_value =
        midi_event.data[1];
    } else {
      if (
        this.properties.channel != -1 &&
        midi_event.channel != this.properties.channel
      ) {
        return;
      }
      if (this.properties.cmd != -1 && midi_event.cmd != this.properties.cmd) {
        return;
      }
      if (
        this.properties.min_value != -1 &&
        midi_event.data[1] < this.properties.min_value
      ) {
        return;
      }
      if (
        this.properties.max_value != -1 &&
        midi_event.data[1] > this.properties.max_value
      ) {
        return;
      }
    }

    this.trigger("on_midi", midi_event);
  }
}

LGMIDIFilter["@cmd"] = {
  type: "enum",
  title: "Command",
  values: MIDIEvent.commands_reversed,
};
