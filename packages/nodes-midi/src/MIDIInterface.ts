import { LGraphNode } from "@gausszhou/litegraph-core";
import MIDIEvent from "./MIDIEvent";

export default class MIDIInterface extends LGraphNode {
  
  static input = null;
  static output = null;
  static MIDIEvent = MIDIEvent;
  static on_message
  num_input_ports
  num_output_ports
  error
  on_ready
  on_error
  state
  input_ports
  input_ports_info
  output_ports
  output_ports_info
  midi
  constructor(on_ready, on_error?) {
    super();
    if (!navigator.requestMIDIAccess) {
      this.error = "not suppoorted";
      if (on_error) {
        on_error("Not supported");
      } else {
        console.error("MIDI NOT SUPPORTED, enable by chrome://flags");
      }
      return;
    }

    this.on_ready = on_ready;

    this.state = {
      note: [],
      cc: [],
    };

    this.input_ports = null;
    this.input_ports_info = [];
    this.output_ports = null;
    this.output_ports_info = [];

    navigator
      .requestMIDIAccess()
      .then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
  }

  static parseMsg(data) {}

  onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    console.log(midiAccess);
    this.midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
    this.updatePorts();

    if (this.on_ready) {
      this.on_ready(this);
    }
  }

  updatePorts() {
    var midi = this.midi;
    this.input_ports = midi.inputs;
    this.input_ports_info = [];
    this.output_ports = midi.outputs;
    this.output_ports_info = [];

    var num = 0;

    var it = this.input_ports.values();
    var it_value = it.next();
    while (it_value && it_value.done === false) {
      var port_info = it_value.value;
      this.input_ports_info.push(port_info);
      console.log(
        "Input port [type:'" +
          port_info.type +
          "'] id:'" +
          port_info.id +
          "' manufacturer:'" +
          port_info.manufacturer +
          "' name:'" +
          port_info.name +
          "' version:'" +
          port_info.version +
          "'"
      );
      num++;
      it_value = it.next();
    }
    this.num_input_ports = num;

    num = 0;
    var it = this.output_ports.values();
    var it_value = it.next();
    while (it_value && it_value.done === false) {
      var port_info = it_value.value;
      this.output_ports_info.push(port_info);
      console.log(
        "Output port [type:'" +
          port_info.type +
          "'] id:'" +
          port_info.id +
          "' manufacturer:'" +
          port_info.manufacturer +
          "' name:'" +
          port_info.name +
          "' version:'" +
          port_info.version +
          "'"
      );
      num++;
      it_value = it.next();
    }
    this.num_output_ports = num;
  }

  onMIDIFailure(msg) {
    console.error("Failed to get MIDI access - " + msg);
  }

  openInputPort(port, callback) {
    var input_port = this.input_ports.get("input-" + port);
    if (!input_port) {
      return false;
    }
    var that = this;

    input_port.onmidimessage = function (a) {
      var midi_event = new MIDIEvent(a.data);
      that.updateState(midi_event);
      if (callback) {
        callback(a.data, midi_event);
      }
      if (MIDIInterface.on_message) {
        MIDIInterface.on_message(a.data, midi_event);
      }
    };
    console.log("port open: ", input_port);
    return true;
  }

  updateState(midi_event) {
    switch (midi_event.cmd) {
      case MIDIEvent.NOTEON:
        this.state.note[midi_event.value1 | 0] = midi_event.value2;
        break;
      case MIDIEvent.NOTEOFF:
        this.state.note[midi_event.value1 | 0] = 0;
        break;
      case MIDIEvent.CONTROLLERCHANGE:
        this.state.cc[midi_event.getCC()] = midi_event.getCCValue();
        break;
    }
  }

  sendMIDI(port, midi_data) {
    if (!midi_data) {
      return;
    }

    var output_port = this.output_ports_info[port]; //this.output_ports.get("output-" + port);
    if (!output_port) {
      return;
    }

    if (midi_data.constructor === MIDIEvent) {
      output_port.send(midi_data.data);
    } else {
      output_port.send(midi_data);
    }
  }
}
