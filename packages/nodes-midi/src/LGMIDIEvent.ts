import { clamp, LGraphNode } from "@gausszhou/litegraph-core";
import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";

export default class LGMIDIEvent extends LGraphNode {
  static title = "MIDIEvent";
  static desc = "Create a MIDI Event";
  static color = MIDI_COLOR;
  midi_event
  gate
  constructor() {
    super();
    this.properties = {
      channel: 0,
      cmd: 144, //0x90
      value1: 1,
      value2: 1,
    };

    this.addInput("send", BuiltInSlotType.EVENT);
    this.addInput("assign", BuiltInSlotType.EVENT);
    this.addOutput("on_midi", BuiltInSlotType.EVENT);

    this.midi_event = new MIDIEvent();
    this.gate = false;
  }

  onAction(event, midi_event) {
    if (event == "assign") {
      this.properties.channel = midi_event.channel;
      this.properties.cmd = midi_event.cmd;
      this.properties.value1 = midi_event.data[1];
      this.properties.value2 = midi_event.data[2];
      if (midi_event.cmd == MIDIEvent.NOTEON) {
        this.gate = true;
      } else if (midi_event.cmd == MIDIEvent.NOTEOFF) {
        this.gate = false;
      }
      return;
    }

    //send
    var midi_event = this.midi_event;
    midi_event.channel = this.properties.channel;
    if (this.properties.cmd && this.properties.cmd.constructor === String) {
      midi_event.setCommandFromString(this.properties.cmd);
    } else {
      midi_event.cmd = this.properties.cmd;
    }
    midi_event.data[0] = midi_event.cmd | midi_event.channel;
    midi_event.data[1] = Number(this.properties.value1);
    midi_event.data[2] = Number(this.properties.value2);

    this.trigger("on_midi", midi_event);
  }

  onExecute() {
    var props = this.properties;

    if (this.inputs) {
      for (var i = 0; i < this.inputs.length; ++i) {
        var input = this.inputs[i];
        if (input.link == -1) {
          continue;
        }
        switch (input.name) {
          case "note":
            var v = this.getInputData(i);
            if (v != null) {
              if (v.constructor === String) {
                v = MIDIEvent.NoteStringToPitch(v);
              }
              this.properties.value1 = (v | 0) % 255;
            }
            break;
          case "cmd":
            var v = this.getInputData(i);
            if (v != null) {
              this.properties.cmd = v;
            }
            break;
          case "value1":
            var v = this.getInputData(i);
            if (v != null) {
              this.properties.value1 = clamp(v | 0, 0, 127);
            }
            break;
          case "value2":
            var v = this.getInputData(i);
            if (v != null) {
              this.properties.value2 = clamp(v | 0, 0, 127);
            }
            break;
        }
      }
    }

    if (this.outputs) {
      for (var i = 0; i < this.outputs.length; ++i) {
        var output = this.outputs[i];
        var v = null;
        switch (output.name) {
          case "midi":
            v = new MIDIEvent();
            v.setup([props.cmd, props.value1, props.value2]);
            v.channel = props.channel;
            break;
          case "command":
            v = props.cmd;
            break;
          case "cc":
            v = props.value1;
            break;
          case "cc_value":
            v = props.value2;
            break;
          case "note":
            v =
              props.cmd == MIDIEvent.NOTEON || props.cmd == MIDIEvent.NOTEOFF
                ? props.value1
                : null;
            break;
          case "velocity":
            v = props.cmd == MIDIEvent.NOTEON ? props.value2 : null;
            break;
          case "pitch":
            v =
              props.cmd == MIDIEvent.NOTEON
                ? MIDIEvent.computePitch(props.value1)
                : null;
            break;
          case "pitchbend":
            v =
              props.cmd == MIDIEvent.PITCHBEND
                ? MIDIEvent.computePitchBend(props.value1, props.value2)
                : null;
            break;
          case "gate":
            v = this.gate;
            break;
          default:
            continue;
        }
        if (v !== null) {
          this.setOutputData(i, v);
        }
      }
    }
  }

  onPropertyChanged(name, value) {
    if (name == "cmd") {
      this.properties.cmd = MIDIEvent.computeCommandFromString(value);
    }
  }

  onGetInputs() {
    return [
      ["cmd", "number"],
      ["note", "number"],
      ["value1", "number"],
      ["value2", "number"],
    ];
  }

  onGetOutputs() {
    return [
      ["midi", "midi"],
      ["on_midi", BuiltInSlotType.EVENT],
      ["command", "number"],
      ["note", "number"],
      ["velocity", "number"],
      ["cc", "number"],
      ["cc_value", "number"],
      ["pitch", "number"],
      ["gate", "bool"],
      ["pitchbend", "number"],
    ];
  }
}
