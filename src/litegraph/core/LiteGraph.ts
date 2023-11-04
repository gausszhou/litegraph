import {
  distance,
  colorToString,
  hex2num,
  num2hex,
  compareObjects,
  growBounding,
  isInsideBounding,
  overlapBounding,
  isInsideRectangle,
  getTime,
} from "./utils";

import CurveEditor from "../tools/CurveEditor";
import ContextMenu from "../tools/ContextMenu";
import DragAndScale from "../tools/DragAndScale";
import LLink from "./LLink";
import LGraph from "./LGraph";
import LGraphNode from "./LGraphNode";
import LGraphGroup from "./LGraphGroup";
import LGraphCanvas from "./LGraphCanvas";
import Subgraph from "./Subgraph";
import GraphInput from "./GraphInput";
import GraphOutput from "./GraphOutput";

/**
 * The Global Scope. It contains all the registered node classes.
 * 全局单例，包含所有注册的节点
 * @class LiteGraph
 * @constructor
 */

class LiteGraph {

  static VERSION = "0.0.1";
  static LLink = LLink;
  static LGraph = LGraph
  static LGraphNode = LGraphNode;
  static LGraphGroup = LGraphGroup;
  static LGraphCanvas = LGraphCanvas;
  static Subgraph = Subgraph;
  static GraphInput = GraphInput;
  static GraphOutput = GraphOutput;
  static ContextMenu = ContextMenu;
  static CurveEditor = CurveEditor;
  static DragAndScale = DragAndScale;
  static node_images_path = ""
  static do_add_triggers_slots = true;
  static _installedPlugins: any[];
  // static use: Function;
  // static extendClass: Function;
  // static closeAllContextMenus: Function;
  static registerNodeType: Function;
  static getNodeTypesCategories: Function;
  static pointerListenerAdd: Function;
  static pointerListenerRemove: Function;


  static getTime = getTime;
  static distance = distance;
  static compareObjects = compareObjects;

  static growBounding = growBounding;
  static overlapBounding = overlapBounding;

  static isInsideBounding = isInsideBounding;
  static isInsideRectangle = isInsideRectangle;

  static colorToString = colorToString;
  static hex2num = hex2num;
  static num2hex = num2hex;

  static CANVAS_GRID_SIZE = 10;
  static NODE_TITLE_HEIGHT = 30;
  static NODE_TITLE_TEXT_Y = 20;
  static NODE_SLOT_HEIGHT = 20;
  static NODE_WIDGET_HEIGHT = 20;
  static NODE_WIDTH = 140;
  static NODE_MIN_WIDTH = 50;
  static NODE_COLLAPSED_RADIUS = 10;
  static NODE_COLLAPSED_WIDTH = 80;
  static NODE_TITLE_COLOR = "#999";
  static NODE_SELECTED_TITLE_COLOR = "#FFF";
  static NODE_TEXT_SIZE = 14;
  static NODE_TEXT_COLOR = "#AAA";
  static NODE_SUBTEXT_SIZE = 12;
  static NODE_DEFAULT_COLOR = "#333";
  static NODE_DEFAULT_BGCOLOR = "#353535";
  static NODE_DEFAULT_BOXCOLOR = "#666";
  static NODE_DEFAULT_SHAPE = "box";
  static NODE_BOX_OUTLINE_COLOR = "#FFF";

  static DEFAULT_SHADOW_COLOR = "rgba(0,0,0,0.5)";
  static DEFAULT_GROUP_FONT = 24;

  static WIDGET_BGCOLOR = "#222";
  static WIDGET_OUTLINE_COLOR = "#666";
  static WIDGET_TEXT_COLOR = "#DDD";
  static WIDGET_SECONDARY_TEXT_COLOR = "#999";

  static LINK_COLOR = "#9A9";
  static EVENT_LINK_COLOR = "#A86";
  static CONNECTING_LINK_COLOR = "#AFA";

  static MAX_NUMBER_OF_NODES = 1000; // avoid infinite loops
  static DEFAULT_POSITION = [100, 100]; //default node position
  static VALID_SHAPES = ["default", "box", "round", "card"]; //"circle"

  //shapes are used for nodes but also for slots
  static BOX_SHAPE = 1;
  static ROUND_SHAPE = 2;
  static CIRCLE_SHAPE = 3;
  static CARD_SHAPE = 4;
  static ARROW_SHAPE = 5;
  static GRID_SHAPE = 6; // intended for slot arrays
  static DEFAULT_SHAPE = 1;
  //enums
  static INPUT = 1;
  static OUTPUT = 2;

  static EVENT = "-1"; // for outputs
  static ACTION = "-1"; // for inputs

  static NODE_MODES = ["Always", "On Event", "Never", "On Trigger"]; // helper, will add "On Request" and more in the future
  static NODE_MODES_COLORS = ["#666", "#422", "#333", "#224", "#626"]; // use with node_box_coloured_by_mode

  static ALWAYS = 0;
  static ON_EVENT = 1;
  static NEVER = 2;
  static ON_TRIGGER = 3;

  static UP = 1;
  static DOWN = 2;
  static LEFT = 3;
  static RIGHT = 4;
  static CENTER = 5;

  static LINK_RENDER_MODES = ["Straight", "Linear", "Spline"]; // helper
  static STRAIGHT_LINK = 0;
  static LINEAR_LINK = 1;
  static SPLINE_LINK = 2;

  static NORMAL_TITLE = 0;
  static NO_TITLE = 1;
  static TRANSPARENT_TITLE = 2;
  static AUTOHIDE_TITLE = 3;
  static VERTICAL_LAYOUT = "vertical"; // arrange nodes vertically

  static proxy = null; // used to redirect calls
  node_images_path = "";

  static debug = false;
  static catch_exceptions = true;
  static throw_errors = true;
  allow_scripts = false; // if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits
  static registered_node_types: any = {}; // nodetypes by string
  node_types_by_file_extension: any = {}; //used for dropping files in the canvas
  Nodes: any = {}; //node types by classname
  Globals: any = {}; //used to store vars between graphs

  searchbox_extras: any = {}; //used to add extra features to the search box
  auto_sort_node_types = false; // [true!] If set to true, will automatically sort node types / categories in the context menus

  node_box_coloured_when_on = false; // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action), visual feedback
  node_box_coloured_by_mode = false; // [true!] nodebox based on node mode, visual feedback

  dialog_close_on_mouse_leave = true; // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  dialog_close_on_mouse_leave_delay = 500;

  shift_click_do_break_link_from = false; // [false!] prefer false if results too easy to break links - implement with ALT or TODO custom keys
  click_do_break_link_to = false; // [false!]prefer false, way too easy to break links

  search_hide_on_mouse_leave = true; // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  search_filter_enabled = false; // [true!] enable filtering slots type in the search widget, !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
  search_show_all_on_open = true; // [true!] opens the results list when opening the search widget

  auto_load_slot_types = false; // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]

  // set these values if not using auto_load_slot_types
  registered_slot_in_types: any = {}; // slot types for nodeclass
  registered_slot_out_types: any = {}; // slot types for nodeclass
  slot_types_in: any[] = []; // slot types IN
  slot_types_out: any[] = []; // slot types OUT
  slot_types_default_in: any[] = []; // specify for each IN slot type a(/many) deafult node(s), use single string, array, or object (with node, title, parameters, ..) like for search
  slot_types_default_out: any[] = []; // specify for each OUT slot type a(/many) deafult node(s), use single string, array, or object (with node, title, parameters, ..) like for search

  alt_drag_do_clone_nodes = false; // [true!] very handy, ALT click to clone and drag the new node

  do_add_triggers_slots = false; // [true!] will create and connect event slots when using action/events connections, !WILL CHANGE node mode when using onTrigger (enable mode colors), onExecuted does not need this

  allow_multi_output_for_events = true; // [false!] being events, it is strongly reccomended to use them sequentually, one by one

  middle_click_slot_add_default_node = false; //[true!] allows to create and connect a ndoe clicking with the third button (wheel)

  release_link_on_empty_shows_menu = false; //[true!] dragging a link to empty space will open a menu, add from list, search or defaults

  static pointerevents_method: "mouse" | "pointer" | "touch" = "mouse"; // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)

  // //used to create nodes from wrapping functions
  static getParameterNames(func: Function) {
    return (func + "")
      .replace(/[/][/].*$/gm, "") // strip single-line comments
      .replace(/\s+/g, "") // strip white space
      .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments  /**/
      .split("){", 1)[0]
      .replace(/^[^(]*[(]/, "") // extract the parameters
      .replace(/=[^,]+/g, "") // strip any ES6 defaults
      .split(",")
      .filter(Boolean); // split & filter [""]
  }
  constructor() { }

  // TODO implement pointercancel, gotpointercapture, lostpointercapture, (pointerover, pointerout if necessary)

  /**
   * Register a node class so it can be listed when the user wants to create a new one
   * 注册一个节点类，以便在用户想要创建一个新节点时列出它
   * @method registerNodeType
   * @param {String} type name of the node and path
   * @param {Class} baseClass class containing the structure of a node
   */

  registerNodeType(type: string, baseClass: any) {
    if (!baseClass.prototype) {
      throw "Cannot register a simple object, it must be a class with a prototype";
    }
    baseClass.type = type;

    if (LiteGraph.debug) {
      console.log("Node registered: " + type);
    }

    let categories = type.split("/");
    let classname = baseClass.name;

    let pos = type.lastIndexOf("/");
    baseClass.category = type.substr(0, pos);

    if (!baseClass.title) {
      baseClass.title = classname;
    }
    //info.name = name.substr(pos+1,name.length - pos);

    //extend class
    if (baseClass.prototype) {
      //is a class
      for (let i in LGraphNode.prototype) {
        if (!baseClass.prototype[i]) {
          baseClass.prototype[i] = (LGraphNode.prototype as any)[i];
        }
      }
    }

    let prev = LiteGraph.registered_node_types[type];
    if (prev) {
      console.log("replacing node type: " + type);
    } else {
      if (!baseClass.prototype.hasOwnProperty("shape")) {
        Object.defineProperty(baseClass.prototype, "shape", {
          set: function (v) {
            switch (v) {
              case "default":
                delete this._shape;
                break;
              case "box":
                this._shape = LiteGraph.BOX_SHAPE;
                break;
              case "round":
                this._shape = LiteGraph.ROUND_SHAPE;
                break;
              case "circle":
                this._shape = LiteGraph.CIRCLE_SHAPE;
                break;
              case "card":
                this._shape = LiteGraph.CARD_SHAPE;
                break;
              default:
                this._shape = v;
            }
          },
          get: function (): string {
            return this._shape;
          },
          enumerable: true,
          configurable: true,
        });

        //warnings
        if (baseClass.prototype.onPropertyChange) {
          console.warn(
            "LiteGraph node class " +
            type +
            " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
          );
        }

        //used to know which nodes create when dragging files to the canvas
        if (baseClass.supported_extensions) {
          for (let i in baseClass.supported_extensions) {
            let ext = baseClass.supported_extensions[i];
            if (ext && ext.constructor === String) this.node_types_by_file_extension[ext.toLowerCase()] = baseClass;
          }
        }
      }
    }

    LiteGraph.registered_node_types[type] = baseClass;
    if (baseClass.constructor.name) {
      this.Nodes[classname] = baseClass;
    }
    // if (LiteGraph.onNodeTypeRegistered) {
    //   LiteGraph.onNodeTypeRegistered(type, baseClass);
    // }
    // if (prev && LiteGraph.onNodeTypeReplaced) {
    //   LiteGraph.onNodeTypeReplaced(type, baseClass, prev);
    // }

    //warnings
    if (baseClass.prototype.onPropertyChange) {
      console.warn(
        "LiteGraph node class " +
        type +
        " has onPropertyChange method, it must be called onPropertyChanged with d at the end"
      );
    }

    //used to know which nodes create when dragging files to the canvas
    if (baseClass.supported_extensions) {
      for (let i = 0; i < baseClass.supported_extensions.length; i++) {
        let ext = baseClass.supported_extensions[i];
        if (ext && ext.constructor === String) this.node_types_by_file_extension[ext.toLowerCase()] = baseClass;
      }
    }

    // TODO one would want to know input and ouput :: this would allow trought registerNodeAndSlotType to get all the slots types
    //console.debug("Registering "+type);
    // if (this.auto_load_slot_types) nodeTmp = new base_class(base_class.title || "tmpnode");
  }
  /**
   * removes a node type from the system
   * @method unregisterNodeType
   * @param {String|Object} type name of the node or the node constructor itself
   */
  unregisterNodeType(type: string | LGraphNode) {
    let baseClass = type.constructor === String ? LiteGraph.registered_node_types[type] : type;
    if (!baseClass) throw "node type not found: " + type;
    delete LiteGraph.registered_node_types[baseClass.type];
    if (baseClass.constructor.name) delete this.Nodes[baseClass.constructor.name];
  }
  /**
   * Save a slot type and his node
   * @method registerSlotType
   * @param {String|Object} type name of the node or the node constructor itself
   * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
   */
  registerNodeAndSlotType(type: string, slot_type: string, out: string | boolean = false) {
    let baseClass = {};
    if (typeof type === "string" && LiteGraph.registered_node_types[type] !== "anonymous") {
      baseClass = LiteGraph.registered_node_types[type]
    } else {
      baseClass = type
    }
    const slotNoeType = (baseClass.constructor as unknown as LGraphNode).type;
    let allTypes;
    if (typeof slot_type == "string") {
      allTypes = slot_type.split(",");
    } else if (slot_type == LiteGraph.EVENT || slot_type == LiteGraph.ACTION) {
      allTypes = ["_event_"];
    } else {
      allTypes = ["*"];
    }

    for (let i = 0; i < allTypes.length; ++i) {
      let slotType = allTypes[i];
      if (slotType === "") {
        slotType = "*";
      }
      type slotTypes = "registered_slot_out_types" | "registered_slot_in_types";
      let registerTo: slotTypes = out ? "registered_slot_out_types" : "registered_slot_in_types";
      if (typeof this[registerTo][slotType] === "undefined") {
        this[registerTo][slotType] = { nodes: [] };
      }

      this[registerTo][slotType].nodes.push(slotNoeType);

      // check if is a new type
      if (!out) {
        if (!this.slot_types_in.includes(slotType.toLowerCase())) {
          this.slot_types_in.push(slotType.toLowerCase());
          this.slot_types_in.sort();
        }
      } else {
        if (!this.slot_types_out.includes(slotType.toLowerCase())) {
          this.slot_types_out.push(slotType.toLowerCase());
          this.slot_types_out.sort();
        }
      }
    }
  }
  /**
   * Create a new nodetype by passing a function, it wraps it with a proper class and generates inputs according to the parameters of the function.
   * Useful to wrap simple methods that do not require properties, and that only process some input to generate an output.
   * @method wrapFunctionAsNode
   * @param {String} name node name with namespace (p.e.: 'math/sum')
   * @param {Function} func
   * @param {Array} param_types [optional] an array containing the type of every parameter, otherwise parameters will accept any type
   * @param {String} return_type [optional] string with the return type, otherwise it will be generic
   * @param {Object} properties [optional] properties to be configurable
   */
  wrapFunctionAsNode(name: string, func: Function, param_types: string, return_type: string, properties: any) {
    let params = Array(func.length);
    let code = "";
    let names = LiteGraph.getParameterNames(func);
    for (let i = 0; i < names.length; ++i) {
      code +=
        "this.addInput('" +
        names[i] +
        "'," +
        (param_types && param_types[i] ? "'" + param_types[i] + "'" : "0") +
        ");\n";
    }
    code += "this.addOutput('out'," + (return_type ? "'" + return_type + "'" : 0) + ");\n";
    if (properties) {
      code += "this.properties = " + JSON.stringify(properties) + ";\n";
    }
    let classobj: any = Function(code);
    classobj.title = name.split("/").pop();
    classobj.desc = "Generated from " + func.name;
    classobj.prototype.onExecute = function onExecute() {
      for (let i = 0; i < params.length; ++i) {
        params[i] = this.getInputData(i);
      }
      let r = func.apply(this, params);
      this.setOutputData(0, r);
    };
    this.registerNodeType(name, classobj);
  }
  /**
   * Removes all previously registered node's types
   */
  clearRegisteredTypes() {
    LiteGraph.registered_node_types = {};
    this.node_types_by_file_extension = {};
    this.Nodes = {};
    this.searchbox_extras = {};
  }
  /**
   * Adds this method to all nodetypes, existing and to be created
   * (You can add it to LGraphNode.prototype but then existing node types wont have it)
   * @method addNodeMethod
   * @param {Function} func
   */
  addNodeMethod(name: string, func: Function) {
    (LGraphNode.prototype as any)[name] = func;
    for (let i in LiteGraph.registered_node_types) {
      let type = LiteGraph.registered_node_types[i];
      if (type.prototype[name]) {
        type.prototype["_" + name] = type.prototype[name];
      } //keep old in case of replacing
      type.prototype[name] = func;
    }
  }
  /**
   * Create a node of a given type with a name. The node is not attached to any graph yet.
   * @method createNode
   * @param {String} type full name of the node class. p.e. "math/sin"
   * @param {String} name a name to distinguish from other nodes
   * @param {Object} options to set options
   */

  static createNode(type: string, title: string = "", options: any = {}) {
    let baseClass = this.registered_node_types[type];
    if (!baseClass) {
      if (LiteGraph.debug) {
        console.log('GraphNode type "' + type + '" not registered.');
      }
      return null;
    }

    let prototype = baseClass.prototype || baseClass;

    title = title || baseClass.title || type;

    let node = null;

    if (LiteGraph.catch_exceptions) {
      try {
        node = new baseClass(title);
      } catch (err) {
        console.error(err);
        return null;
      }
    } else {
      node = new baseClass(title);
    }

    node.type = type;

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
      node.pos = LiteGraph.DEFAULT_POSITION.concat();
    }
    if (!node.mode) {
      node.mode = LiteGraph.ALWAYS;
    }

    //extra options
    if (options) {
      for (let i in options) {
        node[i] = options[i];
      }
    }

    // callback
    if (node.onNodeCreated) {
      node.onNodeCreated();
    }

    return node;
  }
  /**
   * Returns a registered node type with a given name
   * @method getNodeType
   * @param {String} type full name of the node class. p.e. "math/sin"
   * @return {Class} the node class
   */
  getNodeType(type: string): Map<string, any> {
    return LiteGraph.registered_node_types[type];
  }

  /**
   * Returns a list of node types matching one category
   * @method getNodeType
   * @param {String} category category name
   * @return {Array} array with all the node classes
   */

  getNodeTypesInCategory(category: string, filter: string): any[] {
    let r = [];
    for (let i in LiteGraph.registered_node_types) {
      let type = LiteGraph.registered_node_types[i];
      if (type.filter != filter) {
        continue;
      }

      if (category == "") {
        if (type.category == null) {
          r.push(type);
        }
      } else if (type.category == category) {
        r.push(type);
      }
    }

    if (this.auto_sort_node_types) {
      r.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
    }

    return r;
  }
  /**
   * Returns a list with all the node type categories
   * @method getNodeTypesCategories
   * @param {String} filter only nodes with ctor.filter equal can be shown
   * @return {Array} array with all the names of the categories
   */
  getNodeTypesCategories(filter: string) {
    let categories: any = { "": 1 };
    for (let i in LiteGraph.registered_node_types) {
      let type = LiteGraph.registered_node_types[i];
      if (type.category && !type.skip_list) {
        if (type.filter != filter) continue;
        categories[type.category] = 1;
      }
    }
    let result = [];
    for (let i in categories) {
      result.push(i);
    }
    return this.auto_sort_node_types ? result.sort() : result;
  }
  //debug purposes: reloads all the js scripts that matches a wildcard
  reloadNodes(folder_wildcard: string) {
    let tmp = document.getElementsByTagName("script");
    //weird, this array changes by its own, so we use a copy
    let script_files = [];
    for (let i = 0; i < tmp.length; i++) {
      script_files.push(tmp[i]);
    }

    let docHeadObj = document.getElementsByTagName("head")[0];
    folder_wildcard = document.location.href + folder_wildcard;

    for (let i = 0; i < script_files.length; i++) {
      let src = script_files[i].src;
      if (!src || src.substr(0, folder_wildcard.length) != folder_wildcard) {
        continue;
      }

      try {
        if (LiteGraph.debug) {
          console.log("Reloading: " + src);
        }
        let dynamicScript = document.createElement("script");
        dynamicScript.type = "text/javascript";
        dynamicScript.src = src;
        docHeadObj.appendChild(dynamicScript);
        docHeadObj.removeChild(script_files[i]);
      } catch (err) {
        if (LiteGraph.throw_errors) {
          throw err;
        }
        if (LiteGraph.debug) {
          console.log("Error while reloading " + src);
        }
      }
    }

    if (LiteGraph.debug) {
      console.log("Nodes reloaded");
    }
  }
  //separated just to improve if it doesn't work
  static cloneObject(obj: any, target?: any) {
    if (obj == null) {
      return null;
    }
    let r = JSON.parse(JSON.stringify(obj));
    if (!target) {
      return r;
    }

    for (let i in r) {
      target[i] = r[i];
    }
    return target;
  }
  /**
   * Returns if the types of two slots are compatible (taking into account wildcards, etc)
   * @method isValidConnection
   * @param {String} type_a
   * @param {String} type_b
   * @return {Boolean} true if they can be connected
   */
  static isValidConnection(type_a: string, type_b: string): boolean {
    if (type_a === "" || type_a === "*") return true;
    if (type_b === "" || type_b === "*") return true;
    // same type (is valid for triggers)
    if (type_a == type_b) {
      return true;
    }
    if (type_a === LiteGraph.EVENT && type_b === LiteGraph.ACTION) return true

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
    let supported_types_a = type_a.split(",");
    let supported_types_b = type_b.split(",");
    for (let i = 0; i < supported_types_a.length; ++i) {
      for (let j = 0; j < supported_types_b.length; ++j) {
        if (this.isValidConnection(supported_types_a[i], supported_types_b[j])) {
          //if (supported_types_a[i] == supported_types_b[j]) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Register a string in the search box so when the user types it it will recommend this node
   * @method registerSearchboxExtra
   * @param {String} node_type the node recommended
   * @param {String} description text to show next to it
   * @param {Object} data it could contain info of how the node should be configured
   * @return {Boolean} true if they can be connected
   */
  registerSearchboxExtra(node_type: string, description: string, data: any) {
    this.searchbox_extras[description.toLowerCase()] = {
      type: node_type,
      desc: description,
      data: data
    };
  }
  /**
 * Wrapper to load files (from url using fetch or from file using FileReader)
 * @method loadFile
 * @param {File|Blob} url the url of the file (or the file itself)
 * @param {String} type an string to know how to fetch it: "text","arraybuffer","json","blob"
 * @param {Function} onComplete callback(data)
 * @param {Function} onError in case of an error
 * @return {FileReader|Promise} returns the object used to
 */
  loadFile(url: File | Blob, type: string, onComplete: Function, onError: Function) {
    if (!url) return null;
    if (url.constructor === File || url.constructor === Blob) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        let v = e.target.result;
        if (type === "json") v = JSON.parse(v);
        if (onComplete) onComplete(v);
      };
      reader.onerror = (e) => {
        if (onError) onError(e)
      }
      if (type == "arraybuffer") return reader.readAsArrayBuffer(url);
      else if (type == "text" || type == "json") return reader.readAsText(url);
      else if (type == "blob") return reader.readAsBinaryString(url);
    }
    return null;
  }

  /* LiteGraph GUI elements used for canvas editing *************************************/
  // TODO Refactor
  static closeAllContextMenus(refWindow: Window | null) {
    refWindow = refWindow || window;

    const elements = refWindow.document.querySelectorAll(".litecontextmenu");
    if (!elements.length) {
      return;
    }

    const menus = [];
    for (let i = 0; i < elements.length; i++) {
      menus.push(elements[i]);
    }

    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i]
      if (menu.parentNode) {
        menu.parentNode.removeChild(menu);
      }
    }
  };

  static extendClass(target: any, origin: any) {
    for (let i in origin) {
      //copy class properties
      if (target.hasOwnProperty(i)) {
        continue;
      }
      target[i] = origin[i];
    }

    if (origin.prototype) {
      //copy prototype properties
      for (let i in origin.prototype) {
        //only enumerable
        if (!origin.prototype.hasOwnProperty(i)) {
          continue;
        }

        if (target.prototype.hasOwnProperty(i)) {
          //avoid overwriting existing ones
          continue;
        }

        //copy getters
        if (origin.prototype.__lookupGetter__(i)) {
          target.prototype.__defineGetter__(i, origin.prototype.__lookupGetter__(i));
        } else {
          target.prototype[i] = origin.prototype[i];
        }

        //and setters
        if (origin.prototype.__lookupSetter__(i)) {
          target.prototype.__defineSetter__(i, origin.prototype.__lookupSetter__(i));
        }
      }
    }
  };


  static use(plugin: any) {
    // 获取已经安装的插件
    const installedPlugins = LiteGraph._installedPlugins || (LiteGraph._installedPlugins = []);
    // 看看插件是否已经安装，如果安装了直接返回
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    const args = Array.from(arguments)
    args.unshift(this);
    if (typeof plugin.install === "function") {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === "function") {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this;
  };


  pointerListenerRemove(oDOM: HTMLElement, sEvent: string, callback: EventListenerOrEventListenerObject, capture = false) {
    if (!oDOM || !oDOM.removeEventListener || !sEvent || typeof callback !== "function") {
      //console.log("cant pointerListenerRemove "+oDOM+", "+sEvent+", "+fCall);
      return; // -- break --
    }
    switch (sEvent) {
      //both pointer and move events
      case "down":
      case "up":
      case "move":
      case "over":
      case "out":
      case "enter": {
        if (LiteGraph.pointerevents_method == "pointer" || LiteGraph.pointerevents_method == "mouse") {
          oDOM.removeEventListener(LiteGraph.pointerevents_method + sEvent, callback, capture);
        }
      }
      // only pointerevents
      case "leave":
      case "cancel":
      case "gotpointercapture":
      case "lostpointercapture": {
        if (LiteGraph.pointerevents_method == "pointer") {
          return oDOM.removeEventListener(LiteGraph.pointerevents_method + sEvent, callback, capture);
        }
      }
      // not "pointer" || "mouse"
      default:
        return oDOM.removeEventListener(sEvent, callback, capture);
    }
  };

  /* helper for interaction: pointer, touch, mouse Listeners
used by LGraphCanvas DragAndScale ContextMenu*/
  pointerListenerAdd(oDOM: HTMLElement, sEvIn: string, callback: EventListenerOrEventListenerObject, capture = false) {
    if (!oDOM || !oDOM.addEventListener || !sEvIn || typeof callback !== "function") {
      //console.log("cant pointerListenerAdd "+oDOM+", "+sEvent+", "+fCall);
      return; // -- break --
    }

    let sMethod = LiteGraph.pointerevents_method;
    let sEvent = sEvIn;

    // UNDER CONSTRUCTION
    // convert pointerevents to touch event when not available
    if (sMethod == "pointer" && !window.PointerEvent) {
      console.warn("sMethod=='pointer' && !window.PointerEvent");
      console.log(
        "Converting pointer[" + sEvent + "] : down move up cancel enter TO touchstart touchmove touchend, etc .."
      );
      switch (sEvent) {
        case "down": {
          sMethod = "touch";
          sEvent = "start";
          break;
        }
        case "move": {
          sMethod = "touch";
          //sEvent = "move";
          break;
        }
        case "up": {
          sMethod = "touch";
          sEvent = "end";
          break;
        }
        case "cancel": {
          sMethod = "touch";
          //sEvent = "cancel";
          break;
        }
        case "enter": {
          console.log("debug: Should I send a move event?"); // ???
          break;
        }
        // case "over": case "out": not used at now
        default: {
          console.warn("PointerEvent not available in this browser ? The event " + sEvent + " would not be called");
        }
      }
    }

    switch (sEvent) {
      //both pointer and move events
      case "down":
      case "up":
      case "move":
      case "over":
      case "out":
      case "enter": {
        oDOM.addEventListener(sMethod + sEvent, callback, capture);
      }
      // only pointerevents
      case "leave":
      case "cancel":
      case "gotpointercapture":
      case "lostpointercapture": {
        if (sMethod != "mouse") {
          return oDOM.addEventListener(sMethod + sEvent, callback, capture);
        }
      }
      // not "pointer" || "mouse"
      default:
        return oDOM.addEventListener(sEvent, callback, capture);
    }
  };
}

export default LiteGraph;
