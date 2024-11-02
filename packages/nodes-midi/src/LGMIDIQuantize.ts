export default  function LGMIDIQuantize() {
  this.properties = {
      scale: "A,A#,B,C,C#,D,D#,E,F,F#,G,G#"
  };
  this.addInput("note", LiteGraph.ACTION);
  this.addInput("scale", "string");
  this.addOutput("out", LiteGraph.EVENT);

  this.valid_notes = new Array(12);
  this.offset_notes = new Array(12);
  this.processScale(this.properties.scale);
}

LGMIDIQuantize.title = "MIDI Quantize Pitch";
LGMIDIQuantize.desc = "Transpose a MIDI note tp fit an scale";
LGMIDIQuantize.color = MIDI_COLOR;

LGMIDIQuantize.prototype.onPropertyChanged = function(name, value) {
  if (name == "scale") {
      this.processScale(value);
  }
};

LGMIDIQuantize.prototype.processScale = function(scale) {
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
};

LGMIDIQuantize.prototype.onAction = function(event, midi_event) {
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
};

LGMIDIQuantize.prototype.onExecute = function() {
  var scale = this.getInputData(1);
  if (scale != null && scale != this._current_scale) {
      this.processScale(scale);
  }
};

