import LiteGraph from "./LiteGraph";
import Subgraph from "./Subgraph";
import GraphInput from "./GraphInput";
import GraphOutput from "./GraphOutput";

LiteGraph.registerNodeType("graph/subgraph", Subgraph);
LiteGraph.registerNodeType("graph/input", GraphInput);
LiteGraph.registerNodeType("graph/output", GraphOutput);

export default LiteGraph;
