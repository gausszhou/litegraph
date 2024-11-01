import LogicAnd from "./LogicAnd";
import LogicNot from "./LogicNot";
import LogicOr from "./LogicOr";
import LogicTruthy from "./LogicTruthy";

export const install = (LiteGraph: any) => {
    LiteGraph.registerNodeType({
        class: LogicAnd,
        title: "AND",
        desc: "Return true if all inputs are true",
        type: "logic/AND",
    });

    LiteGraph.registerNodeType({
        class: LogicNot,
        title: "NOT",
        desc: "Return the logical negation",
        type: "logic/NOT",
    });
    LiteGraph.registerNodeType({
        class: LogicOr,
        title: "OR",
        desc: "Return true if at least one input is true",
        type: "logic/OR",
    });
    LiteGraph.registerNodeType({
        class: LogicTruthy,
        title: "~= TRUE",
        desc: "Returns true if input is truthy",
        type: "logic/truthy",
    });
};
