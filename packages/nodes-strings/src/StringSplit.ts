import { SlotLayout } from "@gausszhou/litegraph-core";

declare class LGraphNode {
    constructor(title: string)
    id
    title
    flags
    graph
    size
    horizontal
    properties
    boxcolor
    widgets_up
    inputs
    outputs
    isInputConnected(...args: any)
    trigger(...args: any)
    triggerSlot(...args: any)
    addWidget(...args: any)
    getTitle()
    disconnectOutput(slot: number);
    onConnectionsChange(...args: any)
    setProperty(...args: any)
    getInputData(slot: number);
    getInputLink(slot: number);
    getOutputLinks(slot: number);
    setOutputData(slot: number, value: any);
    addInput(...args: any)
    addOutput(...args: any)
    removeInput(...args: any)
    removeOutput(...args: any)
    onPropertyChanged(name: string, value: any);
    onExecute(...args: any)
    onAction(...args: any)
    onDrawBackground(ctx: CanvasRenderingContext2D);
    onDropFile(file: File)
}

export interface StringSplitProperties extends Record<string, any> {
    separator: string
}

export default class StringSplit extends LGraphNode {
    override properties: StringSplitProperties = {
        separator: ","
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "string,array" },
            { name: "sep", type: "string" },
        ],
        outputs: [
            { name: "out", type: "array" },
        ],
    }

    override onExecute() {
        const str = this.getInputData(0)
        let separator = this.getInputData(1)

        if (separator == null)
            separator = this.properties.separator;

        let value: string[] = []

        if (str == null)
            value = [];
        else if (str.constructor === String)
            value = str.split(separator || " ");
        else if (str.constructor === Array) {
            var r = [];
            for (var i = 0; i < str.length; ++i) {
                if (typeof str[i] == "string")
                    r[i] = str[i].split(separator || " ");
            }
            value = r;
        }
        else
            value = null;

        this.setOutputData(0, value)
    };
}

