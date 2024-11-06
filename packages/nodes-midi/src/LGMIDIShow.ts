import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default  class LGMIDIShow extends LGraphNode {
  static title = "MIDI Show";
  static desc = "Shows MIDI in the graph";
  static color = MIDI_COLOR;
  _str

  constructor() {
    super();
   this.addInput("on_midi", BuiltInSlotType.EVENT);
   this._str = "";
   this.size = [200, 40];
 }

  getTitle() {
    if (this.flags.collapsed) {
      return this._str;
    }
    return this.title;
  }

  onAction(event, midi_event) {
    if (!midi_event) {
      return;
    }
    if (midi_event.constructor === MIDIEvent) {
      this._str = midi_event.toString();
    } else {
      this._str = "???";
    }
  }

  onDrawForeground(ctx) {
    if (!this._str || this.flags.collapsed) {
      return;
    }

    ctx.font = "30px Arial";
    ctx.fillText(this._str, 10, this.size[1] * 0.8);
  }

  onGetInputs() {
    return [["in", BuiltInSlotType.ACTION]];
  }

  onGetOutputs() {
    return [["on_midi", BuiltInSlotType.EVENT]];
  }
}
