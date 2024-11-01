import type {
    LGraphNodeConstructor,
    LGraphNodeConstructorFactory,
    NodeTypeSpec,
    PropertyLayout,
    SearchboxExtra,
    SlotLayout,
} from "./LGraphNode";
import LGraphNode from "./LGraphNode";
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

export default class LiteCommon {
    static VERSION: number = 10.0;
    static _installedPlugins: any = [];

    static CANVAS_GRID_SIZE: number = 10;

    static NODE_TITLE_HEIGHT: number = 20;
    static NODE_TITLE_TEXT_Y: number = 15;
    static NODE_SLOT_HEIGHT: number = 20;
    static NODE_WIDGET_HEIGHT: number = 20;
    static NODE_WIDTH: number = 140;
    static NODE_MIN_WIDTH: number = 50;
    static NODE_COLLAPSED_RADIUS: number = 10;
    static NODE_COLLAPSED_WIDTH: number = 80;
    static NODE_TITLE_COLOR: string = "#999";
    static NODE_SELECTED_TITLE_COLOR: string = "#FFF";
    static NODE_TEXT_SIZE: number = 14;
    static NODE_TEXT_COLOR: string = "#AAA";
    static NODE_SUBTEXT_SIZE: number = 12;
    static NODE_DEFAULT_COLOR: string = "#333";
    static NODE_DEFAULT_BGCOLOR: string = "#353535";
    static NODE_DEFAULT_BOXCOLOR: string = "#666";
    static NODE_DEFAULT_SHAPE: string = "box";
    static NODE_BOX_OUTLINE_COLOR: string = "#FFF";
    static DEFAULT_SHADOW_COLOR: string = "rgba(0,0,0,0.5)";
    static DEFAULT_GROUP_FONT_SIZE: number = 24;

    static WIDGET_BGCOLOR: string = "#222";
    static WIDGET_OUTLINE_COLOR: string = "#666";
    static WIDGET_TEXT_COLOR: string = "#DDD";
    static WIDGET_SECONDARY_TEXT_COLOR: string = "#999";

    static LINK_COLOR: string = "#9A9";
    static EVENT_LINK_COLOR: string = "#A86";
    static ACTION_LINK_COLOR: string = "#86A";
    static CONNECTING_LINK_COLOR: string = "#AFA";

    static MAX_NUMBER_OF_NODES: number = 1000; //avoid infinite loops
    static DEFAULT_POSITION: Vector2 = [100, 100]; //default node position

    static proxy: any = null; //used to redirect calls
    static node_images_path: string = "";

    static debug: boolean = false;
    static catch_exceptions: boolean = true;
    static throw_errors: boolean = true;
    /** if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits */
    static allow_scripts: boolean = false;
    /** node types by string */
    static registered_node_types: Record<string, LGraphNodeConstructor> = {};
    /** used for dropping files in the canvas */
    static node_types_by_file_extension: Record<string, LGraphNodeConstructor> =
        {};
    /** node types by class name */
    static Nodes: Record<string, LGraphNodeConstructor> = {};
    /** used to store vars between graphs **/
    static Globals: Record<any, any> = {};

    /** used to add extra features to the search box */
    static searchbox_extras: Record<string, SearchboxExtra> = {};

    // [true!] If set to true, will automatically sort node types / categories in the context menus
    static auto_sort_node_types: boolean = false;

    // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action), visual feedback
    static node_box_coloured_when_on: boolean = false;
    // [true!] nodebox based on node mode; visual feedback
    static node_box_coloured_by_mode: boolean = false;

    // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
    static dialog_close_on_mouse_leave: boolean = true;
    static dialog_close_on_mouse_leave_delay: number = 500;

    // [false!] prefer false if results too easy to break links - implement with ALT or TODO custom keys
    static shift_click_do_break_link_from: boolean = false;
    // [false!]prefer false, way too easy to break links
    static click_do_break_link_to: boolean = false;

    // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
    static search_hide_on_mouse_leave: boolean = true;
    // [true!] enable filtering slots type in the search widget, !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
    static search_filter_enabled: boolean = false;
    // [true!] opens the results list when opening the search widget
    static search_show_all_on_open: boolean = true;

    // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]
    static auto_load_slot_types: boolean = false;

    // slot types for nodeclass
    static registered_slot_in_types: Record<string, { nodes: string[] }> = {};
    // slot types for nodeclass
    static registered_slot_out_types: Record<string, { nodes: string[] }> = {};
    // slot types IN
    static slot_types_in: Array<string> = [];
    // slot types OUT
    static slot_types_out: Array<string> = [];
    // specify for each IN slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
    static slot_types_default_in: Record<string, NodeTypeSpec[]> = {};
    // specify for each OUT slot type a(/many) default node(s), use single string, array, or object (with node, title, parameters, ..) like for search
    static slot_types_default_out: Record<string, NodeTypeSpec[]> = {};

    // [true!] very handy, ALT click to clone and drag the new node
    static alt_drag_do_clone_nodes: boolean = false;

    // [true!] will create and connect event slots when using action/events connections, !WILL CHANGE node mode when using onTrigger (enable mode colors), onExecuted does not need this
    static do_add_triggers_slots: boolean = false;

    // [false!] being events, it is strongly reccomended to use them sequentially, one by one
    static allow_multi_output_for_events: boolean = true;

    //[true!] allows to create and connect a ndoe clicking with the third button (wheel)
    static middle_click_slot_add_default_node: boolean = false;

    //[true!] dragging a link to empty space will open a menu, add from list, search or defaults
    static release_link_on_empty_shows_menu: boolean = false;

    //[false!] do not allow interacting with widgets
    static ignore_all_widget_events: boolean = false;

    // use mouse for retrocompatibility issues? (none found @ now)
    static pointerevents_method: PointerEventsMethod = "mouse";

    // if true, all newly created nodes/links will use string UUIDs for their id fields instead of integers.
    // use this if you must have node IDs that are unique across all graphs and subgraphs.
    static use_uuids: boolean = false;

    // delay in milliseconds between typing in the search box and refreshing the list
    static search_box_refresh_interval_ms: number = 250;

    // use a combo widget for selecting graph input/output types instead of a text box
    static graph_inputs_outputs_use_combo_widget: boolean = false;

    // if true, save a _data entry in serialized node outputs for debugging
    static serialize_slot_data: boolean = false;

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
