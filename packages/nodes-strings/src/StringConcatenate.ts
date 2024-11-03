import { LiteGraph, SlotLayout } from "@gausszhou/litegraph-core";

import LiteGraph from "@gausszhou/litegraph-core/src/LiteGraph";

import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export default class StringConcatenate extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "A", type: "string" },
            { name: "B", type: "string" },
        ],
        outputs: [
            { name: "out", type: "string" },
        ],
    }

    override onExecute() {
        const value = this.getInputData(0) + this.getInputData(1)
        this.setOutputData(0, value);
    };
}

