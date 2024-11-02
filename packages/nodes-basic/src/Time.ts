import type { PropertyLayout, SlotLayout } from "@gausszhou/litegraph-core"
// import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

declare class LGraphNode {
    constructor(title: string)
    title
    flags
    titleMode
    resizable
    size
    properties
    boxcolor
    widgets_up
    inputs
    outputs
    graph
    getTitle()
    addWidget(...args: any)
    getExtraMenuOptions(...args: any)
    disconnectOutput(slot: number);
    setProperty(...args: any)
    getInputData(slot: number);
    setOutputData(slot: number, value: any);
    getInputLink(slot);
    getOutputLinks(slot);
    onPropertyChanged(name: string, value: any);
    onExecute()
    onAction()
    onDrawBackground(ctx: CanvasRenderingContext2D);
    onDropFile(file: File)
}
export interface TimeProperties extends Record<string, any> {
    enabled: boolean
}

export default class Time extends LGraphNode {
    override properties: TimeProperties = {
        enabled: true
    }

    static slotLayout: SlotLayout = {
        inputs: [],
        outputs: [
            { name: "in ms", type: "number" },
            { name: "in sec", type: "number" }
        ]
    }

    static propertyLayout: PropertyLayout = [
        { name: "enabled", defaultValue: true }
    ]

    override onExecute() {
        this.setOutputData(0, this.graph.globaltime * 1000);
        this.setOutputData(1, this.graph.globaltime);
    }
}

