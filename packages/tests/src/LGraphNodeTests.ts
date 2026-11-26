import { LGraphNode, LiteGraph } from "@gausszhou/litegraph-core"
import { ConstantNumber } from "@gausszhou/litegraph-nodes-basic"
import { expect } from "vitest"
import UnitTest from "./UnitTest"

export default class LGraphNodeTests extends UnitTest {
    test__addInput__shouldAppendSlot() {
        const node = new LGraphNode();

        node.addInput("a", "number");
        node.addInput("b", "string");

        expect(node.inputs.map(i => i.name)).toStrictEqual(["a", "b"]);
        expect(node.findInputSlotIndexByName("b")).toBe(1);
    }

    test__removeInput__shouldRemoveSlot() {
        const node = new LGraphNode();
        node.addInput("a", "number");
        node.addInput("b", "string");

        node.removeInput(0);

        expect(node.inputs.map(i => i.name)).toStrictEqual(["b"]);
        expect(node.findInputSlotIndexByName("a")).toBe(-1);
    }

    test__addOutput__shouldAppendSlot() {
        const node = new LGraphNode();

        node.addOutput("out", "number");

        expect(node.outputs).toHaveLength(1);
        expect(node.outputs[0].name).toBe("out");
        expect(node.findOutputSlotIndexByName("out")).toBe(0);
    }

    test__setProperty__shouldNotifyAndUpdateWidget() {
        const node = LiteGraph.createNode(ConstantNumber);
        const calls: [string, any, any][] = [];
        node.onPropertyChanged = (name, value, prevValue) => {
            calls.push([name, value, prevValue]);
        };

        node.setProperty("value", 3);

        expect(calls).toStrictEqual([["value", 3, 1]]);
        expect(node.properties.value).toBe(3);
        expect(node.widgets[0].value).toBe(3);
    }

    test__serialize__shouldRoundTripWidgetValue() {
        const node = LiteGraph.createNode(ConstantNumber);
        node.setProperty("value", 7);

        const data = node.serialize();
        const restored = LiteGraph.createNode(ConstantNumber);
        restored.configure(data);

        expect(restored.properties.value).toBe(7);
        expect(restored.widgets[0].value).toBe(7);
    }

    test__clone__shouldCopyPropertiesWidgetsAndSlots() {
        const node = LiteGraph.createNode(ConstantNumber);
        node.setProperty("value", 9);

        const clone = node.clone();

        expect(clone).not.toBe(node);
        expect(clone.properties.value).toBe(9);
        expect(clone.widgets[0].value).toBe(9);
        expect(clone.outputs).toHaveLength(node.outputs.length);
        expect(clone.type).toBe(node.type);
    }
}
