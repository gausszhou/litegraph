import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import MIDIEvent, { MIDI_COLOR } from "./MIDIEvent";
import { LGraphNode, LiteGraph } from "@gausszhou/litegraph-core";

export default class LGMIDIFromFile extends LGraphNode {
  static title = "MIDI fromFile";
  static desc = "Plays a MIDI file";
  static color = MIDI_COLOR;
  _midi
  _current_time: number
  _playing: boolean
  constructor() {
    super();
    this.properties = {
      url: "",
      autoplay: true,
    };

    this.addInput("play", BuiltInSlotType.ACTION);
    this.addInput("pause", BuiltInSlotType.ACTION);
    this.addOutput("note", BuiltInSlotType.EVENT);
    this._midi = null;
    this._current_time = 0;
    this._playing = false;

    if (typeof (window as any).MidiParser == "undefined") {
      console.error(
        "midi-parser.js not included, LGMidiPlay requires that library: https://raw.githubusercontent.com/colxi/midi-parser-js/master/src/main.js"
      );
      this.boxcolor = "red";
    }
  }

  onAction(name) {
    if (name == "play") this.play();
    else if (name == "pause") this._playing = !this._playing;
  }

  onPropertyChanged(name, value) {
    if (name == "url") this.loadMIDIFile(value);
  }

  onExecute() {
    if (!this._midi) return;

    if (!this._playing) return;

    this._current_time += this.graph.elapsed_time;
    var current_time = this._current_time * 100;

    for (var i = 0; i < this._midi.tracks; ++i) {
      var track = this._midi.track[i];
      if (!track._last_pos) {
        track._last_pos = 0;
        track._time = 0;
      }

      var elem = track.event[track._last_pos];
      if (elem && track._time + elem.deltaTime <= current_time) {
        track._last_pos++;
        track._time += elem.deltaTime;

        if (elem.data) {
          var midi_cmd = elem.type << (4 + elem.channel);
          var midi_event = new MIDIEvent();
          midi_event.setup([midi_cmd, elem.data[0], elem.data[1]]);
          this.trigger("note", midi_event);
        }
      }
    }
  }

  play() {
    this._playing = true;
    this._current_time = 0;
    if (!this._midi) return;

    for (var i = 0; i < this._midi.tracks; ++i) {
      var track = this._midi.track[i];
      track._last_pos = 0;
      track._time = 0;
    }
  }

  loadMIDIFile(url) {
    var that = this;
    (LiteGraph as any).fetchFile(
      url,
      "arraybuffer",
      function (data) {
        that.boxcolor = "#AFA";
        that._midi = (window as any).MidiParser.parse(new Uint8Array(data));
        if (that.properties.autoplay) that.play();
      },
      function (err) {
        that.boxcolor = "#FAA";
        that._midi = null;
      }
    );
  }

  onDropFile(file) {
    this.properties.url = "";
    this.loadMIDIFile(file);
  }
}
