import { toArray } from "lodash-es";

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
  getTime
} from "./utils";

import CurveEditor from "../tools/CurveEditor";
import ContextMenu from "../tools/ContextMenu";
import DragAndScale from "../tools/DragAndScale";

import LGraph from "./LGraph";
import LGraphCanvas from "./LGraphCanvas";
import LGraphGroup from "./LGraphGroup";
import LGraphNode from "./LGraphNode";
import LLink from "./LLink";
import Subgraph from "./Subgraph";

/**
 * The Global Scope. It contains all the registered node classes.
 * 全局单例，包含所有注册的节点
 * @class LiteGraph
 * @constructor
 */

class LiteGraph  {
  VERSION ="0.0.1"
  ContextMenu = ContextMenu

  distance = distance;
  compareObjects = compareObjects;

  growBounding = growBounding;
  isInsideBounding = isInsideBounding;
  overlapBounding = overlapBounding;
  isInsideRectangle = isInsideRectangle;

  colorToString = colorToString;
  hex2num = hex2num;
  num2hex = num2hex;
  getTime = getTime;

  static registerNodeType:Function
  static getNodeTypesCategories:Function
  CANVAS_GRID_SIZE = 10;
  
  NODE_TITLE_HEIGHT = 30

  NODE_TITLE_TEXT_Y = 20;

  NODE_SLOT_HEIGHT= 20;
  NODE_WIDGET_HEIGHT= 20
  NODE_WIDTH= 140
  NODE_MIN_WIDTH= 50
  NODE_COLLAPSED_RADIUS= 10
  NODE_COLLAPSED_WIDTH= 80
  NODE_TITLE_COLOR= "#999"
  NODE_SELECTED_TITLE_COLOR= "#FFF"
  NODE_TEXT_SIZE= 14
  NODE_TEXT_COLOR= "#AAA"
  NODE_SUBTEXT_SIZE= 12
  NODE_DEFAULT_COLOR= "#333"
  NODE_DEFAULT_BGCOLOR= "#353535"
  NODE_DEFAULT_BOXCOLOR= "#666"
  NODE_DEFAULT_SHAPE= "box"
  NODE_BOX_OUTLINE_COLOR= "#FFF"

  DEFAULT_SHADOW_COLOR ="rgba(0,0,0,0.5)"
  DEFAULT_GROUP_FONT = 24

  WIDGET_BGCOLOR = "#222"
  WIDGET_OUTLINE_COLOR = "#666"
  WIDGET_TEXT_COLOR = "#DDD"
  WIDGET_SECONDARY_TEXT_COLOR = "#999"

  LINK_COLOR= "#9A9"
  EVENT_LINK_COLOR= "#A86"
  CONNECTING_LINK_COLOR= "#AFA"

  MAX_NUMBER_OF_NODES = 1000 // avoid infinite loops
  DEFAULT_POSITION= [100, 100] //default node position
  VALID_SHAPES= ["default", "box", "round", "card"] //"circle"

  //shapes are used for nodes but also for slots
  BOX_SHAPE= 1
  ROUND_SHAPE= 2
  CIRCLE_SHAPE= 3
  CARD_SHAPE= 4
  ARROW_SHAPE= 5
  GRID_SHAPE = 6 // intended for slot arrays
  DEFAULT_SHAPE = 1
  //enums
  INPUT = 1
  OUTPUT = 2

  EVENT = -1 //for outputs
  ACTION = -1 //for inputs

  NODE_MODES= ["Always", "On Event", "Never", "On Trigger"], // helper, will add "On Request" and more in the future
  NODE_MODES_COLORS= ["#666", "#422", "#333", "#224", "#626"], // use with node_box_coloured_by_mode
  ALWAYS= 0
  ON_EVENT= 1
  NEVER = 2
  ON_TRIGGER = 3

   UP = 1
   DOWN = 2
   LEFT = 3
   RIGHT = 4
   CENTER = 5

  LINK_RENDER_MODES = ["Straight", "Linear", "Spline"] // helper
  STRAIGHT_LINK= 0
  LINEAR_LINK= 1
  SPLINE_LINK= 2

  NORMAL_TITLE = 0
  NO_TITLE=  1
  TRANSPARENT_TITLE = 2
  AUTOHIDE_TITLE = 3
  VERTICAL_LAYOUT = "vertical" // arrange nodes vertically

  proxy= null //used to redirect calls
  node_images_path = ""

   static debug = false;
  catch_exceptions= true
  throw_errors=true
  allow_scripts= false //if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration), which could lead to exploits
  registered_node_types= {}//nodetypes by string
  node_types_by_file_extension= {} //used for dropping files in the canvas
  Nodes= {} //node types by classname
  Globals= {} //used to store vars between graphs

  searchbox_extras= {} //used to add extra features to the search box
  auto_sort_node_types=false // [true!] If set to true, will automatically sort node types / categories in the context menus

  node_box_coloured_when_on= false // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action), visual feedback
  node_box_coloured_by_mode= false // [true!] nodebox based on node mode, visual feedback

  dialog_close_on_mouse_leave=true // [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  dialog_close_on_mouse_leave_delay= 500

  shift_click_do_break_link_from= false // [false!] prefer false if results too easy to break links - implement with ALT or TODO custom keys
  click_do_break_link_to= false // [false!]prefer false, way too easy to break links

  search_hide_on_mouse_leave= true// [false on mobile] better true if not touch device, TODO add an helper/listener to close if false
  search_filter_enabled= false // [true!] enable filtering slots type in the search widget, !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
  search_show_all_on_open= true // [true!] opens the results list when opening the search widget

  auto_load_slot_types= false // [if want false, use true, run, get vars values to be statically set, than disable] nodes types and nodeclass association with node types need to be calculated, if dont want this, calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]

  // set these values if not using auto_load_slot_types
  registered_slot_in_types= {} // slot types for nodeclass
  registered_slot_out_types= {} // slot types for nodeclass
  slot_types_in= [] // slot types IN
  slot_types_out= [] // slot types OUT
  slot_types_default_in= [] // specify for each IN slot type a(/many) deafult node(s), use single string, array, or object (with node, title, parameters, ..) like for search
  slot_types_default_out= [] // specify for each OUT slot type a(/many) deafult node(s), use single string, array, or object (with node, title, parameters, ..) like for search

  alt_drag_do_clone_nodes= false // [true!] very handy, ALT click to clone and drag the new node

  do_add_triggers_slots= false// [true!] will create and connect event slots when using action/events connections, !WILL CHANGE node mode when using onTrigger (enable mode colors), onExecuted does not need this

  allow_multi_output_for_events= true // [false!] being events, it is strongly reccomended to use them sequentually, one by one

  middle_click_slot_add_default_node= false //[true!] allows to create and connect a ndoe clicking with the third button (wheel)

  release_link_on_empty_shows_menu= false //[true!] dragging a link to empty space will open a menu, add from list, search or defaults

  pointerevents_method= "mouse" // "mouse"|"pointer" use mouse for retrocompatibility issues? (none found @ now)

  constructor(){}
// TODO implement pointercancel, gotpointercapture, lostpointercapture, (pointerover, pointerout if necessary)

  /**
   * Register a node class so it can be listed when the user wants to create a new one
   * 注册一个节点类，以便在用户想要创建一个新节点时列出它
   * @method registerNodeType
   * @param {String} type name of the node and path
   * @param {Class} baseClass class containing the structure of a node
   */
  
   registerNodeType   (type:string, baseClass:any){
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
          baseClass.prototype[i] = LGraphNode.prototype[i];
        }
      }
    }

    let prev = this.registered_node_types[type];
    if (prev) console.log("replacing node type: " + type);
    else {
      if (!Object.hasOwnProperty(baseClass.prototype, "shape"))
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
          get: function (v) {
            return this._shape;
          },
          enumerable: true,
          configurable: true
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

    this.registered_node_types[type] = baseClass;
    if (baseClass.constructor.name) {
      this.Nodes[classname] = baseClass;
    }
    if (LiteGraph.onNodeTypeRegistered) {
      LiteGraph.onNodeTypeRegistered(type, baseClass);
    }
    if (prev && LiteGraph.onNodeTypeReplaced) {
      LiteGraph.onNodeTypeReplaced(type, baseClass, prev);
    }

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

}
  
  /**
   * removes a node type from the system
   * @method unregisterNodeType
   * @param {String|Object} type name of the node or the node constructor itself
   */
  unregisterNodeType: function (type) {
    let base_class = type.constructor === String ? this.registered_node_types[type] : type;
    if (!base_class) throw "node type not found: " + type;
    delete this.registered_node_types[base_class.type];
    if (base_class.constructor.name) delete this.Nodes[base_class.constructor.name];
  },

  /**
   * Save a slot type and his node
   * @method registerSlotType
   * @param {String|Object} type name of the node or the node constructor itself
   * @param {String} slot_type name of the slot type (variable type), eg. string, number, array, boolean, ..
   */
//   registerNodeAndSlotType: function (type, slot_type, out) {
//     out = out || false;
//     let base_class =
//       type.constructor === String && this.registered_node_types[type] !== "anonymous"
//         ? this.registered_node_types[type]
//         : type;

//     let sCN = base_class.constructor.type;
//     let aTypes;
//     if (typeof slot_type == "string") {
//       aTypes = slot_type.split(",");
//     } else if (slot_type == this.EVENT || slot_type == this.ACTION) {
//       aTypes = ["_event_"];
//     } else {
//       aTypes = ["*"];
//     }

//     for (let i = 0; i < aTypes.length; ++i) {
//       let sT = aTypes[i]; //.toLowerCase();
//       if (sT === "") {
//         sT = "*";
//       }
//       let registerTo = out ? "registered_slot_out_types" : "registered_slot_in_types";
//       if (typeof this[registerTo][sT] == "undefined") this[registerTo][sT] = { nodes: [] };
//       this[registerTo][sT].nodes.push(sCN);

//       // check if is a new type
//       if (!out) {
//         if (!this.slot_types_in.includes(sT.toLowerCase())) {
//           this.slot_types_in.push(sT.toLowerCase());
//           this.slot_types_in.sort();
//         }
//       } else {
//         if (!this.slot_types_out.includes(sT.toLowerCase())) {
//           this.slot_types_out.push(sT.toLowerCase());
//           this.slot_types_out.sort();
//         }
//       }
//     }
//   },

//   /**
//    * Create a new nodetype by passing a function, it wraps it with a proper class and generates inputs according to the parameters of the function.
//    * Useful to wrap simple methods that do not require properties, and that only process some input to generate an output.
//    * @method wrapFunctionAsNode
//    * @param {String} name node name with namespace (p.e.: 'math/sum')
//    * @param {Function} func
//    * @param {Array} param_types [optional] an array containing the type of every parameter, otherwise parameters will accept any type
//    * @param {String} return_type [optional] string with the return type, otherwise it will be generic
//    * @param {Object} properties [optional] properties to be configurable
//    */
//   wrapFunctionAsNode: function (name, func, param_types, return_type, properties) {
//     let params = Array(func.length);
//     let code = "";
//     let names = LiteGraph.getParameterNames(func);
//     for (let i = 0; i < names.length; ++i) {
//       code +=
//         "this.addInput('" +
//         names[i] +
//         "'," +
//         (param_types && param_types[i] ? "'" + param_types[i] + "'" : "0") +
//         ");\n";
//     }
//     code += "this.addOutput('out'," + (return_type ? "'" + return_type + "'" : 0) + ");\n";
//     if (properties) {
//       code += "this.properties = " + JSON.stringify(properties) + ";\n";
//     }
//     let classobj = Function(code);
//     classobj.title = name.split("/").pop();
//     classobj.desc = "Generated from " + func.name;
//     classobj.prototype.onExecute = function onExecute() {
//       for (let i = 0; i < params.length; ++i) {
//         params[i] = this.getInputData(i);
//       }
//       let r = func.apply(this, params);
//       this.setOutputData(0, r);
//     };
//     this.registerNodeType(name, classobj);
//   },

//   /**
//    * Removes all previously registered node's types
//    */
//   clearRegisteredTypes: function () {
//     this.registered_node_types = {};
//     this.node_types_by_file_extension = {};
//     this.Nodes = {};
//     this.searchbox_extras = {};
//   },

//   /**
//    * Adds this method to all nodetypes, existing and to be created
//    * (You can add it to LGraphNode.prototype but then existing node types wont have it)
//    * @method addNodeMethod
//    * @param {Function} func
//    */
//   addNodeMethod: function (name, func) {
//     LGraphNode.prototype[name] = func;
//     for (let i in this.registered_node_types) {
//       let type = this.registered_node_types[i];
//       if (type.prototype[name]) {
//         type.prototype["_" + name] = type.prototype[name];
//       } //keep old in case of replacing
//       type.prototype[name] = func;
//     }
//   },

//   /**
//    * Create a node of a given type with a name. The node is not attached to any graph yet.
//    * @method createNode
//    * @param {String} type full name of the node class. p.e. "math/sin"
//    * @param {String} name a name to distinguish from other nodes
//    * @param {Object} options to set options
//    */

//   createNode: function (type, title, options) {
//     let base_class = this.registered_node_types[type];
//     if (!base_class) {
//       if (LiteGraph.debug) {
//         console.log('GraphNode type "' + type + '" not registered.');
//       }
//       return null;
//     }

//     let prototype = base_class.prototype || base_class;

//     title = title || base_class.title || type;

//     let node = null;

//     if (LiteGraph.catch_exceptions) {
//       try {
//         node = new base_class(title);
//       } catch (err) {
//         console.error(err);
//         return null;
//       }
//     } else {
//       node = new base_class(title);
//     }

//     node.type = type;

//     if (!node.title && title) {
//       node.title = title;
//     }
//     if (!node.properties) {
//       node.properties = {};
//     }
//     if (!node.properties_info) {
//       node.properties_info = [];
//     }
//     if (!node.flags) {
//       node.flags = {};
//     }
//     if (!node.size) {
//       node.size = node.computeSize();
//       //call onresize?
//     }
//     if (!node.pos) {
//       node.pos = LiteGraph.DEFAULT_POSITION.concat();
//     }
//     if (!node.mode) {
//       node.mode = LiteGraph.ALWAYS;
//     }

//     //extra options
//     if (options) {
//       for (let i in options) {
//         node[i] = options[i];
//       }
//     }

//     // callback
//     if (node.onNodeCreated) {
//       node.onNodeCreated();
//     }

//     return node;
//   },

//   /**
//    * Returns a registered node type with a given name
//    * @method getNodeType
//    * @param {String} type full name of the node class. p.e. "math/sin"
//    * @return {Class} the node class
//    */
//   getNodeType: function (type) {
//     return this.registered_node_types[type];
//   },

//   /**
//    * Returns a list of node types matching one category
//    * @method getNodeType
//    * @param {String} category category name
//    * @return {Array} array with all the node classes
//    */

//   getNodeTypesInCategory: function (category, filter) {
//     let r = [];
//     for (let i in this.registered_node_types) {
//       let type = this.registered_node_types[i];
//       if (type.filter != filter) {
//         continue;
//       }

//       if (category == "") {
//         if (type.category == null) {
//           r.push(type);
//         }
//       } else if (type.category == category) {
//         r.push(type);
//       }
//     }

//     if (this.auto_sort_node_types) {
//       r.sort(function (a, b) {
//         return a.title.localeCompare(b.title);
//       });
//     }

//     return r;
//   },

//   /**
//    * Returns a list with all the node type categories
//    * @method getNodeTypesCategories
//    * @param {String} filter only nodes with ctor.filter equal can be shown
//    * @return {Array} array with all the names of the categories
//    */
//  getNodeTypesCategories  (filter:string) {
//     let categories = { "": 1 };
//     for (let i in this.registered_node_types) {
//       let type = this.registered_node_types[i];
//       if (type.category && !type.skip_list) {
//         if (type.filter != filter) continue;
//         categories[type.category] = 1;
//       }
//     }
//     let result = [];
//     for (let i in categories) {
//       result.push(i);
//     }
//     return this.auto_sort_node_types ? result.sort() : result;
//   },

//   //debug purposes: reloads all the js scripts that matches a wildcard
//   reloadNodes: function (folder_wildcard) {
//     let tmp = document.getElementsByTagName("script");
//     //weird, this array changes by its own, so we use a copy
//     let script_files = [];
//     for (let i = 0; i < tmp.length; i++) {
//       script_files.push(tmp[i]);
//     }

//     let docHeadObj = document.getElementsByTagName("head")[0];
//     folder_wildcard = document.location.href + folder_wildcard;

//     for (let i = 0; i < script_files.length; i++) {
//       let src = script_files[i].src;
//       if (!src || src.substr(0, folder_wildcard.length) != folder_wildcard) {
//         continue;
//       }

//       try {
//         if (LiteGraph.debug) {
//           console.log("Reloading: " + src);
//         }
//         let dynamicScript = document.createElement("script");
//         dynamicScript.type = "text/javascript";
//         dynamicScript.src = src;
//         docHeadObj.appendChild(dynamicScript);
//         docHeadObj.removeChild(script_files[i]);
//       } catch (err) {
//         if (LiteGraph.throw_errors) {
//           throw err;
//         }
//         if (LiteGraph.debug) {
//           console.log("Error while reloading " + src);
//         }
//       }
//     }

//     if (LiteGraph.debug) {
//       console.log("Nodes reloaded");
//     }
//   },

//   //separated just to improve if it doesn't work
//   cloneObject: function (obj, target) {
//     if (obj == null) {
//       return null;
//     }
//     let r = JSON.parse(JSON.stringify(obj));
//     if (!target) {
//       return r;
//     }

//     for (let i in r) {
//       target[i] = r[i];
//     }
//     return target;
//   },

//   /**
//    * Returns if the types of two slots are compatible (taking into account wildcards, etc)
//    * @method isValidConnection
//    * @param {String} type_a
//    * @param {String} type_b
//    * @return {Boolean} true if they can be connected
//    */
//   isValidConnection: function (type_a, type_b) {
//     if (type_a == "" || type_a === "*") type_a = 0;
//     if (type_b == "" || type_b === "*") type_b = 0;
//     if (
//       !type_a || //generic output
//       !type_b || // generic input
//       type_a == type_b || //same type (is valid for triggers)
//       (type_a == LiteGraph.EVENT && type_b == LiteGraph.ACTION)
//     ) {
//       return true;
//     }

//     // Enforce string type to handle toLowerCase call (-1 number not ok)
//     type_a = String(type_a);
//     type_b = String(type_b);
//     type_a = type_a.toLowerCase();
//     type_b = type_b.toLowerCase();

//     // For nodes supporting multiple connection types
//     if (type_a.indexOf(",") == -1 && type_b.indexOf(",") == -1) {
//       return type_a == type_b;
//     }

//     // Check all permutations to see if one is valid
//     let supported_types_a = type_a.split(",");
//     let supported_types_b = type_b.split(",");
//     for (let i = 0; i < supported_types_a.length; ++i) {
//       for (let j = 0; j < supported_types_b.length; ++j) {
//         if (this.isValidConnection(supported_types_a[i], supported_types_b[j])) {
//           //if (supported_types_a[i] == supported_types_b[j]) {
//           return true;
//         }
//       }
//     }

//     return false;
//   },

//   /**
//    * Register a string in the search box so when the user types it it will recommend this node
//    * @method registerSearchboxExtra
//    * @param {String} node_type the node recommended
//    * @param {String} description text to show next to it
//    * @param {Object} data it could contain info of how the node should be configured
//    * @return {Boolean} true if they can be connected
//    */
//   registerSearchboxExtra: function (node_type, description, data) {
//     this.searchbox_extras[description.toLowerCase()] = {
//       type: node_type,
//       desc: description,
//       data: data
//     };
//   },

//   /**
//    * Wrapper to load files (from url using fetch or from file using FileReader)
//    * @method fetchFile
//    * @param {String|File|Blob} url the url of the file (or the file itself)
//    * @param {String} type an string to know how to fetch it: "text","arraybuffer","json","blob"
//    * @param {Function} on_complete callback(data)
//    * @param {Function} on_error in case of an error
//    * @return {FileReader|Promise} returns the object used to
//    */
//   fetchFile: function (url, type, on_complete, on_error) {
//     let that = this;
//     if (!url) return null;

//     type = type || "text";
//     if (url.constructor === String) {
//       if (url.substr(0, 4) == "http" && LiteGraph.proxy) {
//         url = LiteGraph.proxy + url.substr(url.indexOf(":") + 3);
//       }
//       return fetch(url)
//         .then(function (response) {
//           if (!response.ok) throw new Error("File not found"); //it will be catch below
//           if (type == "arraybuffer") return response.arrayBuffer();
//           else if (type == "text" || type == "string") return response.text();
//           else if (type == "json") return response.json();
//           else if (type == "blob") return response.blob();
//         })
//         .then(function (data) {
//           if (on_complete) on_complete(data);
//         })
//         .catch(function (error) {
//           console.error("error fetching file:", url);
//           if (on_error) on_error(error);
//         });
//     } else if (url.constructor === File || url.constructor === Blob) {
//       let reader = new FileReader();
//       reader.onload = function (e) {
//         let v = e.target.result;
//         if (type == "json") v = JSON.parse(v);
//         if (on_complete) on_complete(v);
//       };
//       if (type == "arraybuffer") return reader.readAsArrayBuffer(url);
//       else if (type == "text" || type == "json") return reader.readAsText(url);
//       else if (type == "blob") return reader.readAsBinaryString(url);
//     }
//     return null;
//   }
};



// /* LiteGraph GUI elements used for canvas editing *************************************/

// LiteGraph.closeAllContextMenus = function (ref_window) {
//   ref_window = ref_window || window;

//   let elements = ref_window.document.querySelectorAll(".litecontextmenu");
//   if (!elements.length) {
//     return;
//   }

//   let result = [];
//   for (let i = 0; i < elements.length; i++) {
//     result.push(elements[i]);
//   }

//   for (let i = 0; i < result.length; i++) {
//     if (result[i].close) {
//       result[i].close();
//     } else if (result[i].parentNode) {
//       result[i].parentNode.removeChild(result[i]);
//     }
//   }
// };

// LiteGraph.extendClass = function (target, origin) {
//   for (let i in origin) {
//     //copy class properties
//     if (target.hasOwnProperty(i)) {
//       continue;
//     }
//     target[i] = origin[i];
//   }

//   if (origin.prototype) {
//     //copy prototype properties
//     for (let i in origin.prototype) {
//       //only enumerable
//       if (!origin.prototype.hasOwnProperty(i)) {
//         continue;
//       }

//       if (target.prototype.hasOwnProperty(i)) {
//         //avoid overwriting existing ones
//         continue;
//       }

//       //copy getters
//       if (origin.prototype.__lookupGetter__(i)) {
//         target.prototype.__defineGetter__(i, origin.prototype.__lookupGetter__(i));
//       } else {
//         target.prototype[i] = origin.prototype[i];
//       }

//       //and setters
//       if (origin.prototype.__lookupSetter__(i)) {
//         target.prototype.__defineSetter__(i, origin.prototype.__lookupSetter__(i));
//       }
//     }
//   }
// };

// //used to create nodes from wrapping functions
// LiteGraph.getParameterNames = function (func) {
//   return (func + "")
//     .replace(/[/][/].*$/gm, "") // strip single-line comments
//     .replace(/\s+/g, "") // strip white space
//     .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments  /**/
//     .split("){", 1)[0]
//     .replace(/^[^(]*[(]/, "") // extract the parameters
//     .replace(/=[^,]+/g, "") // strip any ES6 defaults
//     .split(",")
//     .filter(Boolean); // split & filter [""]
// };

// /* helper for interaction: pointer, touch, mouse Listeners
// used by LGraphCanvas DragAndScale ContextMenu*/
// LiteGraph.pointerListenerAdd = function (oDOM, sEvIn, fCall, capture = false) {
//   if (!oDOM || !oDOM.addEventListener || !sEvIn || typeof fCall !== "function") {
//     //console.log("cant pointerListenerAdd "+oDOM+", "+sEvent+", "+fCall);
//     return; // -- break --
//   }

//   let sMethod = LiteGraph.pointerevents_method;
//   let sEvent = sEvIn;

//   // UNDER CONSTRUCTION
//   // convert pointerevents to touch event when not available
//   if (sMethod == "pointer" && !window.PointerEvent) {
//     console.warn("sMethod=='pointer' && !window.PointerEvent");
//     console.log(
//       "Converting pointer[" + sEvent + "] : down move up cancel enter TO touchstart touchmove touchend, etc .."
//     );
//     switch (sEvent) {
//       case "down": {
//         sMethod = "touch";
//         sEvent = "start";
//         break;
//       }
//       case "move": {
//         sMethod = "touch";
//         //sEvent = "move";
//         break;
//       }
//       case "up": {
//         sMethod = "touch";
//         sEvent = "end";
//         break;
//       }
//       case "cancel": {
//         sMethod = "touch";
//         //sEvent = "cancel";
//         break;
//       }
//       case "enter": {
//         console.log("debug: Should I send a move event?"); // ???
//         break;
//       }
//       // case "over": case "out": not used at now
//       default: {
//         console.warn("PointerEvent not available in this browser ? The event " + sEvent + " would not be called");
//       }
//     }
//   }

//   switch (sEvent) {
//     //both pointer and move events
//     case "down":
//     case "up":
//     case "move":
//     case "over":
//     case "out":
//     case "enter": {
//       oDOM.addEventListener(sMethod + sEvent, fCall, capture);
//     }
//     // only pointerevents
//     case "leave":
//     case "cancel":
//     case "gotpointercapture":
//     case "lostpointercapture": {
//       if (sMethod != "mouse") {
//         return oDOM.addEventListener(sMethod + sEvent, fCall, capture);
//       }
//     }
//     // not "pointer" || "mouse"
//     default:
//       return oDOM.addEventListener(sEvent, fCall, capture);
//   }
// };

// LiteGraph.pointerListenerRemove = function (oDOM, sEvent, fCall, capture = false) {
//   if (!oDOM || !oDOM.removeEventListener || !sEvent || typeof fCall !== "function") {
//     //console.log("cant pointerListenerRemove "+oDOM+", "+sEvent+", "+fCall);
//     return; // -- break --
//   }
//   switch (sEvent) {
//     //both pointer and move events
//     case "down":
//     case "up":
//     case "move":
//     case "over":
//     case "out":
//     case "enter": {
//       if (LiteGraph.pointerevents_method == "pointer" || LiteGraph.pointerevents_method == "mouse") {
//         oDOM.removeEventListener(LiteGraph.pointerevents_method + sEvent, fCall, capture);
//       }
//     }
//     // only pointerevents
//     case "leave":
//     case "cancel":
//     case "gotpointercapture":
//     case "lostpointercapture": {
//       if (LiteGraph.pointerevents_method == "pointer") {
//         return oDOM.removeEventListener(LiteGraph.pointerevents_method + sEvent, fCall, capture);
//       }
//     }
//     // not "pointer" || "mouse"
//     default:
//       return oDOM.removeEventListener(sEvent, fCall, capture);
//   }
// };

// LiteGraph.use = function (plugin) {
//   // 获取已经安装的插件
//   const installedPlugins = this._installedPlugins || (this._installedPlugins = []);
//   // 看看插件是否已经安装，如果安装了直接返回
//   if (installedPlugins.indexOf(plugin) > -1) {
//     return this;
//   }

//   const args = toArray(arguments, 1);
//   args.unshift(this);
//   if (typeof plugin.install === "function") {
//     plugin.install.apply(plugin, args);
//   } else if (typeof plugin === "function") {
//     plugin.apply(null, args);
//   }
//   installedPlugins.push(plugin);
//   return this;
// };



export default LiteGraph;
