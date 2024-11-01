import ArrayElement from "./ArrayElement";
import ConstantBoolean from "./ConstantBoolean";
import ConstantFile from "./ConstantFile";
import ConstantInteger from "./ConstantInteger";
import ConstantJSON from "./ConstantJSON";
import ConstantNull from "./ConstantNull";
import ConstantNumber from "./ConstantNumber";
import ConstantObject from "./ConstantObject";
import ConstantString from "./ConstantString";
import GenericCompare from "./GenericCompare";
import IsNull from "./IsNull";
import Reroute from "./Reroute";
import SetArray from "./SetArray";
import Time from "./Time";
import Watch from "./Watch";

export const install = (LiteGraph: any) => {
  LiteGraph.registerNodeType({
    class: ArrayElement,
    title: "Array[i]",
    desc: "Returns an element from an array",
    type: "basic/array[]",
  });

  LiteGraph.registerNodeType({
    class: ConstantBoolean,
    title: "Const Boolean",
    desc: "Constant boolean",
    type: "basic/boolean",
  });

  LiteGraph.registerNodeType({
    class: ConstantFile,
    title: "Const File",
    desc: "Fetches a file from an url",
    type: "basic/file",
  });

  LiteGraph.registerNodeType({
    class: ConstantInteger,
    title: "Const Integer",
    desc: "Constant integer",
    type: "basic/integer",
  });

  LiteGraph.registerNodeType({
    class: ConstantJSON,
    title: "Const JSON",
    desc: "Parses a string to JSON object",
    type: "basic/json",
  });

  LiteGraph.registerNodeType({
    class: ConstantNumber,
    title: "Const Number",
    desc: "Constant number",
    type: "basic/number",
  });

  LiteGraph.registerNodeType({
    class: ConstantNull,
    title: "Const Null",
    desc: "Constant null or undefined",
    type: "basic/null",
  });

  LiteGraph.registerNodeType({
    class: ConstantNumber,
    title: "Const Number",
    desc: "Constant number",
    type: "basic/number",
  });

  LiteGraph.registerNodeType({
    class: ConstantObject,
    title: "Const Object",
    desc: "Constant object",
    type: "basic/object",
  });

  LiteGraph.registerNodeType({
    class: ConstantString,
    title: "Const String",
    desc: "Constant string",
    type: "basic/string",
  });

  LiteGraph.registerNodeType({
    class: GenericCompare,
    title: "GenericCompare",
    desc: "Compare *",
    type: "basic/CompareValues",
  });

  LiteGraph.registerNodeType({
    class: IsNull,
    title: "== Null",
    desc: "Returns true if input is null",
    type: "basic/is_null",
  });

  LiteGraph.registerNodeType({
    class: Reroute,
    title: "Reroute",
    desc: "Simple pass-through for organization",
    type: "basic/reroute",
  });

  LiteGraph.registerNodeType({
    class: SetArray,
    title: "Set Array",
    desc: "Sets index of array",
    type: "basic/set_array",
  });

  LiteGraph.registerNodeType({
    class: Time,
    title: "Time",
    desc: "Current time",
    type: "basic/time",
  });

  LiteGraph.registerNodeType({
    class: Watch,
    title: "Watch",
    desc: "Show value of input",
    type: "basic/watch",
  });

  // LiteGraph.registerNodeType("basic/time", { class: Time});
  // LiteGraph.registerNodeType("basic/const", ConstantNumber);
  // LiteGraph.registerNodeType("basic/boolean", ConstantBoolean);

  // LiteGraph.registerNodeType("basic/string", ConstantString);
  // LiteGraph.registerNodeType("basic/object", ConstantObject);
  // LiteGraph.registerNodeType("basic/file", ConstantFile);
  // LiteGraph.registerNodeType("basic/data", ConstantData);
  // LiteGraph.registerNodeType("basic/array", ConstantArray);

  // LiteGraph.registerNodeType("basic/set_array", SetArray);
  // LiteGraph.registerNodeType("basic/array[]", ArrayElement);
  // LiteGraph.registerNodeType("basic/table[][]", TableElement);

  // LiteGraph.registerNodeType("basic/object_property", ObjectProperty);
  // LiteGraph.registerNodeType("basic/object_keys", ObjectKeys);
  // LiteGraph.registerNodeType("basic/set_object", SetObject);
  // LiteGraph.registerNodeType("basic/merge_objects", MergeObjects);

  // LiteGraph.registerNodeType("basic/variable", Variable);
  // LiteGraph.registerNodeType("basic/download", DownloadData);
  // LiteGraph.registerNodeType("basic/watch", Watch);
  // LiteGraph.registerNodeType("basic/cast", Cast);

  // LiteGraph.registerNodeType("basic/console", Console);
  // LiteGraph.registerNodeType("basic/alert", Alert);
  // LiteGraph.registerNodeType("basic/script", NodeScript);
  // LiteGraph.registerNodeType("basic/CompareValues", GenericCompare);

  // LiteGraph.wrapFunctionAsNode("basic/length", length, [""], "number");
  // LiteGraph.wrapFunctionAsNode("basic/not", not, [""], "boolean");
};
