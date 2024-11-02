import { SlotLayout } from "@gausszhou/litegraph-core";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export default class StringToLowerCase extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "string" },
        ],
        outputs: [
            { name: "out", type: "string" },
        ],
    }

    override onExecute() {
        const a = this.getInputData(0)
        let b = a;
        if (a != null && a.constructor === String) {
            b = a.toLowerCase();
        }
        this.setOutputData(0, b)
    };
}
