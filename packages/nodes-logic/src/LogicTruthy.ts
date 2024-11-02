import { PropertyLayout, SlotLayout } from "@gausszhou/litegraph-core/src/LGraphNode";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export default class LogicTruthy extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "*" },
        ],
        outputs: [
            { name: "truthy", type: "boolean" },
        ]
    }

    static propertyLayout: PropertyLayout = [
    ]

    override onExecute() {
        const input = this.getInputData(0)
        this.setOutputData(0, Boolean(input))
    }
}

