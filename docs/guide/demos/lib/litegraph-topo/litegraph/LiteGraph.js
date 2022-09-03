import { LiteGraph } from "../../litegraph.js.js";

LiteGraph.VERTICAL_LAYOUT = "ver";

// 调整连接验证  增加Any类型
LiteGraph.isValidConnection = function (type_a, type_b) {
  if (
    !type_a || //generic output
    !type_b || //generic input
    type_a == type_b || //same type (is valid for triggers)
    (type_a == LiteGraph.EVENT && type_b == LiteGraph.ACTION) ||
    type_a == "Any" ||
    type_b == "Any"
  ) {
    return true;
  }
  // Enforce string type to handle toLowerCase call (-1 number not ok)
  type_a = String(type_a);
  type_b = String(type_b);
  type_a = type_a.toLowerCase();
  type_b = type_b.toLowerCase();

  // For nodes supporting multiple connection types
  if (type_a.indexOf(",") == -1 && type_b.indexOf(",") == -1) {
    return type_a == type_b;
  }

  // Check all permutations to see if one is valid
  var supported_types_a = type_a.split(",");
  var supported_types_b = type_b.split(",");
  for (var i = 0; i < supported_types_a.length; ++i) {
    for (var j = 0; j < supported_types_b.length; ++j) {
      if (supported_types_a[i] == supported_types_b[j]) {
        return true;
      }
    }
  }

  return false;
};

export default LiteGraph;
