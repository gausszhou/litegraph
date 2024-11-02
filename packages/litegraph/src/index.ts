import { LiteGraph } from "@gausszhou/litegraph-core";
import NodeBasic from "@gausszhou/litegraph-nodes-basic";
import NodeEvents from "@gausszhou/litegraph-nodes-events";
import NodeLogic from "@gausszhou/litegraph-nodes-logic";
import NodeMath from "@gausszhou/litegraph-nodes-math";
import NodeStrings from "@gausszhou/litegraph-nodes-strings";

LiteGraph.use(NodeBasic);
LiteGraph.use(NodeEvents);
LiteGraph.use(NodeLogic);
LiteGraph.use(NodeMath);
LiteGraph.use(NodeStrings);

export * from "@gausszhou/litegraph-core";
