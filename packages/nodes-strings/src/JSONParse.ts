import { INodeInputSlot, INodeOutputSlot, LConnectionKind, LLink, SlotLayout } from "@gausszhou/litegraph-core";

import LiteCommon from "@gausszhou/litegraph-core/src/LiteCommon";

declare class LGraphNode {
    constructor(title: string)
    title
    flags
    graph
    size
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
    setProperty(...args: any)
    getInputData(slot: number);
    setOutputData(slot: number, value: any);
    onPropertyChanged(name: string, value: any);
    onExecute(...args: any)
    onAction(...args: any)
    onDrawBackground(ctx: CanvasRenderingContext2D);
    onDropFile(file: File)
    onConnectionsChange(...args: any)
}

export interface JSONParseProperties extends Record<string, any> {
}

export default class JSONParse extends LGraphNode {
    override properties: JSONParseProperties = {
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "string" },
        ],
        outputs: [
            { name: "out", type: "*" },
            { name: "error", type: "string" },
        ],
    }

    private _value: string = null;
    private _str: string | null = null;
    private _error: string | null = null;

    override onExecute() {
        const inputData = this.getInputData(0)
        if (inputData != this._str && typeof inputData === "string") {
            this._error = null;
            this._value = null;
            this._str = inputData
            try {
                this._value = JSON.parse(this._str)
                this.boxcolor = "#AEA";
            }
            catch (err) {
                this._error = `${err}`
                this.boxcolor = "red";
            }
        }
        else if (inputData == null) {
            this._str = null;
            this._value = null;
            this._error = null;
            this.boxcolor = LiteCommon.NODE_DEFAULT_BOXCOLOR;
        }
        this.setOutputData(0, this._value)
        this.setOutputData(1, this._error)
    };

    override onConnectionsChange(
        type: LConnectionKind,
        slotIndex: number,
        isConnected: boolean,
        link: LLink,
        ioSlot: (INodeInputSlot | INodeOutputSlot)
    ) {
        // Invalidate cached value
        this._str = null
    }
}

