export default function LGMIDIShow() {
  this.addInput("on_midi", LiteGraph.EVENT);
  this._str = "";
  this.size = [200, 40];
}

LGMIDIShow.title = "MIDI Show";
LGMIDIShow.desc = "Shows MIDI in the graph";
LGMIDIShow.color = MIDI_COLOR;

LGMIDIShow.prototype.getTitle = function () {
  if (this.flags.collapsed) {
    return this._str;
  }
  return this.title;
};

LGMIDIShow.prototype.onAction = function (event, midi_event) {
  if (!midi_event) {
    return;
  }
  if (midi_event.constructor === MIDIEvent) {
    this._str = midi_event.toString();
  } else {
    this._str = "???";
  }
};

LGMIDIShow.prototype.onDrawForeground = function (ctx) {
  if (!this._str || this.flags.collapsed) {
    return;
  }

  ctx.font = "30px Arial";
  ctx.fillText(this._str, 10, this.size[1] * 0.8);
};

LGMIDIShow.prototype.onGetInputs = function () {
  return [["in", LiteGraph.ACTION]];
};

LGMIDIShow.prototype.onGetOutputs = function () {
  return [["on_midi", LiteGraph.EVENT]];
};
