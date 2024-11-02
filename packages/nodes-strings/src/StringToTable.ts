import { SlotLayout } from "@gausszhou/litegraph-core";


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

export interface StringToTableProperties extends Record<string, any> {
    value: string,
    separator: string
}

export default class StringToTable extends LGraphNode {
    override properties: StringToTableProperties = {
        value: "",
        separator: ","
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "number" },
        ],
        outputs: [
            { name: "table", type: "table" },
            { name: "rows", type: "number" },
        ],
    }

    private _table: string[][] | null = null;
    private _str: string | null = null;
    private _last_separator: string | null = null;

    override onExecute() {
        var input = this.getInputData(0);
        if (!input)
            return;
        var separator = this.properties.separator || ",";
        if (input != this._str || separator != this._last_separator) {
            this._last_separator = separator;
            this._str = input;
            this._table = input.split("\n").map(function(a) { return a.trim().split(separator) });
        }
        this.setOutputData(0, this._table);
        this.setOutputData(1, this._table ? this._table.length : 0);
    };
}

