export const MIDI_COLOR = "#234"

export default function MIDIEvent(data?) {
    this.channel = 0;
    this.cmd = 0;
    this.data = new Uint32Array(3);

    if (data) {
        this.setup(data);
    }
}


MIDIEvent.prototype.fromJSON = function(o) {
    this.setup(o.data);
};

MIDIEvent.prototype.setup = function(data) {
    var raw_data = data;
    if (data.constructor === Object) {
        raw_data = data.data;
    }

    this.data.set(raw_data);

    var midiStatus = raw_data[0];
    this.status = midiStatus;

    var midiCommand = midiStatus & 0xf0;

    if (midiStatus >= 0xf0) {
        this.cmd = midiStatus;
    } else {
        this.cmd = midiCommand;
    }

    if (this.cmd == MIDIEvent.NOTEON && this.velocity == 0) {
        this.cmd = MIDIEvent.NOTEOFF;
    }

    this.cmd_str = MIDIEvent.commands[this.cmd] || "";

    if (
        midiCommand >= MIDIEvent.NOTEON ||
        midiCommand <= MIDIEvent.NOTEOFF
    ) {
        this.channel = midiStatus & 0x0f;
    }
};

Object.defineProperty(MIDIEvent.prototype, "velocity", {
    get: function() {
        if (this.cmd == MIDIEvent.NOTEON) {
            return this.data[2];
        }
        return -1;
    },
    set: function(v) {
        this.data[2] = v; //  v / 127;
    },
    enumerable: true
});

MIDIEvent.notes = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#"
];
MIDIEvent.note_to_index = {
    A: 0,
    "A#": 1,
    B: 2,
    C: 3,
    "C#": 4,
    D: 5,
    "D#": 6,
    E: 7,
    F: 8,
    "F#": 9,
    G: 10,
    "G#": 11
};

Object.defineProperty(MIDIEvent.prototype, "note", {
    get: function() {
        if (this.cmd != MIDIEvent.NOTEON) {
            return -1;
        }
        return MIDIEvent.toNoteString(this.data[1], true);
    },
    set: function(v) {
        throw "notes cannot be assigned this way, must modify the data[1]";
    },
    enumerable: true
});

Object.defineProperty(MIDIEvent.prototype, "octave", {
    get: function() {
        if (this.cmd != MIDIEvent.NOTEON) {
            return -1;
        }
        var octave = this.data[1] - 24;
        return Math.floor(octave / 12 + 1);
    },
    set: function(v) {
        throw "octave cannot be assigned this way, must modify the data[1]";
    },
    enumerable: true
});

//returns HZs
MIDIEvent.prototype.getPitch = function() {
    return Math.pow(2, (this.data[1] - 69) / 12) * 440;
};

MIDIEvent.computePitch = function(note) {
    return Math.pow(2, (note - 69) / 12) * 440;
};

MIDIEvent.prototype.getCC = function() {
    return this.data[1];
};

MIDIEvent.prototype.getCCValue = function() {
    return this.data[2];
};

//not tested, there is a formula missing here
MIDIEvent.prototype.getPitchBend = function() {
    return this.data[1] + (this.data[2] << 7) - 8192;
};

MIDIEvent.computePitchBend = function(v1, v2) {
    return v1 + (v2 << 7) - 8192;
};

MIDIEvent.prototype.setCommandFromString = function(str) {
    this.cmd = MIDIEvent.computeCommandFromString(str);
};

MIDIEvent.computeCommandFromString = function(str) {
    if (!str) {
        return 0;
    }

    if (str && str.constructor === Number) {
        return str;
    }

    str = str.toUpperCase();
    switch (str) {
        case "NOTE ON":
        case "NOTEON":
            return MIDIEvent.NOTEON;
            break;
        case "NOTE OFF":
        case "NOTEOFF":
            return MIDIEvent.NOTEON;
            break;
        case "KEY PRESSURE":
        case "KEYPRESSURE":
            return MIDIEvent.KEYPRESSURE;
            break;
        case "CONTROLLER CHANGE":
        case "CONTROLLERCHANGE":
        case "CC":
            return MIDIEvent.CONTROLLERCHANGE;
            break;
        case "PROGRAM CHANGE":
        case "PROGRAMCHANGE":
        case "PC":
            return MIDIEvent.PROGRAMCHANGE;
            break;
        case "CHANNEL PRESSURE":
        case "CHANNELPRESSURE":
            return MIDIEvent.CHANNELPRESSURE;
            break;
        case "PITCH BEND":
        case "PITCHBEND":
            return MIDIEvent.PITCHBEND;
            break;
        case "TIME TICK":
        case "TIMETICK":
            return MIDIEvent.TIMETICK;
            break;
        default:
            return Number(str); //assume its a hex code
    }
};

//transform from a pitch number to string like "C4"
MIDIEvent.toNoteString = function(d, skip_octave?) {
    d = Math.round(d); //in case it has decimals
    var note = d - 21;
    var octave = Math.floor((d - 24) / 12 + 1);
    note = note % 12;
    if (note < 0) {
        note = 12 + note;
    }
    return MIDIEvent.notes[note] + (skip_octave ? "" : octave);
};

MIDIEvent.NoteStringToPitch = function(str) {
    str = str.toUpperCase();
    var note = str[0];
    var octave = 4;

    if (str[1] == "#") {
        note += "#";
        if (str.length > 2) {
            octave = Number(str[2]);
        }
    } else {
        if (str.length > 1) {
            octave = Number(str[1]);
        }
    }
    var pitch = MIDIEvent.note_to_index[note];
    if (pitch == null) {
        return null;
    }
    return (octave - 1) * 12 + pitch + 21;
};

MIDIEvent.prototype.toString = function() {
    var str = "" + this.channel + ". ";
    switch (this.cmd) {
        case MIDIEvent.NOTEON:
            str += "NOTEON " + MIDIEvent.toNoteString(this.data[1]);
            break;
        case MIDIEvent.NOTEOFF:
            str += "NOTEOFF " + MIDIEvent.toNoteString(this.data[1]);
            break;
        case MIDIEvent.CONTROLLERCHANGE:
            str += "CC " + this.data[1] + " " + this.data[2];
            break;
        case MIDIEvent.PROGRAMCHANGE:
            str += "PC " + this.data[1];
            break;
        case MIDIEvent.PITCHBEND:
            str += "PITCHBEND " + this.getPitchBend();
            break;
        case MIDIEvent.KEYPRESSURE:
            str += "KEYPRESS " + this.data[1];
            break;
    }

    return str;
};

MIDIEvent.prototype.toHexString = function() {
    var str = "";
    for (var i = 0; i < this.data.length; i++) {
        str += this.data[i].toString(16) + " ";
    }
};

MIDIEvent.prototype.toJSON = function() {
    return {
        data: [this.data[0], this.data[1], this.data[2]],
        object_class: "MIDIEvent"
    };
};

MIDIEvent.NOTEOFF = 0x80;
MIDIEvent.NOTEON = 0x90;
MIDIEvent.KEYPRESSURE = 0xa0;
MIDIEvent.CONTROLLERCHANGE = 0xb0;
MIDIEvent.PROGRAMCHANGE = 0xc0;
MIDIEvent.CHANNELPRESSURE = 0xd0;
MIDIEvent.PITCHBEND = 0xe0;
MIDIEvent.TIMETICK = 0xf8;

MIDIEvent.commands = {
    0x80: "note off",
    0x90: "note on",
    0xa0: "key pressure",
    0xb0: "controller change",
    0xc0: "program change",
    0xd0: "channel pressure",
    0xe0: "pitch bend",
    0xf0: "system",
    0xf2: "Song pos",
    0xf3: "Song select",
    0xf6: "Tune request",
    0xf8: "time tick",
    0xfa: "Start Song",
    0xfb: "Continue Song",
    0xfc: "Stop Song",
    0xfe: "Sensing",
    0xff: "Reset"
};

MIDIEvent.commands_short = {
    0x80: "NOTEOFF",
    0x90: "NOTEOFF",
    0xa0: "KEYP",
    0xb0: "CC",
    0xc0: "PC",
    0xd0: "CP",
    0xe0: "PB",
    0xf0: "SYS",
    0xf2: "POS",
    0xf3: "SELECT",
    0xf6: "TUNEREQ",
    0xf8: "TT",
    0xfa: "START",
    0xfb: "CONTINUE",
    0xfc: "STOP",
    0xfe: "SENS",
    0xff: "RESET"
};

MIDIEvent.commands_reversed = {};

for (var i in MIDIEvent.commands) {
    MIDIEvent.commands_reversed[MIDIEvent.commands[i]] = i;
}