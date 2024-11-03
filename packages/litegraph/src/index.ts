import { LiteGraph } from "@gausszhou/litegraph-core";
import NodeAudio from "@gausszhou/litegraph-nodes-audio";
import NodeBasic from "@gausszhou/litegraph-nodes-basic";
import NodeEvents from "@gausszhou/litegraph-nodes-events";
import NodeGraphics from "@gausszhou/litegraph-nodes-graphics";
import NodeInput from "@gausszhou/litegraph-nodes-input";
import NodeLogic from "@gausszhou/litegraph-nodes-logic";
import NodeMath from "@gausszhou/litegraph-nodes-math";
import NodeMIDI from "@gausszhou/litegraph-nodes-midi";
import NodeStrings from "@gausszhou/litegraph-nodes-strings";
import NodeWidget from "@gausszhou/litegraph-nodes-widget";

LiteGraph.use(NodeAudio);
LiteGraph.use(NodeBasic);
LiteGraph.use(NodeEvents);
LiteGraph.use(NodeGraphics);
LiteGraph.use(NodeInput);
LiteGraph.use(NodeLogic);
LiteGraph.use(NodeMath);
LiteGraph.use(NodeMIDI);
LiteGraph.use(NodeStrings);
LiteGraph.use(NodeWidget);

export * from "@gausszhou/litegraph-core";
