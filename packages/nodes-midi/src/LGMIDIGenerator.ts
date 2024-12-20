import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default class LGMIDIGenerator  extends LGraphNode {
    static title = "MIDI Generator";
    static desc = "Generates a random MIDI note";
    static color = MIDI_COLOR;
    notes_pitches
    sequence_index
    constructor() {
        super();
      this.addInput("generate", BuiltInSlotType.ACTION);
      this.addInput("scale", "string");
      this.addInput("octave", "number");
      this.addOutput("note", BuiltInSlotType.EVENT);
      this.properties = {
          notes: "A,A#,B,C,C#,D,D#,E,F,F#,G,G#",
          octave: 2,
          duration: 0.5,
          mode: "sequence"
      };

      this.notes_pitches = LGMIDIGenerator.processScale(
          this.properties.notes
      );
      this.sequence_index = 0;
    }

    static processScale(scale) {
      var notes = scale.split(",");
      for (var i = 0; i < notes.length; ++i) {
          var n = notes[i];
          if ((n.length == 2 && n[1] != "#") || n.length > 2) {
              notes[i] = - MIDIEvent.NoteStringToPitch(n);
          } else {
              notes[i] = MIDIEvent.note_to_index[n] || 0;
          }
      }
      return notes;
    }

    onPropertyChanged(name, value) {
      if (name == "notes") {
          this.notes_pitches = LGMIDIGenerator.processScale(value);
      }
    }

    onExecute() {
      var octave = this.getInputData(2);
      if (octave != null) {
          this.properties.octave = octave;
      }

      var scale = this.getInputData(1);
      if (scale) {
          this.notes_pitches = LGMIDIGenerator.processScale(scale);
      }
    }

    onAction(event) {
      //var range = this.properties.max - this.properties.min;
      //var pitch = this.properties.min + ((Math.random() * range)|0);
      var pitch = 0;
      var range = this.notes_pitches.length;
      var index = 0;

      if (this.properties.mode == "sequence") {
          index = this.sequence_index = (this.sequence_index + 1) % range;
      } else if (this.properties.mode == "random") {
          index = Math.floor(Math.random() * range);
      }

      var note = this.notes_pitches[index];
      if (note >= 0) {
          pitch = note + (this.properties.octave - 1) * 12 + 33;
      } else {
          pitch = -note;
      }

      const midi_event = new MIDIEvent();
      midi_event.setup([MIDIEvent.NOTEON, pitch, 10]);
      var duration = this.properties.duration || 1;
      this.trigger("note", midi_event);

      //noteoff
      setTimeout(
          function() {
              var midi_event = new MIDIEvent();
              midi_event.setup([MIDIEvent.NOTEOFF, pitch, 0]);
              this.trigger("note", midi_event);
          }.bind(this),
          duration * 1000
      );
    }
}