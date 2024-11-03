import LogicAnd from "./LogicAnd";
import LogicBranch from "./LogicBranch";
import LogicCompare from "./LogicCompare";
import LogicNot from "./LogicNot";
import LogicOr from "./LogicOr";
import LogicTruthy from "./LogicTruthy";
import Selector from "./Selector";
import Sequence from "./Sequence";

export const install = (LiteGraph: any) => {
    LiteGraph.registerNodeType({
        class: LogicAnd,
        title: "AND",
        desc: "Return true if all inputs are true",
        type: "logic/and",
    });

    LiteGraph.registerNodeType({
        type: "logic/branch",
        class: LogicBranch,
    });

    LiteGraph.registerNodeType({
        type: "logic/compare",
        class: LogicCompare,
    });

    LiteGraph.registerNodeType({
        class: LogicNot,
        title: "NOT",
        desc: "Return the logical negation",
        type: "logic/not",
    });
    LiteGraph.registerNodeType({
        class: LogicOr,
        title: "OR",
        desc: "Return true if at least one input is true",
        type: "logic/or",
    });
    LiteGraph.registerNodeType({
        type: "logic/truthy",
        class: LogicTruthy,
        title: "~= TRUE",
        desc: "Returns true if input is truthy",
    });

    LiteGraph.registerNodeType({
        type: "logic/selector",
        class: Selector,
        title: "Selector",
        desc: "selects an output",
    });

    LiteGraph.registerNodeType({
        type: "logic/sequence",
        class: Sequence,
    });
};
