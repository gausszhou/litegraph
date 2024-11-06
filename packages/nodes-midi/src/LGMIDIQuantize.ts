import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";
import LGMIDIGenerator from "./LGMIDIGenerator";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default  class LGMIDIQuantize extends LGraphNode {
    static title = "MIDI Quantize Pitch";
    static desc = "Transpose a MIDI note tp fit an scale";
    static color = MIDI_COLOR;
    offset_notes
    valid_notes
    _current_scale: number;
    notes_pitches
    midi_event: MIDIEvent
    constructor() {
        super();
     this.properties = {
         scale: "A,A#,B,C,C#,D,D#,E,F,F#,G,G#"
     };
     this.addInput("note", BuiltInSlotType.ACTION);
     this.addInput("scale", "string");
     this.addOutput("out", BuiltInSlotType.EVENT);

     this.valid_notes = new Array(12);
     this.offset_notes = new Array(12);
     this.processScale(this.properties.scale);
   }

    onPropertyChanged(name, value) {
      if (name == "scale") {
          this.processScale(value);
      }
    }

    processScale(scale) {
      this._current_scale = scale;
      this.notes_pitches = LGMIDIGenerator.processScale(scale);
      for (var i = 0; i < 12; ++i) {
          this.valid_notes[i] = this.notes_pitches.indexOf(i) != -1;
      }
      for (var i = 0; i < 12; ++i) {
          if (this.valid_notes[i]) {
              this.offset_notes[i] = 0;
              continue;
          }
          for (var j = 1; j < 12; ++j) {
              if (this.valid_notes[(i - j) % 12]) {
                  this.offset_notes[i] = -j;
                  break;
              }
              if (this.valid_notes[(i + j) % 12]) {
                  this.offset_notes[i] = j;
                  break;
              }
          }
      }
    }

    onAction(event, midi_event) {
      if (!midi_event || midi_event.constructor !== MIDIEvent) {
          return;
      }

      if (
          midi_event.data[0] == MIDIEvent.NOTEON ||
          midi_event.data[0] == MIDIEvent.NOTEOFF
      ) {
          this.midi_event = new MIDIEvent();
          this.midi_event.setup(midi_event.data);
          var note = midi_event.note;
          var index = MIDIEvent.note_to_index[note];
          var offset = this.offset_notes[index];
          this.midi_event.data[1] += offset;
          this.trigger("out", this.midi_event);
      } else {
          this.trigger("out", midi_event);
      }
    }

    onExecute() {
      var scale = this.getInputData(1);
      if (scale != null && scale != this._current_scale) {
          this.processScale(scale);
      }
    }
}

