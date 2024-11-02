import type {
    LGraphNodeConstructor,
    LGraphNodeConstructorFactory,
    NodeTypeSpec,
    PropertyLayout,
    SearchboxExtra,
    SlotLayout,
} from "./LGraphNode";
import LGraphNode from "./LGraphNode";
import LiteConst from "./LiteConst";
import {
    BuiltInSlotType,
    NodeMode,
    PointerEventsMethod,
    SlotType,
    Vector2,
} from "./types";
import { getStaticProperty } from "./utils";

export type LiteGraphCreateNodeOptions = {
    constructorArgs?: any[];
    instanceProps?: Record<any, any>;
};

export default class LiteCommon extends LiteConst {

    //separated just to improve if it doesn't work
    static cloneObject<T>(obj?: T, target?: T): T {
        if (obj == null) {
            return null;
        }
        var r = JSON.parse(JSON.stringify(obj));
        if (!target) {
            return r;
        }

        for (var i in r) {
            target[i] = r[i];
        }
        return target;
    }

    /**
     * Create a node of a given type with a name. The node is not attached to any graph yet.
     * @param type full name of the node class. p.e. "math/sin"
     * @param name a name to distinguish from other nodes
     * @param options to set options
     */
    static createNode<T extends LGraphNode>(
        type: string | LGraphNodeConstructorFactory<T>,
        title?: string,
        options: LiteGraphCreateNodeOptions = {}
    ): T {
        let regConfig: LGraphNodeConstructor | null = null;
        let typeID: string; // serialization ID like "basic/const"

        if (typeof type === "string") {
            typeID = type;
        } else {
            typeID = (type as any).__LITEGRAPH_TYPE__;
            if (!typeID) {
                console.error(type);
                throw "Node was not registered yet!";
            }
        }

        regConfig = LiteCommon.registered_node_types[typeID];

        if (!regConfig) {
            console.warn('GraphNode type "' + type + '" not registered.');
            return null;
        }

        title = title || regConfig.title || typeID;

        var node: T = null;
        const args = options.constructorArgs || [];

        if (LiteCommon.catch_exceptions) {
            try {
                node = new regConfig.class(title, ...args) as T;
            } catch (err) {
                console.error("Error creating node!", err);
                return null;
            }
        } else {
            node = new regConfig.class(title, ...args) as T;
        }

        node.class = regConfig.class;
        node.type = typeID;

        if (!node.title && title) {
            node.title = title;
        }
        if (!node.properties) {
            node.properties = {};
        }
        if (!node.properties_info) {
            node.properties_info = [];
        }
        if (!node.flags) {
            node.flags = {};
        }
        if (!node.size) {
            node.size = node.computeSize();
            //call onresize?
        }
        if (!node.pos) {
            node.pos = [
                LiteCommon.DEFAULT_POSITION[0],
                LiteCommon.DEFAULT_POSITION[1],
            ];
        }
        if (!node.mode) {
            node.mode = NodeMode.ALWAYS;
        }

        //extra options
        if (options.instanceProps) {
            for (var i in options.instanceProps) {
                node[i] = options.instanceProps[i];
            }
        }

        const propertyLayout = getStaticProperty<PropertyLayout>(
            regConfig.class,
            "propertyLayout"
        );
        if (propertyLayout) {
            if (LiteCommon.debug)
                console.debug("Found property layout!", propertyLayout);
            for (const item of propertyLayout) {
                const { name, defaultValue, type, options } = item;
                node.addProperty(name, defaultValue, type, options);
            }
        }

        const slotLayout = getStaticProperty<SlotLayout>(
            regConfig.class,
            "slotLayout"
        );
        if (slotLayout) {
            if (LiteCommon.debug)
                console.debug("Found slot layout!", slotLayout);
            if (slotLayout.inputs) {
                for (const item of slotLayout.inputs) {
                    const { name, type, options } = item;
                    node.addInput(name, type, options);
                }
            }
            if (slotLayout.outputs) {
                for (const item of slotLayout.outputs) {
                    const { name, type, options } = item;
                    node.addOutput(name, type, options);
                }
            }
        }

        // callback
        if (node.onNodeCreated) {
            node.onNodeCreated();
        }

        return node;
    }

    /**
     * Returns if the types of two slots are compatible (taking into account wildcards, etc)
     * @method isValidConnection
     * @param {String} type_a
     * @param {String} type_b
     * @return {Boolean} true if they can be connected
     */
    static isValidConnection(type_a: SlotType, type_b: SlotType) {
        if (type_a == "" || type_a === "*") type_a = BuiltInSlotType.DEFAULT;
        if (type_b == "" || type_b === "*") type_b = BuiltInSlotType.DEFAULT;
        if (
            !type_a || //generic output
            !type_b || // generic input
            type_a == type_b || //same type (is valid for triggers)
            (type_a == BuiltInSlotType.EVENT &&
                type_b == BuiltInSlotType.ACTION) ||
            (type_a == BuiltInSlotType.ACTION &&
                type_b == BuiltInSlotType.EVENT)
        ) {
            return true;
        }

        // Enforce string type to handle toLowerCase call (-1 number not ok)
        type_a = String(type_a);
        type_b = String(type_b);
        type_a = type_a.toLowerCase();
        type_b = type_b.toLowerCase();

        // For nodes supporting multiple connection types
        if (type_a.indexOf(",") == -1 && type_b.indexOf(",") == -1) {
            return type_a == type_b;
        }

        // Check all permutations to see if one is valid
        var supported_types_a = type_a.split(",");
        var supported_types_b = type_b.split(",");
        for (var i = 0; i < supported_types_a.length; ++i) {
            for (var j = 0; j < supported_types_b.length; ++j) {
                if (
                    this.isValidConnection(
                        supported_types_a[i],
                        supported_types_b[j]
                    )
                ) {
                    //if (supported_types_a[i] == supported_types_b[j]) {
                    return true;
                }
            }
        }

        return false;
    }

    static isInsideRectangle(
        x: number,
        y: number,
        left: number,
        top: number,
        width: number,
        height: number
    ): boolean {
        if (left < x && left + width > x && top < y && top + height > y) {
            return true;
        }
        return false;
    }

    /**
     * Save a slot type and his node
     * @method registerSlotType
     * @param {String|Object} type name of the node or the node constructor itself
     * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
     */
    static registerNodeAndSlotType(
        type: string | LGraphNodeConstructor | LGraphNode,
        slot_type: SlotType,
        out: boolean = false
    ) {
        let regConfig: LGraphNodeConstructor;

        if (typeof type === "string") {
            // if (LiteCommon.registered_node_types[type] !== "anonymous") {
            regConfig = LiteCommon.registered_node_types[type];
            // }
            // else {
            //     regConfig = type;
            // }
        } else if ("type" in type)
            regConfig = LiteCommon.registered_node_types[type.type];
        else {
            regConfig = type;
        }

        if (!regConfig) {
            throw "Node not registered!" + type;
        }

        var sCN = (regConfig.class as any).__litegraph_type__;

        if (typeof slot_type == "string") {
            var aTypes = slot_type.split(",");
        } else if (
            slot_type == BuiltInSlotType.EVENT ||
            slot_type == BuiltInSlotType.ACTION
        ) {
            var aTypes = ["_event_"];
        } else {
            var aTypes = ["*"];
        }

        for (var i = 0; i < aTypes.length; ++i) {
            var sT = aTypes[i]; //.toLowerCase();
            if (sT === "") {
                sT = "*";
            }
            var registerTo = out
                ? "registered_slot_out_types"
                : "registered_slot_in_types";
            if (typeof this[registerTo][sT] == "undefined")
                this[registerTo][sT] = { nodes: [] };
            this[registerTo][sT].nodes.push(sCN);

            // check if is a new type
            if (sT !== "_event_" && sT !== "*") {
                if (!out) {
                    if (!LiteCommon.slot_types_in.includes(sT.toLowerCase())) {
                        LiteCommon.slot_types_in.push(sT.toLowerCase());
                        LiteCommon.slot_types_in.sort();
                    }
                } else {
                    if (!LiteCommon.slot_types_out.includes(sT.toLowerCase())) {
                        LiteCommon.slot_types_out.push(sT.toLowerCase());
                        LiteCommon.slot_types_out.sort();
                    }
                }
            }
        }
    }
    static getTime(): number {
        return Date.now();
    }
}
