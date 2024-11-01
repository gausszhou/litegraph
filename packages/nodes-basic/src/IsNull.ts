import type { PropertyLayout, SlotLayout } from "@litegraph/core"
import LGraphNode from "@litegraph/core/src/LGraphNode";

export interface IsNullProperties extends Record<string, any> {
    strictEquality: boolean
}

export default class IsNull extends LGraphNode {
    override properties: IsNullProperties = {
        strictEquality: true
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "*" },
        ],
        outputs: [
            { name: "is_null", type: "boolean" },
        ]
    }

    static propertyLayout: PropertyLayout = [
    ]

    override onExecute() {
        const input = this.getInputData(0)
        const isNull = this.properties.strictEquality ? input === null : input == null;
        this.setOutputData(0, isNull)
    }
}
