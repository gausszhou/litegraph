import { LiteGraph } from "@litegraph/core";
import NodeBasic from "@litegraph/nodes-basic";
import NodeLogic from "@litegraph/nodes-logic";
import NodeMath from "@litegraph/nodes-math";

LiteGraph.use(NodeBasic);
LiteGraph.use(NodeLogic);
LiteGraph.use(NodeMath);

export * from "@litegraph/core";
