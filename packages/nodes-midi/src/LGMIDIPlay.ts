export default function LGMIDIPlay() {
  this.properties = {
      volume: 0.5,
      duration: 1
  };
  this.addInput("note", LiteGraph.ACTION);
  this.addInput("volume", "number");
  this.addInput("duration", "number");
  this.addOutput("note", LiteGraph.EVENT);

  if (typeof AudioSynth == "undefined") {
      console.error(
          "Audiosynth.js not included, LGMidiPlay requires that library"
      );
      this.boxcolor = "red";
  } else {
      var Synth = (this.synth = new AudioSynth());
      this.instrument = Synth.createInstrument("piano");
  }
}

LGMIDIPlay.title = "MIDI Play";
LGMIDIPlay.desc = "Plays a MIDI note";
LGMIDIPlay.color = MIDI_COLOR;

LGMIDIPlay.prototype.onAction = function(event, midi_event) {
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
};

LGMIDIPlay.prototype.onExecute = function() {
  var volume = this.getInputData(1);
  if (volume != null) {
      this.properties.volume = volume;
  }

  var duration = this.getInputData(2);
  if (duration != null) {
      this.properties.duration = duration;
  }
};