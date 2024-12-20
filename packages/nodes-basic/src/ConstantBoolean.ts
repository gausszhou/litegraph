import { IToggleWidget, OptionalSlots, PropertyLayout, SlotLayout, Vector2 } from "@gausszhou/litegraph-core"

import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";

import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export interface ConstantBooleanProperties extends Record<string, any> {
    value: boolean,
}

export default class ConstantBoolean extends LGraphNode {
    override properties: ConstantBooleanProperties = {
        value: true
    }

    static slotLayout: SlotLayout = {
        inputs: [],
        outputs: [
            { name: "bool", type: "boolean" }
        ]
    }

    static propertyLayout: PropertyLayout = [
        { name: "value", defaultValue: true }
    ]

    static optionalSlots: OptionalSlots = {
        inputs: [
            { name: "toggle", type: BuiltInSlotType.ACTION }
        ]
    }

    widget: IToggleWidget;

    override size: Vector2 = [140, 30];

    constructor(title?: string) {
        super()
        this.widget = this.addWidget("toggle", "value", true, "value");
        this.widgets_up = true;
    }

    override onExecute() {
        this.setOutputData(0, this.properties["value"]);
    }

    override onAction() {
        this.setValue(!this.properties.value)
    }

    override getTitle(): string {
        if (this.flags.collapsed) {
            return "" + this.properties.value;
        }
        return this.title;
    }

    setValue(v: any) {
        this.setProperty("value", Boolean(v));
    }
}
