import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";


export default  function LGMIDIKeys() {
  this.properties = {
      num_octaves: 2,
      start_octave: 2
  };
  this.addInput("note", BuiltInSlotType.ACTION);
  this.addInput("reset", BuiltInSlotType.ACTION);
  this.addOutput("note", BuiltInSlotType.EVENT);
  this.size = [400, 100];
  this.keys = [];
  this._last_key = -1;
}

LGMIDIKeys.title = "MIDI Keys";
LGMIDIKeys.desc = "Keyboard to play notes";
LGMIDIKeys.color = MIDI_COLOR;

LGMIDIKeys.keys = [
  { x: 0, w: 1, h: 1, t: 0 },
  { x: 0.75, w: 0.5, h: 0.6, t: 1 },
  { x: 1, w: 1, h: 1, t: 0 },
  { x: 1.75, w: 0.5, h: 0.6, t: 1 },
  { x: 2, w: 1, h: 1, t: 0 },
  { x: 2.75, w: 0.5, h: 0.6, t: 1 },
  { x: 3, w: 1, h: 1, t: 0 },
  { x: 4, w: 1, h: 1, t: 0 },
  { x: 4.75, w: 0.5, h: 0.6, t: 1 },
  { x: 5, w: 1, h: 1, t: 0 },
  { x: 5.75, w: 0.5, h: 0.6, t: 1 },
  { x: 6, w: 1, h: 1, t: 0 }
];

LGMIDIKeys.prototype.onDrawForeground = function(ctx) {
  if (this.flags.collapsed) {
      return;
  }

  var num_keys = this.properties.num_octaves * 12;
  this.keys.length = num_keys;
  var key_width = this.size[0] / (this.properties.num_octaves * 7);
  var key_height = this.size[1];

  ctx.globalAlpha = 1;

  for (
      var k = 0;
      k < 2;
      k++ //draw first whites (0) then blacks (1)
  ) {
      for (var i = 0; i < num_keys; ++i) {
          var key_info = LGMIDIKeys.keys[i % 12];
          if (key_info.t != k) {
              continue;
          }
          var octave = Math.floor(i / 12);
          var x = octave * 7 * key_width + key_info.x * key_width;
          if (k == 0) {
              ctx.fillStyle = this.keys[i] ? "#CCC" : "white";
          } else {
              ctx.fillStyle = this.keys[i] ? "#333" : "black";
          }
          ctx.fillRect(
              x + 1,
              0,
              key_width * key_info.w - 2,
              key_height * key_info.h
          );
      }
  }
};

LGMIDIKeys.prototype.getKeyIndex = function(pos) {
  var num_keys = this.properties.num_octaves * 12;
  var key_width = this.size[0] / (this.properties.num_octaves * 7);
  var key_height = this.size[1];

  for (
      var k = 1;
      k >= 0;
      k-- //test blacks first (1) then whites (0)
  ) {
      for (var i = 0; i < this.keys.length; ++i) {
          var key_info = LGMIDIKeys.keys[i % 12];
          if (key_info.t != k) {
              continue;
          }
          var octave = Math.floor(i / 12);
          var x = octave * 7 * key_width + key_info.x * key_width;
          var w = key_width * key_info.w;
          var h = key_height * key_info.h;
          if (pos[0] < x || pos[0] > x + w || pos[1] > h) {
              continue;
          }
          return i;
      }
  }
  return -1;
};

LGMIDIKeys.prototype.onAction = function(event, params) {
  if (event == "reset") {
      for (var i = 0; i < this.keys.length; ++i) {
          this.keys[i] = false;
      }
      return;
  }

  if (!params || params.constructor !== MIDIEvent) {
      return;
  }
  var midi_event = params;
  var start_note = (this.properties.start_octave - 1) * 12 + 29;
  var index = midi_event.data[1] - start_note;
  if (index >= 0 && index < this.keys.length) {
      if (midi_event.data[0] == MIDIEvent.NOTEON) {
          this.keys[index] = true;
      } else if (midi_event.data[0] == MIDIEvent.NOTEOFF) {
          this.keys[index] = false;
      }
  }

  this.trigger("note", midi_event);
};

LGMIDIKeys.prototype.onMouseDown = function(e, pos) {
  if (pos[1] < 0) {
      return;
  }
  var index = this.getKeyIndex(pos);
  this.keys[index] = true;
  this._last_key = index;
  var pitch = (this.properties.start_octave - 1) * 12 + 29 + index;
  var midi_event = new MIDIEvent();
  midi_event.setup([MIDIEvent.NOTEON, pitch, 100]);
  this.trigger("note", midi_event);
  return true;
};

LGMIDIKeys.prototype.onMouseMove = function(e, pos) {
  if (pos[1] < 0 || this._last_key == -1) {
      return;
  }
  this.setDirtyCanvas(true);
  var index = this.getKeyIndex(pos);
  if (this._last_key == index) {
      return true;
  }
  this.keys[this._last_key] = false;
  var pitch =
      (this.properties.start_octave - 1) * 12 + 29 + this._last_key;
  var midi_event = new MIDIEvent();
  midi_event.setup([MIDIEvent.NOTEOFF, pitch, 100]);
  this.trigger("note", midi_event);

  this.keys[index] = true;
  var pitch = (this.properties.start_octave - 1) * 12 + 29 + index;
  var midi_event = new MIDIEvent();
  midi_event.setup([MIDIEvent.NOTEON, pitch, 100]);
  this.trigger("note", midi_event);

  this._last_key = index;
  return true;
};

LGMIDIKeys.prototype.onMouseUp = function(e, pos) {
  if (pos[1] < 0) {
      return;
  }
  var index = this.getKeyIndex(pos);
  this.keys[index] = false;
  this._last_key = -1;
  var pitch = (this.properties.start_octave - 1) * 12 + 29 + index;
  var midi_event = new MIDIEvent();
  midi_event.setup([MIDIEvent.NOTEOFF, pitch, 100]);
  this.trigger("note", midi_event);
  return true;
};
