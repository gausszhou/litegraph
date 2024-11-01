import MathApproxEq from "./MathApproxEq";
import MathFloor from "./MathFloor";
import MathOperation from "./MathOperation";

export const install = (LiteGraph: any) => {
  LiteGraph.registerNodeType({
    class: MathApproxEq,
    title: "Approx. Eq",
    desc: "Check if two floating-point numbers are approximately equal",
    type: "math/approx_eq",
  });

  LiteGraph.registerNodeType({
    class: MathFloor,
    title: "Floor",
    desc: "Floor number to remove fractional part",
    type: "math/floor",
  });
  LiteGraph.registerNodeType({
    class: MathOperation,
    title: "Operation",
    desc: "Easy math operators",
    type: "math/operation",
  });
};
