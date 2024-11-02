import JSONParse from "./JSONParse";
import JSONStringify from "./JSONStringify";
import StringCompare from "./StringCompare";
import StringConcatenate from "./StringConcatenate";
import StringContains from "./StringContains";
import StringSplit from "./StringSplit";
import StringTemplate from "./StringTemplate";
import StringToFixed from "./StringToFixed";
import StringToTable from "./StringToTable";
import StringToUpperCase from "./StringToUpperCase";
import OtherToString from "./OtherToString";
import StringToLowerCase from "./StringToLowerCase";

export const install = (LiteGraph: any) => {
  LiteGraph.registerNodeType({
    class: JSONParse,
    title: "JSON Parse",
    desc: "Parses a string into a JavaScript object",
    type: "string/json_parse",
  });
  LiteGraph.registerNodeType({
    class: JSONStringify,
    title: "JSON Stringify",
    desc: "Calls JSON.stringify() on the input value",
    type: "string/json_stringify",
  });

  LiteGraph.registerNodeType({
    class: StringCompare,
    title: "Compare",
    desc: "Compares strings",
    type: "string/compare",
  });

  LiteGraph.registerNodeType({
    class: StringConcatenate,
    title: "Concatenate",
    desc: "Concatenates strings",
    type: "string/concatenate",
  });

  LiteGraph.registerNodeType({
    class: StringContains,
    title: "Contains",
    desc: "Calls a.indexOf(b)",
    type: "string/contains",
  });
  LiteGraph.registerNodeType({
    class: StringSplit,
    title: "Split",
    desc: 'Calls str.split(sep || " ")',
    type: "string/split",
  });

  LiteGraph.registerNodeType({
    class: StringTemplate,
    title: "Template",
    desc: "Substitutes an array of strings in a template like '$1, $2, $3'",
    type: "string/template",
  });

  LiteGraph.registerNodeType({
    class: StringToFixed,
    title: "ToFixed",
    desc: "Calls in.toFixed()",
    type: "string/toFixed",
  });

  LiteGraph.registerNodeType({
    class: StringToTable,
    title: "ToTable",
    desc: "Splits a string to table",
    type: "string/toTable",
  });

  LiteGraph.registerNodeType({
    class: StringToUpperCase,
    title: "ToUpperCase",
    desc: "Converts to upper case",
    type: "string/toUpperCase",
  });

  LiteGraph.registerNodeType({
    class: StringToLowerCase,
    title: "ToLowerCase",
    desc: "Converts to lower case",
    type: "string/toLowerCase",
  });

  LiteGraph.registerNodeType({
    class: OtherToString,
    title: "ToString",
    desc: "Calls .toString()",
    type: "string/toString",
  });
};
