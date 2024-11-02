
export default function LGMIDICC() {
  this.properties = {
      //		channel: 0,
      cc: 1,
      value: 0
  };

  this.addOutput("value", "number");
}

LGMIDICC.title = "MIDICC";
LGMIDICC.desc = "gets a Controller Change";
LGMIDICC.color = MIDI_COLOR;

LGMIDICC.prototype.onExecute = function() {
  var props = this.properties;
  if (MIDIInterface.input) {
      this.properties.value =
          MIDIInterface.input.state.cc[this.properties.cc];
  }
  this.setOutputData(0, this.properties.value);
};
