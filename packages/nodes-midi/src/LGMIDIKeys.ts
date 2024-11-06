import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";
import { LGraphNode } from "@gausszhou/litegraph-core";


export default class LGMIDIKeys  extends LGraphNode{
    static title = "MIDI Keys";
    static desc = "Keyboard to play notes";
    static color = MIDI_COLOR;

    static keys = [
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
    keys
    _last_key
    constructor() {
        super();
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

    onDrawForeground(ctx) {
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
    }

    getKeyIndex(pos) {
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
    }

    onAction(event, params) {
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
    }

    onMouseDown(e, pos) {
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
    }

    onMouseMove(e, pos) {
      if (pos[1] < 0 || this._last_key == -1) {
          return;
      }
      this.setDirtyCanvas(true);
      const index = this.getKeyIndex(pos);
      if (this._last_key == index) {
          return true;
      }
      this.keys[this._last_key] = false;
      const pitch1 = (this.properties.start_octave - 1) * 12 + 29 + this._last_key;
      const midi_event1 = new MIDIEvent();
      midi_event1.setup([MIDIEvent.NOTEOFF, pitch1, 100]);
      this.trigger("note", midi_event1);

      this.keys[index] = true;
      const pitch2 = (this.properties.start_octave - 1) * 12 + 29 + index;
      const midi_event2 = new MIDIEvent();
      midi_event2.setup([MIDIEvent.NOTEON, pitch2, 100]);
      this.trigger("note", midi_event2);

      this._last_key = index;
      return true;
    }

    onMouseUp(e, pos) {
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
    }
}
