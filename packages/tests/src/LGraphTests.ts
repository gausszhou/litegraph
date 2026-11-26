import { LGraph, LGraphGroup, LGraphStatus, LiteGraph, Subgraph } from "@gausszhou/litegraph-core"
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

    test__removeLink__shouldClearBothSlots() {
        const graph = new LGraph();
        const source = LiteGraph.createNode(ConstantNumber);
        const target = LiteGraph.createNode(Watch);
        graph.add(source);
        graph.add(target);
        const link = source.connect(0, target, 0)!;

        graph.removeLink(link.id);

        expect(graph.links[link.id]).toBeUndefined();
        expect(source.outputs[0].links ?? []).toHaveLength(0);
        expect(target.inputs[0].link).toBeNull();
    }

    test__clear__shouldResetGraph() {
        const graph = new LGraph();
        graph.add(LiteGraph.createNode(ConstantNumber));
        graph.addGroup(new LGraphGroup("G"));

        graph.clear();

        expect(graph._nodes).toHaveLength(0);
        expect(Object.keys(graph.links)).toHaveLength(0);
        expect(graph._groups).toHaveLength(0);
    }

    test__groups__shouldSerializeAndConfigure() {
        const graph = new LGraph();
        graph.add(LiteGraph.createNode(ConstantNumber));
        const group = new LGraphGroup("Group A");
        graph.addGroup(group);

        const data = graph.serialize();
        const restored = new LGraph();
        restored.configure(JSON.parse(JSON.stringify(data)));

        expect(data.groups).toHaveLength(1);
        expect(restored._groups).toHaveLength(1);
        expect(restored._groups[0].title).toBe("Group A");
    }

    test__findNodesByTitle__shouldMatchNodes() {
        const graph = new LGraph();
        const node = LiteGraph.createNode(ConstantNumber);
        node.title = "target";
        graph.add(node);
        graph.add(LiteGraph.createNode(ConstantNumber));

        expect(graph.findNodesByTitle("target")).toStrictEqual([node]);
        expect(graph.findNodesByTitle("missing")).toHaveLength(0);
    }

    test__configure__shouldReplaceExistingNodes() {
        const graph = new LGraph();
        const old = LiteGraph.createNode(ConstantNumber);
        graph.add(old);

        const other = new LGraph();
        other.last_node_id = 100;
        const replacement = LiteGraph.createNode(ConstantNumber);
        other.add(replacement);
        graph.configure(other.serialize());

        expect(graph._nodes).toHaveLength(1);
        expect(graph.getNodeById(replacement.id)).not.toBeNull();
        expect(graph.getNodeById(old.id)).toBeFalsy();
    }

    test__beforeAfterChange__shouldFireCallbacks() {
        const graph = new LGraph();
        const node = LiteGraph.createNode(ConstantNumber);
        graph.add(node);
        let before = 0;
        let after = 0;
        graph.onBeforeChange = () => { before++; };
        graph.onAfterChange = () => { after++; };

        graph.remove(node);

        expect(before).toBeGreaterThan(0);
        expect(after).toBeGreaterThan(0);
    }

    test__inputs__shouldAddRenameAndRemove() {
        const graph = new LGraph();

        graph.addInput("a", "number", 1);
        expect(graph.inputs["a"].type).toBe("number");
        expect(graph.inputs["a"].value).toBe(1);

        graph.setInputData("a", 5);
        expect(graph.inputs["a"].value).toBe(5);

        expect(graph.renameInput("a", "b")).toBe(true);
        expect(graph.inputs["b"]).toBeDefined();
        expect(graph.inputs["a"]).toBeUndefined();

        expect(graph.removeInput("b")).toBe(true);
        expect(graph.inputs["b"]).toBeUndefined();
    }

    test__outputs__shouldAddRenameAndRemove() {
        const graph = new LGraph();

        graph.addOutput("a", "number", 1);
        expect(graph.outputs["a"].type).toBe("number");

        graph.setOutputData("a", 5);
        expect(graph.outputs["a"].value).toBe(5);

        expect(graph.renameOutput("a", "b")).toBe(true);
        expect(graph.outputs["b"]).toBeDefined();

        expect(graph.removeOutput("b")).toBe(true);
        expect(graph.outputs["b"]).toBeUndefined();
    }

    test__configure__unknownNodeTypeShouldCreatePlaceholder() {
        const graph = new LGraph();
        const other = new LGraph();
        other.add(LiteGraph.createNode(ConstantNumber));
        const data: any = other.serialize();
        data.nodes[0].type = "does/not-exist";

        graph.configure(data);

        expect(graph._nodes).toHaveLength(1);
        expect(graph._nodes[0].has_errors).toBe(true);
    }

    test__serialize__shouldKeepConfigAndExtra() {
        const graph = new LGraph();
        graph.config = { align_to_grid: true } as any;
        graph.extra = { custom: 1 };

        const data = graph.serialize();

        expect(data.config).toStrictEqual({ align_to_grid: true } as any);
        expect(data.extra).toStrictEqual({ custom: 1 });
    }

    test__startAndStop__shouldToggleRunningState() {
        const graph = new LGraph();

        graph.start(1000);
        expect(graph.status).toBe(LGraphStatus.STATUS_RUNNING);

        graph.stop();
        expect(graph.status).toBe(LGraphStatus.STATUS_STOPPED);
    }

    test__runStep__shouldExecuteNodes() {
        const graph = new LGraph();
        const node = LiteGraph.createNode(ConstantNumber) as ConstantNumber;
        graph.add(node);

        graph.runStep(1);

        expect(node.has_errors).toBeFalsy();
        expect(graph.iteration).toBeGreaterThan(0);
    }

    test__findNodesRecursive__shouldIncludeSubgraphNodes() {
        const graph = new LGraph();
        const subgraph = LiteGraph.createNode(Subgraph);
        graph.add(subgraph);
        const inner = LiteGraph.createNode(ConstantNumber);
        subgraph.subgraph.add(inner);

        expect(graph.findNodesByTypeRecursive("basic/const")).toContain(inner);
        expect(graph.findNodesByClassRecursive(ConstantNumber)).toContain(inner);
    }

    test__getGroupOnPos__shouldHitGroupBounds() {
        const graph = new LGraph();
        const group = new LGraphGroup("G");
        group.pos = [0, 0];
        group.size = [100, 100];
        graph.addGroup(group);

        expect(graph.getGroupOnPos(50, 50)).toBe(group);
        expect(graph.getGroupOnPos(200, 200)).toBeNull();
    }

    test__removeLink__unknownIdShouldBeNoop() {
        const graph = new LGraph();

        expect(() => graph.removeLink(999)).not.toThrow();
        expect(Object.keys(graph.links)).toHaveLength(0);
    }

    test__findNodesByTypeAndClass__shouldMatchNodes() {
        const graph = new LGraph();
        const node = LiteGraph.createNode(ConstantNumber);
        graph.add(node);
        graph.add(LiteGraph.createNode(Watch));

        expect(graph.findNodesByType("basic/const")).toContain(node);
        expect(graph.findNodesByClass(ConstantNumber)).toContain(node);
        expect(graph.findNodesByClass(ConstantNumber)).toHaveLength(1);
    }
}
