import { LGraph, LiteGraph, Subgraph } from "@gausszhou/litegraph-core"
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic"
import { expect } from 'vitest'
import UnitTest from "./UnitTest"

export default class LGraphTests extends UnitTest {
    test__iterateNodesInOrder__shouldIterateNodes() {
        const graph = new LGraph();

        const nodeA = LiteGraph.createNode(Watch)
        const nodeB = LiteGraph.createNode(Watch)
        const nodeC = LiteGraph.createNode(Watch)

        graph.add(nodeA)
        graph.add(nodeB)
        graph.add(nodeC)

        expect(Array.from(graph.iterateNodesInOrder()).map(i => i.id)).toStrictEqual([nodeA.id, nodeB.id, nodeC.id])
    }

    test__iterateNodesInOrderRecursive__shouldIterateNodes() {
        const graph = new LGraph();

        const nodeA = LiteGraph.createNode(Watch)
        const nodeB = LiteGraph.createNode(Watch)

        const subgraphA = LiteGraph.createNode(Subgraph)
        const subgraphB = LiteGraph.createNode(Subgraph)

        graph.add(subgraphA)
        subgraphA.subgraph.add(subgraphB)

        const subNodeA = LiteGraph.createNode(Watch)
        const subNodeB = LiteGraph.createNode(Watch)
        const subSubNodeA = LiteGraph.createNode(Watch)
        const subSubNodeB = LiteGraph.createNode(Watch)

        graph.add(nodeA)
        subgraphA.subgraph.add(subNodeA)
        subgraphB.subgraph.add(subSubNodeA)
        subgraphA.subgraph.add(subNodeB)
        subgraphB.subgraph.add(subSubNodeB)
        graph.add(nodeB)

        expect(Array.from(graph.iterateNodesInOrderRecursive()).map(i => i.id))
            .toStrictEqual([subgraphA.id, subgraphB.id, subSubNodeA.id, subSubNodeB.id, subNodeA.id, subNodeB.id, nodeA.id, nodeB.id])
    }

    test__add__shouldAssignUniqueIds() {
        if (LiteGraph.use_uuids)
            return;

        const graph = new LGraph();

        const nodeA = LiteGraph.createNode(Watch)
        const nodeB = LiteGraph.createNode(Watch)
        const nodeC = LiteGraph.createNode(Watch)

        graph.add(nodeA)
        graph.add(nodeB)
        graph.add(nodeC)

        expect(nodeA.id).toEqual(1)
        expect(nodeB.id).toEqual(2)
        expect(nodeC.id).toEqual(3)
    }

    test__add__shouldReassignUniqueIds() {
        if (LiteGraph.use_uuids)
            return;

        const graph = new LGraph();

        const nodeA = LiteGraph.createNode(Watch)
        const nodeB = LiteGraph.createNode(Watch)

        graph.add(nodeA)
        nodeB.id = 1
        graph.add(nodeB)

        expect(nodeA.id).toEqual(1)
        expect(nodeB.id).toEqual(2)
    }

    test__connect__shouldCreateLinkAndSetSlots() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber);
        const target = LiteGraph.createNode(Watch);
        graph.add(source);
        graph.add(target);

        const link = source.connect(0, target, 0);

        expect(link).not.toBeNull();
        expect(source.outputs[0].links).toContain(link!.id);
        expect(target.inputs[0].link).toBe(link!.id);
        expect(graph.links[link!.id]).toBe(link);
        expect(link!.origin_id).toBe(source.id);
        expect(link!.target_id).toBe(target.id);
    }

    test__disconnect__shouldRemoveLink() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber);
        const target = LiteGraph.createNode(Watch);
        graph.add(source);
        graph.add(target);
        const link = source.connect(0, target, 0)!;

        expect(source.disconnectOutput(0)).toBe(true);

        expect(target.inputs[0].link).toBeNull();
        expect(source.outputs[0].links ?? []).toHaveLength(0);
        expect(graph.links[link.id]).toBeUndefined();
    }

    test__remove__shouldDisconnectAndDetachNode() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber);
        const target = LiteGraph.createNode(Watch);
        graph.add(source);
        graph.add(target);
        const link = source.connect(0, target, 0)!;

        graph.remove(source);

        expect(graph.getNodeById(source.id)).toBeFalsy();
        expect(graph._nodes).not.toContain(source);
        expect(target.inputs[0].link).toBeNull();
        expect(graph.links[link.id]).toBeUndefined();
        expect(source.graph).toBeNull();
    }

    test__serialize__shouldRoundTripNodesAndLinks() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber);
        const target = LiteGraph.createNode(Watch);
        source.pos = [10, 20];
        target.pos = [30, 40];
        graph.add(source);
        graph.add(target);
        source.connect(0, target, 0);

        const data = graph.serialize();
        const restored = new LGraph();
        restored.configure(JSON.parse(JSON.stringify(data)));

        expect(restored._nodes).toHaveLength(2);
        const restoredSource = restored.getNodeById(source.id)!;
        const restoredTarget = restored.getNodeById(target.id)!;
        expect(restoredSource).not.toBeNull();
        expect(restoredTarget).not.toBeNull();
        expect(restoredSource.pos).toStrictEqual([10, 20]);
        expect(restoredTarget.pos).toStrictEqual([30, 40]);
        expect(restoredTarget.inputs[0].link).not.toBeNull();
        expect(Object.keys(restored.links)).toHaveLength(1);
    }

    test__computeExecutionOrder__shouldFollowConnections() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber);
        const target = LiteGraph.createNode(Watch);
        graph.add(source);
        graph.add(target);
        source.connect(0, target, 0);
        graph.updateExecutionOrder();

        const order = graph.computeExecutionOrder().map(n => n.id);

        expect(order.indexOf(source.id)).toBeLessThan(order.indexOf(target.id));
    }

    test__runStep__shouldPropagateOutputToInput() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        const target = LiteGraph.createNode(Watch) as Watch;
        source.setValue(42);
        graph.add(source);
        graph.add(target);
        source.connect(0, target, 0);

        graph.runStep(1);

        expect(target.value).toBe(42);
    }

    test__version__shouldChangeOnMutations() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber);
        const target = LiteGraph.createNode(Watch);

        const initial = graph._version;
        graph.add(source);
        graph.add(target);
        const afterAdd = graph._version;
        expect(afterAdd).toBeGreaterThan(initial);

        source.connect(0, target, 0);
        const afterConnect = graph._version;
        expect(afterConnect).toBeGreaterThan(afterAdd);

        graph.remove(source);
        expect(graph._version).toBeGreaterThan(afterConnect);
    }
}
