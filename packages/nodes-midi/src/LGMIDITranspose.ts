import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";

export default  function LGMIDITranspose() {
  this.properties = {
      amount: 0
  };
  this.addInput("in", BuiltInSlotType.ACTION);
  this.addInput("amount", "number");
  this.addOutput("out", BuiltInSlotType.EVENT);

  this.midi_event = new MIDIEvent();
}

LGMIDITranspose.title = "MIDI Transpose";
LGMIDITranspose.desc = "Transpose a MIDI note";
LGMIDITranspose.color = MIDI_COLOR;

LGMIDITranspose.prototype.onAction = function(event, midi_event) {
  if (!midi_event || midi_event.constructor !== MIDIEvent) {
      return;
  }

  if (
      midi_event.data[0] == MIDIEvent.NOTEON ||
      midi_event.data[0] == MIDIEvent.NOTEOFF
  ) {
      this.midi_event = new MIDIEvent();
      this.midi_event.setup(midi_event.data);
      this.midi_event.data[1] = Math.round(
          this.midi_event.data[1] + this.properties.amount
      );
      this.trigger("out", this.midi_event);
  } else {
      this.trigger("out", midi_event);
  }
};

LGMIDITranspose.prototype.onExecute = function() {
  var amount = this.getInputData(1);
  if (amount != null) {
      this.properties.amount = amount;
  }
};
