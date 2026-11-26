import { LGraph, LGraphNode, LiteGraph } from "@gausszhou/litegraph-core"
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic"
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

    test__setOutputData__shouldForwardDataToLinkedSlots() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);
        const link = source.connect(0, target, 0)!;

        source.setOutputData(0, 42);

        expect(graph.links[link.id].data).toBe(42);
        expect(source.isOutputConnected(0)).toBe(true);
    }

    test__connectByTypeInput__shouldCreateLink() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);

        const link = source.connectByTypeInput(0, target, "number");

        expect(link).not.toBeNull();
        expect(source.isOutputConnected(0)).toBe(true);
        expect(target.isInputConnected(0)).toBe(true);
    }

    test__removeInput__shouldDisconnectLinkedSlot() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);
        source.connect(0, target, 0);

        target.removeInput(0);

        expect(target.inputs[0]).toBeUndefined();
        expect(source.outputs[0].links ?? []).toHaveLength(0);
        expect(Object.keys(graph.links)).toHaveLength(0);
    }

    test__addWidgetCombo__withoutValuesShouldThrow() {
        const node = new LGraphNode();

        expect(() => node.addWidget("combo", "choice", 0)).toThrow();
    }

    test__clone__shouldNotCopyLinks() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);
        source.connect(0, target, 0);

        const clone = target.clone();

        expect(clone.inputs[0].link).toBeNull();
        expect(clone).not.toBe(target);
    }

    test__serialize__shouldInvokeOnSerializeAndOnConfigure() {
        const node = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        let serialized = 0;
        node.onSerialize = () => { serialized++; };

        const data = node.serialize();

        expect(serialized).toBe(1);

        let configured = 0;
        const restored = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        restored.onConfigure = () => { configured++; };
        restored.configure(data);

        expect(configured).toBe(1);
    }

    test__getBounding__shouldStartAtNodePosition() {
        const node = new LGraphNode();
        node.pos = [10, 20];
        node.size = [100, 50];

        const bounding = node.getBounding();

        expect(bounding[0]).toBe(node.pos[0] - 4);
        expect(bounding[1]).toBe(node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT);
        expect(bounding[2]).toBeGreaterThanOrEqual(100);
    }

    test__getInputInfoAndLink__shouldReflectConnection() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);
        const link = source.connect(0, target, 0)!;

        expect(target.getInputInfo(0)?.name).toBe("value");
        expect(target.getInputLink(0)?.id).toBe(link.id);
        expect(target.getInputDataType(0)).toBe("number");
        expect(target.getOutputInfo(0)).toBeNull();
    }

    test__getInputData__shouldReadLinkData() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);
        source.connect(0, target, 0);
        source.setValue(42);

        expect(target.getInputData(0, true)).toBe(42);
    }

    test__setProperty__abortShouldRevertValue() {
        const node = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        node.onPropertyChanged = () => false;

        node.setProperty("value", 5);

        expect(node.properties.value).toBe(1);
    }

    test__getInputOrProperty__shouldFallbackToProperty() {
        const node = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        node.properties["custom"] = "prop-value";

        expect(node.getInputOrProperty("custom")).toBe("prop-value");
        expect(node.getInputOrProperty("missing")).toBeUndefined();
    }

    test__addCustomWidget__shouldAppendWidget() {
        const node = new LGraphNode();

        const widget = node.addCustomWidget({ type: "custom", name: "w", value: 1 } as any);

        expect(node.widgets).toContain(widget);
    }

    test__computeSize__shouldRespectMinimumSize() {
        const node = new LGraphNode();

        const size = node.computeSize();

        expect(size[0]).toBeGreaterThan(0);
        expect(size[1]).toBeGreaterThan(0);

        node.setSize([300, 80]);
        expect(node.size).toStrictEqual([300, 80]);
    }

    test__connect__shouldInvokeOnConnectionsChange() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);
        const calls: number[] = [];
        source.onConnectionsChange = (_type, slot) => { calls.push(slot); };

        source.connect(0, target, 0);

        expect(calls).toStrictEqual([0]);
    }

    test__addInput__shouldRespectOptionalOptions() {
        const node = new LGraphNode();

        node.addInput("opt", "string", { optional: true, nameLocked: true });

        expect(node.inputs[0].optional).toBe(true);
        expect(node.inputs[0].nameLocked).toBe(true);
        expect(node.findInputSlotIndexByName("missing")).toBe(-1);
    }

    test__getConnectionPos__shouldReturnSlotPosition() {
        const node = new LGraphNode();
        node.pos = [100, 100];
        node.addInput("in", "number");
        node.addOutput("out", "number");
        node.setSize([120, 60]);

        const inputPos = node.getConnectionPos(true, 0);
        const outputPos = node.getConnectionPos(false, 0);

        expect(inputPos[0]).toBeGreaterThanOrEqual(node.pos[0]);
        expect(outputPos[0]).toBeGreaterThanOrEqual(node.pos[0] + node.size[0] - 20);
        expect(outputPos[0]).toBeGreaterThan(inputPos[0]);
    }

    test__isPointInside__shouldRespectBounds() {
        const node = new LGraphNode();
        node.pos = [0, 0];
        node.size = [100, 50];

        expect(node.isPointInside(50, 20)).toBe(true);
        expect(node.isPointInside(-10, -10)).toBe(false);
    }

    test__alignToGrid__shouldSnapToGrid() {
        const node = new LGraphNode();
        node.pos = [13, 27];

        node.alignToGrid();

        expect(node.pos[0] % LiteGraph.CANVAS_GRID_SIZE).toBe(0);
        expect(node.pos[1] % LiteGraph.CANVAS_GRID_SIZE).toBe(0);
    }

    test__serialize__shouldIncludeWidgetsAndOrder() {
        const node = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        node.order = 3;
        node.serialize_widgets = true;
        node.setProperty("value", 8);

        const data = node.serialize();

        expect(data.order).toBe(3);
        expect(data.widgets_values).toStrictEqual([8]);
    }

    test__addWidget__shouldAcceptCallbackFunction() {
        const node = new LGraphNode();
        let clicked = false;

        node.addWidget("button", "go", null, () => { clicked = true; });
        node.widgets![0].callback?.call(node, null, node, [0, 0], {});

        expect(clicked).toBe(true);
    }

    test__setInputAndOutputDataType__shouldUpdateSlotType() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(target);
        source.connect(0, target, 0);

        source.setOutputDataType(0, "boolean");
        target.setInputDataType(0, "string");

        expect(source.outputs[0].type).toBe("boolean");
        expect(target.inputs[0].type).toBe("string");
    }

    test__moveOutput__shouldReorderSlots() {
        const graph = new LGraph();
        const node = new LGraphNode();
        graph.add(node);
        node.addOutput("a", "number");
        node.addOutput("b", "string");

        node.moveOutput(0, 1);

        expect(node.outputs.map(o => o.name)).toStrictEqual(["b", "a"]);
    }

    test__moveInput__shouldReorderSlots() {
        const graph = new LGraph();
        const node = new LGraphNode();
        graph.add(node);
        node.addInput("a", "number");
        node.addInput("b", "string");

        node.moveInput(0, 1);

        expect(node.inputs.map(i => i.name)).toStrictEqual(["b", "a"]);
    }

    test__getSlotInPosition__shouldDetectSlots() {
        const graph = new LGraph();
        const node = new LGraphNode();
        graph.add(node);
        node.pos = [0, 0];
        node.addInput("in", "number");
        node.addOutput("out", "number");
        node.setSize([100, 50]);
        const inputPos = node.getConnectionPos(true, 0);

        const slot = node.getSlotInPosition(inputPos[0], inputPos[1]);

        expect(slot).not.toBeNull();
        expect(slot?.input?.name).toBe("in");
    }

    test__disconnectOutput__specificTargetShouldKeepOthers() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const targetA = LiteGraph.createNode(Watch) as Watch;
        const targetB = LiteGraph.createNode(Watch) as Watch;
        graph.add(source);
        graph.add(targetA);
        graph.add(targetB);
        source.connect(0, targetA, 0);
        source.connect(0, targetB, 0);

        source.disconnectOutput(0, targetA);

        expect(targetA.inputs[0].link).toBeNull();
        expect(targetB.inputs[0].link).not.toBeNull();
    }

    test__getPropertyInfo__shouldFallbackForUnknownProperty() {
        const node = LiteGraph.createNode(ConstantNumber) as ConstantNumber;

        expect(node.getPropertyInfo("value").type).toBeDefined();
        expect(node.getPropertyInfo("missing")).toBeDefined();
    }
}
