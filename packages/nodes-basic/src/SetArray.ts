import { INumberWidget, OptionalSlots, PropertyLayout, SlotLayout } from "@gausszhou/litegraph-core";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";
export interface SetArrayProperties extends Record<string, any> {
    index: number
}

export default class SetArray extends LGraphNode {
    override properties: SetArrayProperties = {
        index: 0
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "arr", type: "array" },
            { name: "value", type: "" }
        ],
        outputs: [
            { name: "arr", type: "array" }
        ]
    }

    static propertyLayout: PropertyLayout = [
        { name: "index", defaultValue: 0 }
    ]

    static optionalSlots: OptionalSlots = {
    }

    widget: INumberWidget;

    constructor(title?: string) {
        super()
        this.widget = this.addWidget("number", "i", this.properties.index, "index", { precision: 0, step: 10, min: 0 });
        this.widgets_up = true;
    }

    override onExecute() {
        var arr = this.getInputData(0);
        if (!arr)
            return;
        var v = this.getInputData(1);
        if (v === undefined)
            return;

        const index = Math.floor(this.properties.index)
        if (index >= 0 && index < arr.length) {
            this.boxcolor = "#AEA";
            arr[index] = v;
        }
        else {
            this.boxcolor = "red";
        }

        this.setOutputData(0, arr);
    }
}

