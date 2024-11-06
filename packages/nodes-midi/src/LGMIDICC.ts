import { LGraphNode } from "@gausszhou/litegraph-core";
import { MIDI_COLOR } from "./MIDIEvent";
import MIDIInterface from "./MIDIInterface";

export default class LGMIDICC extends LGraphNode {
  static title = "MIDICC";
  static desc = "gets a Controller Change";
  static color = MIDI_COLOR;

  constructor() {
    super();
    this.properties = {
        channel: 0,
        cc: 1,
        value: 0
    };

    this.addOutput("value", "number");
  }

  onExecute() {
    var props = this.properties;
    if (MIDIInterface.input) {
        this.properties.value =
            MIDIInterface.input.state.cc[this.properties.cc];
    }
    this.setOutputData(0, this.properties.value);
  }
}
