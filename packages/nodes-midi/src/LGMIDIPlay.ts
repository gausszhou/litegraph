import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default class LGMIDIPlay extends LGraphNode {
    static title = "MIDI Play";
    static desc = "Plays a MIDI note";
    static color = MIDI_COLOR;
    instrument
    synth
    constructor() {
    super();
      this.properties = {
          volume: 0.5,
          duration: 1
      };
      this.addInput("note", BuiltInSlotType.ACTION);
      this.addInput("volume", "number");
      this.addInput("duration", "number");
      this.addOutput("note", BuiltInSlotType.EVENT);

      if (typeof (window as any).AudioSynth == "undefined") {
          console.error(
              "Audiosynth.js not included, LGMidiPlay requires that library"
          );
          this.boxcolor = "red";
      } else {
          var Synth = (this.synth = new (window as any).AudioSynth());
          this.instrument = Synth.createInstrument("piano");
      }
    }

    onAction(event, midi_event) {
      if (!midi_event || midi_event.constructor !== MIDIEvent) {
          return;
      }

      if (this.instrument && midi_event.data[0] == MIDIEvent.NOTEON) {
          var note = midi_event.note; //C#
          if (!note || note == "undefined" || note.constructor !== String) {
              return;
          }
          this.instrument.play(
              note,
              midi_event.octave,
              this.properties.duration,
              this.properties.volume
          );
      }
      this.trigger("note", midi_event);
    }

    onExecute() {
      var volume = this.getInputData(1);
      if (volume != null) {
          this.properties.volume = volume;
      }

      var duration = this.getInputData(2);
      if (duration != null) {
          this.properties.duration = duration;
      }
    }
}