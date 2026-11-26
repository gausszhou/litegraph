import { BuiltInSlotShape, GraphInput, GraphOutput, LGraph, LiteGraph } from "@gausszhou/litegraph-core"
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic"
import { expect } from "vitest"
import UnitTest from "./UnitTest"

export default class GraphIONodeTests extends UnitTest {
    test__graphInput__setTypeShouldUpdateSlotAndWidget() {
        const input = LiteGraph.createNode(GraphInput);

        input.setType("boolean");

        expect(input.properties.type).toBe("boolean");
        expect(input.outputs[0].type).toBe("boolean");
        expect(input.valueWidget.type).toBe("toggle");
    }

    test__graphInput__setTypeArrayShouldUseGridShape() {
        const input = LiteGraph.createNode(GraphInput);

        input.setType("array");

        expect(input.outputs[0].shape).toBe(BuiltInSlotShape.GRID_SHAPE);
    }

    test__graphInput__onExecuteShouldForwardGraphInputValue() {
        const graph = new LGraph();
        const input = LiteGraph.createNode(GraphInput);
        input.properties.name = "in";
        const target = LiteGraph.createNode(Watch);
        graph.add(input);
        graph.add(target);
        graph.inputs["in"] = { name: "in", type: "number", value: 7 } as any;
        const link = input.connect(0, target, 0)!;

        input.onExecute();

        expect(graph.links[link.id].data).toBe(7);
    }

    test__graphOutput__setTypeEventShouldUseBoxShape() {
        const output = LiteGraph.createNode(GraphOutput);

        output.setType("-2");

        expect(output.inputs[0].type).toBe(-2);
        expect(output.inputs[0].shape).toBe(BuiltInSlotShape.BOX_SHAPE);
    }

    test__graphOutput__onExecuteShouldWriteGraphOutputValue() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const output = LiteGraph.createNode(GraphOutput);
        output.properties.name = "out";
        graph.add(source);
        graph.add(output);
        graph.addOutput("out", "number", 0);
        source.connect(0, output, 0);

        source.setOutputData(0, 42);
        output.onExecute();

        expect(graph.outputs["out"].value).toBe(42);
    }

    test__graphOutput__setActionTypeShouldUseEventSlot() {
        const output = LiteGraph.createNode(GraphOutput);

        output.setType("-1");

        expect(output.inputs[0].type).toBe(-1);
    }

    test__graphInput__eventTypeShouldUseBoxShape() {
        const input = LiteGraph.createNode(GraphInput);

        input.setType("-2");

        expect(input.outputs[0].shape).toBe(BuiltInSlotShape.BOX_SHAPE);
    }

    test__graphOutput__arrayTypeShouldUseGridShape() {
        const output = LiteGraph.createNode(GraphOutput);

        output.setType("array");

        expect(output.inputs[0].shape).toBe(BuiltInSlotShape.GRID_SHAPE);
    }

    test__graphInput__onExecuteFallsBackToPropertyValue() {
        const graph = new LGraph();
        const input = LiteGraph.createNode(GraphInput);
        input.properties.name = "in";
        input.properties.value = 3;
        const target = LiteGraph.createNode(Watch);
        graph.add(input);
        graph.add(target);
        const link = input.connect(0, target, 0)!;

        input.onExecute();

        expect(graph.links[link.id].data).toBe(3);
    }
}
