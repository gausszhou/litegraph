import { PropertyLayout, SlotLayout } from "@litegraph/core/src/LGraphNode";

declare class LGraphNode {
    flags
    size
    properties
    getTitle()
    onPropertyChanged(name: string, value: any);
    onExecute()
    getInputData(slot: number);
    setOutputData(slot: number, value: any);
    onDrawBackground(ctx: CanvasRenderingContext2D);
}

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

