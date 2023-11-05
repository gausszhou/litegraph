import LiteGraph from "../../core/LiteGraph";
import Time from "./Time";
import ConstantNumber from "./ConstantNumber";
import ConstantBoolean from "./ConstantBoolean";

function length(v: string) {
  if (v && v.length != null) return Number(v.length);
  return 0;
}

function not(a:boolean) {
  return !a;
}

const install = (LiteGraph: LiteGraph) => {

  LiteGraph.registerNodeType("basic/time", Time);
  LiteGraph.registerNodeType("basic/const", ConstantNumber);
  LiteGraph.registerNodeType("basic/boolean", ConstantBoolean);
  LiteGraph.registerNodeType("basic/string", ConstantString);
  LiteGraph.registerNodeType("basic/object", ConstantObject);
  LiteGraph.registerNodeType("basic/file", ConstantFile);
  LiteGraph.registerNodeType("basic/data", ConstantData);
  LiteGraph.registerNodeType("basic/array", ConstantArray);

  LiteGraph.registerNodeType("basic/set_array", SetArray);
  LiteGraph.registerNodeType("basic/array[]", ArrayElement);
  LiteGraph.registerNodeType("basic/table[][]", TableElement);

  LiteGraph.registerNodeType("basic/object_property", ObjectProperty);
  LiteGraph.registerNodeType("basic/object_keys", ObjectKeys);
  LiteGraph.registerNodeType("basic/set_object", SetObject);
  LiteGraph.registerNodeType("basic/merge_objects", MergeObjects);

  LiteGraph.registerNodeType("basic/variable", Variable);
  LiteGraph.registerNodeType("basic/download", DownloadData);
  LiteGraph.registerNodeType("basic/watch", Watch);
  LiteGraph.registerNodeType("basic/cast", Cast);

  LiteGraph.registerNodeType("basic/console", Console);
  LiteGraph.registerNodeType("basic/alert", Alert);
  LiteGraph.registerNodeType("basic/script", NodeScript);
  LiteGraph.registerNodeType("basic/CompareValues", GenericCompare);

  LiteGraph.wrapFunctionAsNode("basic/length", length, [""], "number");
  LiteGraph.wrapFunctionAsNode("basic/not", not, [""], "boolean");
};

export default { install };
