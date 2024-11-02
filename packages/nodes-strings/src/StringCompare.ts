import { SlotLayout } from "@gausszhou/litegraph-core";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export default class StringCompare extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "A", type: "string" },
            { name: "B", type: "string" },
        ],
        outputs: [
            { name: "==", type: "boolean" },
        ],
    }

    override onExecute() {
        const value = this.getInputData(0) == this.getInputData(1)
        this.setOutputData(0, value);
    };
}


