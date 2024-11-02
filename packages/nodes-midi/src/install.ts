import LGMIDICC from "./LGMIDICC";
import LGMIDIEvent from "./LGMIDIEvent";
import LGMIDIFilter from "./LGMIDIFilter";
import LGMIDIFromFile from "./LGMIDIFromFile";
import LGMIDIGenerator from "./LGMIDIGenerator";
import LGMIDIIn from "./LGMIDIIn";
import LGMIDIKeys from "./LGMIDIKeys";
import LGMIDIOut from "./LGMIDIOut";
import LGMIDIPlay from "./LGMIDIPlay";
import LGMIDIQuantize from "./LGMIDIQuantize";
import LGMIDIShow from "./LGMIDIShow";
import LGMIDITranspose from "./LGMIDITranspose";
import MIDIEvent from "./MIDIEvent";

export const install = (LiteGraph: any) => {
  LiteGraph.MIDIEvent = MIDIEvent;
  LiteGraph.registerNodeType("midi/input", LGMIDIIn);
  LiteGraph.registerNodeType("midi/output", LGMIDIOut);
  LiteGraph.registerNodeType("midi/show", LGMIDIShow);
  LiteGraph.registerNodeType("midi/filter", LGMIDIFilter);
  LiteGraph.registerNodeType("midi/event", LGMIDIEvent);
  LiteGraph.registerNodeType("midi/cc", LGMIDICC);
  LiteGraph.registerNodeType("midi/generator", LGMIDIGenerator);
  LiteGraph.registerNodeType("midi/transpose", LGMIDITranspose);
  LiteGraph.registerNodeType("midi/quantize", LGMIDIQuantize);
  LiteGraph.registerNodeType("midi/fromFile", LGMIDIFromFile);
  LiteGraph.registerNodeType("midi/play", LGMIDIPlay);
  LiteGraph.registerNodeType("midi/keys", LGMIDIKeys);
};
