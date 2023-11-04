import LiteGraph from "../../core/LiteGraph";
import LogicAnd from "./LogicAnd";
import LogicBranch from "./LogicBranch";
import LogicCompare from "./LogicCompare";
import LogicNot from "./LogicNot";
import LogicOr from "./LogicOr";
import Selector from "./Selector";
import Sequence from "./Sequence";

const install = (LiteGraph: LiteGraph) => {
  LiteGraph.registerNodeType("logic/AND", LogicAnd);
  LiteGraph.registerNodeType("logic/OR", LogicOr);
  LiteGraph.registerNodeType("logic/NOT", LogicNot);
  LiteGraph.registerNodeType("logic/Branch", LogicBranch);
  LiteGraph.registerNodeType("logic/Compare", LogicCompare);
  LiteGraph.registerNodeType("logic/Selector", Selector);
  LiteGraph.registerNodeType("logic/Sequence", Sequence);
};

export default { install };
