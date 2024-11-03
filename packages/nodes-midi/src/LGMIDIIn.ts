import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import { MIDI_COLOR } from "./MIDIEvent";
import MIDIInterface from "./MIDIInterface";
import { LiteUtils } from "@gausszhou/litegraph-core";

export default  function LGMIDIIn() {
  this.addOutput("on_midi", BuiltInSlotType.EVENT);
  this.addOutput("out", "midi");
  this.properties = { port: 0 };
  this._last_midi_event = null;
  this._current_midi_event = null;
  this.boxcolor = "#AAA";
  this._last_time = 0;

  var that = this;
  new MIDIInterface(function(midi) {
      //open
      that._midi = midi;
      if (that._waiting) {
          that.onStart();
      }
      that._waiting = false;
  });
}

LGMIDIIn.MIDIInterface = MIDIInterface;

LGMIDIIn.title = "MIDI Input";
LGMIDIIn.desc = "Reads MIDI from a input port";
LGMIDIIn.color = MIDI_COLOR;

LGMIDIIn.prototype.getPropertyInfo = function(name) {
  if (!this._midi) {
      return;
  }

  if (name == "port") {
      var values = {};
      for (var i = 0; i < this._midi.input_ports_info.length; ++i) {
          var input = this._midi.input_ports_info[i];
          values[i] = i + ".- " + input.name + " version:" + input.version;
      }
      return { type: "enum", values: values };
  }
};

LGMIDIIn.prototype.onStart = function() {
  if (this._midi) {
      this._midi.openInputPort(
          this.properties.port,
          this.onMIDIEvent.bind(this)
      );
  } else {
      this._waiting = true;
  }
};

LGMIDIIn.prototype.onMIDIEvent = function(data, midi_event) {
  this._last_midi_event = midi_event;
  this.boxcolor = "#AFA";
  this._last_time = LiteUtils.getTime();
  this.trigger("on_midi", midi_event);
  if (midi_event.cmd == MIDIEvent.NOTEON) {
      this.trigger("on_noteon", midi_event);
  } else if (midi_event.cmd == MIDIEvent.NOTEOFF) {
      this.trigger("on_noteoff", midi_event);
  } else if (midi_event.cmd == MIDIEvent.CONTROLLERCHANGE) {
      this.trigger("on_cc", midi_event);
  } else if (midi_event.cmd == MIDIEvent.PROGRAMCHANGE) {
      this.trigger("on_pc", midi_event);
  } else if (midi_event.cmd == MIDIEvent.PITCHBEND) {
      this.trigger("on_pitchbend", midi_event);
  }
};

LGMIDIIn.prototype.onDrawBackground = function(ctx) {
  this.boxcolor = "#AAA";
  if (!this.flags.collapsed && this._last_midi_event) {
      ctx.fillStyle = "white";
      var now = LiteUtils.getTime();
      var f = 1.0 - Math.max(0, (now - this._last_time) * 0.001);
      if (f > 0) {
          var t = ctx.globalAlpha;
          ctx.globalAlpha *= f;
          ctx.font = "12px Tahoma";
          ctx.fillText(
              this._last_midi_event.toString(),
              2,
              this.size[1] * 0.5 + 3
          );
          //ctx.fillRect(0,0,this.size[0],this.size[1]);
          ctx.globalAlpha = t;
      }
  }
};

LGMIDIIn.prototype.onExecute = function() {
  if (this.outputs) {
      var last = this._last_midi_event;
      for (var i = 0; i < this.outputs.length; ++i) {
          var output = this.outputs[i];
          var v = null;
          switch (output.name) {
              case "midi":
                  v = this._midi;
                  break;
              case "last_midi":
                  v = last;
                  break;
              default:
                  continue;
          }
          this.setOutputData(i, v);
      }
  }
};

LGMIDIIn.prototype.onGetOutputs = function() {
  return [
      ["last_midi", "midi"],
      ["on_midi", BuiltInSlotType.EVENT],
      ["on_noteon", BuiltInSlotType.EVENT],
      ["on_noteoff", BuiltInSlotType.EVENT],
      ["on_cc", BuiltInSlotType.EVENT],
      ["on_pc", BuiltInSlotType.EVENT],
      ["on_pitchbend", BuiltInSlotType.EVENT]
  ];
};
