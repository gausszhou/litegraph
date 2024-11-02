import type { SlotLayout, Vector2 } from "@litegraph/core";
import LiteConst from "@litegraph/core/src/LiteConst";

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

export interface MathOperationProperties extends Record<string, any> {
    A: any,
    B: any,
    OP: "+" | "-" | "*" | "/" | "%" | "^" | "max" | "min"
}

export default class MathOperation extends LGraphNode {
    override properties: MathOperationProperties = {
        A: 1,
        B: 1,
        OP: "+"
    }

    static values: string[] = ["+", "-", "*", "/", "%", "^", "max", "min"];

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "A", type: "number,array,object" },
            { name: "B", type: "number" },
        ],
        outputs: [
            { name: "=", type: "number" },
        ],
    }

    private _func = (A, B) => { return A + B }
    private _result: any[] = []; //only used for arrays

    override size: Vector2 = [100, 60];

    override getTitle() {
        if (this.properties.OP == "max" || this.properties.OP == "min")
            return this.properties.OP + "(A,B)";
        return "A " + this.properties.OP + " B";
    };

    setValue(v: string | number) {
        if (typeof v == "string") {
            v = parseFloat(v);
        }
        this.properties["value"] = v;
    };

    override onPropertyChanged(name: string, value: any) {
        if (name != "OP")
            return;
        switch (this.properties.OP) {
            case "+": this._func = function(A, B) { return A + B; }; break;
            case "-": this._func = function(A, B) { return A - B; }; break;
            // case "x":
            // case "X":
            case "*": this._func = function(A, B) { return A * B; }; break;
            case "/": this._func = function(A, B) { return A / B; }; break;
            case "%": this._func = function(A, B) { return A % B; }; break;
            case "^": this._func = function(A, B) { return Math.pow(A, B); }; break;
            case "max": this._func = function(A, B) { return Math.max(A, B); }; break;
            case "min": this._func = function(A, B) { return Math.min(A, B); }; break;
            default:
                console.warn("Unknown operation: " + this.properties.OP);
                this._func = function(A) { return A; };
                break;
        }
    }

    override onExecute() {
        var A = this.getInputData(0);
        var B = this.getInputData(1);
        if (A != null) {
            if (A.constructor === Number)
                this.properties["A"] = A;
        } else {
            A = this.properties["A"];
        }

        if (B != null) {
            this.properties["B"] = B;
        } else {
            B = this.properties["B"];
        }

        var result;
        if (A.constructor === Number) {
            result = 0;
            result = this._func(A, B);
        }
        else if (A.constructor === Array) {
            result = this._result;
            result.length = A.length;
            for (var i = 0; i < A.length; ++i)
                result[i] = this._func(A[i], B);
        }
        else {
            result = {};
            for (let i in A)
                result[i] = this._func(A[i], B);
        }
        this.setOutputData(0, result);
    };

    override onDrawBackground(ctx: CanvasRenderingContext2D) {
        if (this.flags.collapsed) {
            return;
        }

        ctx.font = "40px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(
            this.properties.OP,
            this.size[0] * 0.5,
            (this.size[1] + LiteConst.NODE_TITLE_HEIGHT) * 0.5
        );
        ctx.textAlign = "left";
    };
}