import type { OptionalSlots, PropertyLayout, SlotLayout } from "@gausszhou/litegraph-core"
import { BuiltInSlotShape } from "@gausszhou/litegraph-core/src/types";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export interface ArrayElementProperties extends Record<string, any> {
    index: number
}

export default class ArrayElement extends LGraphNode {
    override properties: ArrayElementProperties = {
        index: 0
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "array", type: "array,table,string", options: { shape: BuiltInSlotShape.GRID_SHAPE } },
            { name: "index", type: "number" }
        ],
        outputs: [
            { name: "value", type: "" }
        ]
    }

    static propertyLayout: PropertyLayout = [
        { name: "index", defaultValue: 0 }
    ]

    static optionalSlots: OptionalSlots = {
    }

    override onExecute() {
        const array = this.getInputData(0);
        let index = this.getInputData(1);
        if (index == null)
            index = this.properties.index;
        if (array == null || index == null)
            return;

        index = Math.floor(Number(index))

        if (index >= 0 && index < array.length) {
            this.boxcolor = "#AEA";
            this.setOutputData(0, array[index]);
        }
        else {
            this.boxcolor = "red";
        }
    }
}

