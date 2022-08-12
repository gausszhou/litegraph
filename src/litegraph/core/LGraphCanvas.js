import {
  distance,
  colorToString,
  hex2num,
  num2hex,
  compareObjects,
  growBounding,
  isInsideBounding,
  overlapBounding,
  isInsideRectangle
} from "./utils";

import LGraphNode from "./LGraphNode";
import LiteGraph from "./index";
import DragAndScale from "./DragAndScale";
//*********************************************************************************
// LGraphCanvas: LGraph renderer CLASS
//*********************************************************************************

/**
 * This class is in charge of rendering one graph inside a canvas. And provides all the interaction required.
 * Valid callbacks are: onNodeSelected, onNodeDeselected, onShowNodePanel, onNodeDblClicked
 *
 * @class LGraphCanvas
 * @constructor
 * @param {HTMLCanvas} canvas the canvas where you want to render (it accepts a selector in string format or the canvas element itself)
 * @param {LGraph} graph [optional]
 * @param {Object} options [optional] { skip_rendering, autoresize, viewport }
 */

/* Interaction */

let canvas_bounding_vec4 = new Float32Array(4); // store coordinate
let link_bounding_vec4 = new Float32Array(4); // store canvas bounding
let temp_area_vec4 = new Float32Array(4); // store coordinate
let temp_margin_vec4 = new Float32Array(4); // store canvas margin area
let temp_size_vec2 = new Float32Array(2); // strore size
let temp_slot_a_vec2 = new Float32Array(2);
let temp_slot_b_vec2 = new Float32Array(2);

/* LGraphCanvas render */

export function LGraphCanvas(canvas, graph, options) {
  this.options = options = options || {};

  //if(graph === undefined)
  //	throw ("No graph assigned");
  this.background_image = LGraphCanvas.DEFAULT_BACKGROUND_IMAGE;

  if (canvas && canvas.constructor === String) {
    canvas = document.querySelector(canvas);
  }

  this.ds = new DragAndScale();
  this.zoom_modify_alpha = true; //otherwise it generates ugly patterns when scaling down too much

  this.title_text_font = "" + LiteGraph.NODE_TEXT_SIZE + "px Arial";
  this.inner_text_font = "normal " + LiteGraph.NODE_SUBTEXT_SIZE + "px Arial";
  this.node_title_color = LiteGraph.NODE_TITLE_COLOR;
  this.default_link_color = LiteGraph.LINK_COLOR;
  this.default_connection_color = {
    input_off: "#778",
    input_on: "#7F7", //"#BBD"
    output_off: "#778",
    output_on: "#7F7" //"#BBD"
  };
  this.default_connection_color_byType = {
    /*number: "#7F7",
        string: "#77F",
        boolean: "#F77",*/
  };
  this.default_connection_color_byTypeOff = {
    /*number: "#474",
        string: "#447",
        boolean: "#744",*/
  };

  this.highquality_render = true;
  this.use_gradients = false; //set to true to render titlebar with gradients
  this.editor_alpha = 1; //used for transition
  this.pause_rendering = false;
  this.clear_background = true;

  this.read_only = false; //if set to true users cannot modify the graph
  this.render_only_selected = true;
  this.live_mode = false;
  this.show_info = true;
  this.allow_dragcanvas = true;
  this.allow_dragnodes = true;
  this.allow_interaction = true; //allow to control widgets, buttons, collapse, etc
  this.allow_searchbox = true;
  this.allow_reconnect_links = true; //allows to change a connection with having to redo it again
  this.align_to_grid = false; //snap to grid

  this.drag_mode = false;
  this.dragging_rectangle = null;

  this.filter = null; //allows to filter to only accept some type of nodes in a graph

  this.set_canvas_dirty_on_mouse_event = true; //forces to redraw the canvas if the mouse does anything
  this.always_render_background = false;
  this.render_shadows = true;
  this.render_canvas_border = true;
  this.render_connections_shadows = false; //too much cpu
  this.render_connections_border = true;
  this.render_curved_connections = false;
  this.render_connection_arrows = false;
  this.render_collapsed_slots = true;
  this.render_execution_order = false;
  this.render_title_colored = true;
  this.render_link_tooltip = true;

  this.links_render_mode = LiteGraph.SPLINE_LINK;

  this.mouse = [0, 0]; //mouse in canvas coordinates, where 0,0 is the top-left corner of the blue rectangle
  this.graph_mouse = [0, 0]; //mouse in graph coordinates, where 0,0 is the top-left corner of the blue rectangle
  this.canvas_mouse = this.graph_mouse; //LEGACY: REMOVE THIS, USE GRAPH_MOUSE INSTEAD

  //to personalize the search box
  this.onSearchBox = null;
  this.onSearchBoxSelection = null;

  //callbacks
  this.onMouse = null;
  this.onDrawBackground = null; //to render background objects (behind nodes and connections) in the canvas affected by transform
  this.onDrawForeground = null; //to render foreground objects (above nodes and connections) in the canvas affected by transform
  this.onDrawOverlay = null; //to render foreground objects not affected by transform (for GUIs)
  this.onDrawLinkTooltip = null; //called when rendering a tooltip
  this.onNodeMoved = null; //called after moving a node
  this.onSelectionChange = null; //called if the selection changes
  this.onConnectingChange = null; //called before any link changes
  this.onBeforeChange = null; //called before modifying the graph
  this.onAfterChange = null; //called after modifying the graph

  this.connections_width = 3;
  this.round_radius = 8;

  this.current_node = null;
  this.node_widget = null; //used for widgets
  this.over_link_center = null;
  this.last_mouse_position = [0, 0];
  this.visible_area = this.ds.visible_area;
  this.visible_links = [];

  this.viewport = options.viewport || null; //to constraint render area to a portion of the canvas

  //link canvas and graph
  if (graph) {
    graph.attachCanvas(this);
  }

  this.setCanvas(canvas, options.skip_events);
  this.clear();

  if (!options.skip_render) {
    this.startRendering();
  }

  this.autoresize = options.autoresize;
}

LGraphCanvas.DEFAULT_BACKGROUND_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQBJREFUeNrs1rEKwjAUhlETUkj3vP9rdmr1Ysammk2w5wdxuLgcMHyptfawuZX4pJSWZTnfnu/lnIe/jNNxHHGNn//HNbbv+4dr6V+11uF527arU7+u63qfa/bnmh8sWLBgwYJlqRf8MEptXPBXJXa37BSl3ixYsGDBMliwFLyCV/DeLIMFCxYsWLBMwSt4Be/NggXLYMGCBUvBK3iNruC9WbBgwYJlsGApeAWv4L1ZBgsWLFiwYJmCV/AK3psFC5bBggULloJX8BpdwXuzYMGCBctgwVLwCl7Be7MMFixYsGDBsu8FH1FaSmExVfAxBa/gvVmwYMGCZbBg/W4vAQYA5tRF9QYlv/QAAAAASUVORK5CYII=";

LGraphCanvas.link_type_colors = {
  // "-1": LiteGraph.EVENT_LINK_COLOR,
  number: "#AAA",
  node: "#DCA"
};

LGraphCanvas.gradients = {}; //cache of gradients

/**
 * clears all the data inside
 *
 * @method clear
 */
LGraphCanvas.prototype.clear = function () {
  this.frame = 0;
  this.last_draw_time = 0;
  this.render_time = 0;
  this.fps = 0;

  //this.scale = 1;
  //this.offset = [0,0];

  this.dragging_rectangle = null;

  this.selected_nodes = {};
  this.selected_group = null;

  this.visible_nodes = [];
  this.node_dragged = null;
  this.node_over = null;
  this.node_capturing_input = null;
  this.connecting_node = null;
  this.highlighted_links = {};

  this.dragging_canvas = false;

  this.dirty_canvas = true;
  this.dirty_bgcanvas = true;
  this.dirty_area = null;

  this.node_in_panel = null;
  this.node_widget = null;

  this.last_mouse = [0, 0];
  this.last_mouseclick = 0;
  this.pointer_is_down = false;
  this.pointer_is_double = false;
  this.visible_area.set([0, 0, 0, 0]);

  if (this.onClear) {
    this.onClear();
  }
};

/**
 * assigns a graph, you can reassign graphs to the same canvas
 *
 * @method setGraph
 * @param {LGraph} graph
 */
LGraphCanvas.prototype.setGraph = function (graph, skip_clear) {
  if (this.graph == graph) {
    return;
  }

  if (!skip_clear) {
    this.clear();
  }

  if (!graph && this.graph) {
    this.graph.detachCanvas(this);
    return;
  }

  graph.attachCanvas(this);

  //remove the graph stack in case a subgraph was open
  if (this._graph_stack) this._graph_stack = null;

  this.setDirty(true, true);
};

/**
 * returns the top level graph (in case there are subgraphs open on the canvas)
 *
 * @method getTopGraph
 * @return {LGraph} graph
 */
LGraphCanvas.prototype.getTopGraph = function () {
  if (this._graph_stack.length) return this._graph_stack[0];
  return this.graph;
};

/**
 * opens a graph contained inside a node in the current graph
 *
 * @method openSubgraph
 * @param {LGraph} graph
 */
LGraphCanvas.prototype.openSubgraph = function (graph) {
  if (!graph) {
    throw "graph cannot be null";
  }

  if (this.graph == graph) {
    throw "graph cannot be the same";
  }

  this.clear();

  if (this.graph) {
    if (!this._graph_stack) {
      this._graph_stack = [];
    }
    this._graph_stack.push(this.graph);
  }

  graph.attachCanvas(this);
  this.checkPanels();
  this.setDirty(true, true);
};

/**
 * closes a subgraph contained inside a node
 *
 * @method closeSubgraph
 * @param {LGraph} assigns a graph
 */
LGraphCanvas.prototype.closeSubgraph = function () {
  if (!this._graph_stack || this._graph_stack.length == 0) {
    return;
  }
  let subgraph_node = this.graph._subgraph_node;
  let graph = this._graph_stack.pop();
  this.selected_nodes = {};
  this.highlighted_links = {};
  graph.attachCanvas(this);
  this.setDirty(true, true);
  if (subgraph_node) {
    this.centerOnNode(subgraph_node);
    this.selectNodes([subgraph_node]);
  }
  // when close sub graph back to offset [0, 0] scale 1
  this.ds.offset = [0, 0];
  this.ds.scale = 1;
};

/**
 * returns the visualy active graph (in case there are more in the stack)
 * @method getCurrentGraph
 * @return {LGraph} the active graph
 */
LGraphCanvas.prototype.getCurrentGraph = function () {
  return this.graph;
};

/**
 * assigns a canvas
 *
 * @method setCanvas
 * @param {Canvas} assigns a canvas (also accepts the ID of the element (not a selector)
 */
LGraphCanvas.prototype.setCanvas = function (canvas, skip_events) {
  let that = this;

  if (canvas) {
    if (canvas.constructor === String) {
      canvas = document.getElementById(canvas);
      if (!canvas) {
        throw "Error creating LiteGraph canvas: Canvas not found";
      }
    }
  }

  if (canvas === this.canvas) {
    return;
  }

  if (!canvas && this.canvas) {
    //maybe detach events from old_canvas
    if (!skip_events) {
      this.unbindEvents();
    }
  }

  this.canvas = canvas;
  this.ds.element = canvas;

  if (!canvas) {
    return;
  }

  //this.canvas.tabindex = "1000";
  canvas.className += " lgraphcanvas";
  canvas.data = this;
  canvas.tabindex = "1"; //to allow key events

  //bg canvas: used for non changing stuff
  this.bgcanvas = null;
  if (!this.bgcanvas) {
    this.bgcanvas = document.createElement("canvas");
    this.bgcanvas.width = this.canvas.width;
    this.bgcanvas.height = this.canvas.height;
  }

  if (canvas.getContext == null) {
    if (canvas.localName != "canvas") {
      throw "Element supplied for LGraphCanvas must be a <canvas> element, you passed a " + canvas.localName;
    }
    throw "This browser doesn't support Canvas";
  }

  let ctx = (this.ctx = canvas.getContext("2d"));
  if (ctx == null) {
    if (!canvas.webgl_enabled) {
      console.warn("This canvas seems to be WebGL, enabling WebGL renderer");
    }
    this.enableWebGL();
  }

  //input:  (move and up could be unbinded)
  // why here? this._mousemove_callback = this.processMouseMove.bind(this);
  // why here? this._mouseup_callback = this.processMouseUp.bind(this);

  if (!skip_events) {
    this.bindEvents();
  }
};

//used in some events to capture them
LGraphCanvas.prototype._doNothing = function doNothing(e) {
  //console.log("pointerevents: _doNothing "+e.type);
  e.preventDefault();
  return false;
};
LGraphCanvas.prototype._doReturnTrue = function doNothing(e) {
  e.preventDefault();
  return true;
};

/**
 * binds mouse, keyboard, touch and drag events to the canvas
 * @method bindEvents
 **/
LGraphCanvas.prototype.bindEvents = function () {
  if (this._events_binded) {
    console.warn("LGraphCanvas: events already binded");
    return;
  }

  //console.log("pointerevents: bindEvents");

  let canvas = this.canvas;

  let ref_window = this.getCanvasWindow();
  let document = ref_window.document; //hack used when moving canvas between windows

  this._mousedown_callback = this.processMouseDown.bind(this);
  this._mousewheel_callback = this.processMouseWheel.bind(this);
  // why mousemove and mouseup were not binded here?
  this._mousemove_callback = this.processMouseMove.bind(this);
  this._mouseup_callback = this.processMouseUp.bind(this);

  //touch events -- TODO IMPLEMENT
  //this._touch_callback = this.touchHandler.bind(this);

  LiteGraph.pointerListenerAdd(canvas, "down", this._mousedown_callback, true); //down do not need to store the binded
  canvas.addEventListener("mousewheel", this._mousewheel_callback, false);

  LiteGraph.pointerListenerAdd(canvas, "up", this._mouseup_callback, true); // CHECK: ??? binded or not
  LiteGraph.pointerListenerAdd(canvas, "move", this._mousemove_callback);

  canvas.addEventListener("contextmenu", this._doNothing);
  canvas.addEventListener("DOMMouseScroll", this._mousewheel_callback, false);

  //touch events -- THIS WAY DOES NOT WORK, finish implementing pointerevents, than clean the touchevents
  /*if( 'touchstart' in document.documentElement )
    {
        canvas.addEventListener("touchstart", this._touch_callback, true);
        canvas.addEventListener("touchmove", this._touch_callback, true);
        canvas.addEventListener("touchend", this._touch_callback, true);
        canvas.addEventListener("touchcancel", this._touch_callback, true);
    }*/

  //Keyboard ******************
  this._key_callback = this.processKey.bind(this);

  canvas.addEventListener("keydown", this._key_callback, true);
  document.addEventListener("keyup", this._key_callback, true); //in document, otherwise it doesn't fire keyup

  //Dropping Stuff over nodes ************************************
  this._ondrop_callback = this.processDrop.bind(this);

  canvas.addEventListener("dragover", this._doNothing, false);
  canvas.addEventListener("dragend", this._doNothing, false);
  canvas.addEventListener("drop", this._ondrop_callback, false);
  canvas.addEventListener("dragenter", this._doReturnTrue, false);

  this._events_binded = true;
};

/**
 * unbinds mouse events from the canvas
 * @method unbindEvents
 **/
LGraphCanvas.prototype.unbindEvents = function () {
  if (!this._events_binded) {
    console.warn("LGraphCanvas: no events binded");
    return;
  }

  //console.log("pointerevents: unbindEvents");

  let ref_window = this.getCanvasWindow();
  let document = ref_window.document;

  LiteGraph.pointerListenerRemove(this.canvas, "move", this._mousedown_callback);
  LiteGraph.pointerListenerRemove(this.canvas, "up", this._mousedown_callback);
  LiteGraph.pointerListenerRemove(this.canvas, "down", this._mousedown_callback);
  this.canvas.removeEventListener("mousewheel", this._mousewheel_callback);
  this.canvas.removeEventListener("DOMMouseScroll", this._mousewheel_callback);
  this.canvas.removeEventListener("keydown", this._key_callback);
  document.removeEventListener("keyup", this._key_callback);
  this.canvas.removeEventListener("contextmenu", this._doNothing);
  this.canvas.removeEventListener("drop", this._ondrop_callback);
  this.canvas.removeEventListener("dragenter", this._doReturnTrue);

  //touch events -- THIS WAY DOES NOT WORK, finish implementing pointerevents, than clean the touchevents
  /*this.canvas.removeEventListener("touchstart", this._touch_callback );
    this.canvas.removeEventListener("touchmove", this._touch_callback );
    this.canvas.removeEventListener("touchend", this._touch_callback );
    this.canvas.removeEventListener("touchcancel", this._touch_callback );*/

  this._mousedown_callback = null;
  this._mousewheel_callback = null;
  this._key_callback = null;
  this._ondrop_callback = null;

  this._events_binded = false;
};

LGraphCanvas.getFileExtension = function (url) {
  let question = url.indexOf("?");
  if (question != -1) {
    url = url.substr(0, question);
  }
  let point = url.lastIndexOf(".");
  if (point == -1) {
    return "";
  }
  return url.substr(point + 1).toLowerCase();
};

/**
 * this function allows to render the canvas using WebGL instead of Canvas2D
 * this is useful if you plant to render 3D objects inside your nodes, it uses litegl.js for webgl and canvas2DtoWebGL to emulate the Canvas2D calls in webGL
 * @method enableWebGL
 **/
LGraphCanvas.prototype.enableWebGL = function () {
  if (typeof GL === undefined) {
    throw "litegl.js must be included to use a WebGL canvas";
  }
  if (typeof enableWebGLCanvas === undefined) {
    throw "webglCanvas.js must be included to use this feature";
  }

  this.gl = this.ctx = enableWebGLCanvas(this.canvas);
  this.ctx.webgl = true;
  this.bgcanvas = this.canvas;
  this.bgctx = this.gl;
  this.canvas.webgl_enabled = true;

  /*
GL.create({ canvas: this.bgcanvas });
this.bgctx = enableWebGLCanvas( this.bgcanvas );
window.gl = this.gl;
*/
};

/**
 * marks as dirty the canvas, this way it will be rendered again
 *
 * @class LGraphCanvas
 * @method setDirty
 * @param {bool} fgcanvas if the foreground canvas is dirty (the one containing the nodes)
 * @param {bool} bgcanvas if the background canvas is dirty (the one containing the wires)
 */
LGraphCanvas.prototype.setDirty = function (fgcanvas, bgcanvas) {
  if (fgcanvas) {
    this.dirty_canvas = true;
  }
  if (bgcanvas) {
    this.dirty_bgcanvas = true;
  }
};

/**
 * Used to attach the canvas in a popup
 *
 * @method getCanvasWindow
 * @return {window} returns the window where the canvas is attached (the DOM root node)
 */
LGraphCanvas.prototype.getCanvasWindow = function () {
  if (!this.canvas) {
    return window;
  }
  let doc = this.canvas.ownerDocument;
  return doc.defaultView || doc.parentWindow;
};

/**
 * starts rendering the content of the canvas when needed
 *
 * @method startRendering
 */
LGraphCanvas.prototype.startRendering = function () {
  if (this.is_rendering) {
    return;
  } //already rendering

  this.is_rendering = true;
  renderFrame.call(this);

  function renderFrame() {
    if (!this.pause_rendering) {
      this.draw();
    }

    let window = this.getCanvasWindow();
    if (this.is_rendering) {
      window.requestAnimationFrame(renderFrame.bind(this));
    }
  }
};

/**
 * stops rendering the content of the canvas (to save resources)
 *
 * @method stopRendering
 */
LGraphCanvas.prototype.stopRendering = function () {
  this.is_rendering = false;
  /*
if(this.rendering_timer_id)
{
    clearInterval(this.rendering_timer_id);
    this.rendering_timer_id = null;
}
*/
};

/* LiteGraphCanvas input */

//used to block future mouse events (because of im gui)
LGraphCanvas.prototype.blockClick = function () {
  this.block_click = true;
  this.last_mouseclick = 0;
};

LGraphCanvas.prototype.processMouseDown = function (e) {
  if (this.set_canvas_dirty_on_mouse_event) this.dirty_canvas = true;

  if (!this.graph) {
    return;
  }

  this.adjustMouseEvent(e);

  let ref_window = this.getCanvasWindow();
  let document = ref_window.document;
  LGraphCanvas.active_canvas = this;
  let that = this;

  let x = e.clientX;
  let y = e.clientY;
  //console.log(y,this.viewport);
  //console.log("pointerevents: processMouseDown pointerId:"+e.pointerId+" which:"+e.which+" isPrimary:"+e.isPrimary+" :: x y "+x+" "+y);

  this.ds.viewport = this.viewport;
  let is_inside =
    !this.viewport ||
    (this.viewport &&
      x >= this.viewport[0] &&
      x < this.viewport[0] + this.viewport[2] &&
      y >= this.viewport[1] &&
      y < this.viewport[1] + this.viewport[3]);

  //move mouse move event to the window in case it drags outside of the canvas
  if (!this.options.skip_events) {
    LiteGraph.pointerListenerRemove(this.canvas, "move", this._mousemove_callback);
    LiteGraph.pointerListenerAdd(ref_window.document, "move", this._mousemove_callback, true); //catch for the entire window
    LiteGraph.pointerListenerAdd(ref_window.document, "up", this._mouseup_callback, true);
  }

  if (!is_inside) {
    return;
  }

  let node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes, 5);
  let skip_dragging = false;
  let skip_action = false;
  let now = LiteGraph.getTime();
  let is_primary = e.isPrimary === undefined || !e.isPrimary;
  let is_double_click = now - this.last_mouseclick < 300 && is_primary;
  this.mouse[0] = e.clientX;
  this.mouse[1] = e.clientY;
  this.graph_mouse[0] = e.canvasX;
  this.graph_mouse[1] = e.canvasY;
  this.last_click_position = [this.mouse[0], this.mouse[1]];

  if (this.pointer_is_down && is_primary) {
    this.pointer_is_double = true;
    //console.log("pointerevents: pointer_is_double start");
  } else {
    this.pointer_is_double = false;
  }
  this.pointer_is_down = true;

  this.canvas.focus();

  LiteGraph.closeAllContextMenus(ref_window);

  if (this.onMouse) {
    if (this.onMouse(e) == true) return;
  }

  //left button mouse / single finger
  if (e.which == 1 && !this.pointer_is_double) {
    if (e.ctrlKey) {
      this.dragging_rectangle = new Float32Array(4);
      this.dragging_rectangle[0] = e.canvasX;
      this.dragging_rectangle[1] = e.canvasY;
      this.dragging_rectangle[2] = 1;
      this.dragging_rectangle[3] = 1;
      skip_action = true;
    }

    // clone node ALT dragging
    if (
      LiteGraph.alt_drag_do_clone_nodes &&
      e.altKey &&
      node &&
      this.allow_interaction &&
      !skip_action &&
      !this.read_only
    ) {
      if ((cloned = node.clone())) {
        cloned.pos[0] += 5;
        cloned.pos[1] += 5;
        this.graph.add(cloned, false, { doCalcSize: false });
        node = cloned;
        skip_action = true;
        if (!block_drag_node) {
          if (this.allow_dragnodes) {
            this.graph.beforeChange();
            this.node_dragged = node;
          }
          if (!this.selected_nodes[node.id]) {
            this.processNodeSelected(node, e);
          }
        }
      }
    }

    let clicking_canvas_bg = false;

    //when clicked on top of a node
    //and it is not interactive
    if (node && this.allow_interaction && !skip_action && !this.read_only) {
      if (!this.live_mode && !node.flags.pinned) {
        this.bringToFront(node);
      } //if it wasn't selected?

      //not dragging mouse to connect two slots
      if (!this.connecting_node && !node.flags.collapsed && !this.live_mode) {
        //Search for corner for resize
        if (
          !skip_action &&
          node.resizable !== false &&
          isInsideRectangle(
            e.canvasX,
            e.canvasY,
            node.pos[0] + node.size[0] - 5,
            node.pos[1] + node.size[1] - 5,
            10,
            10
          )
        ) {
          this.graph.beforeChange();
          this.resizing_node = node;
          this.canvas.style.cursor = "se-resize";
          skip_action = true;
        } else {
          //search for outputs
          if (node.outputs) {
            for (let i = 0, l = node.outputs.length; i < l; ++i) {
              let output = node.outputs[i];
              let link_pos = node.getConnectionPos(false, i);
              if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                this.connecting_node = node;
                this.connecting_output = output;
                this.connecting_output.slot_index = i;
                this.connecting_pos = node.getConnectionPos(false, i);
                this.connecting_slot = i;

                if (LiteGraph.shift_click_do_break_link_from) {
                  if (e.shiftKey) {
                    node.disconnectOutput(i);
                  }
                }

                if (is_double_click) {
                  if (node.onOutputDblClick) {
                    node.onOutputDblClick(i, e);
                  }
                } else {
                  if (node.onOutputClick) {
                    node.onOutputClick(i, e);
                  }
                }

                skip_action = true;
                break;
              }
            }
          }

          //search for inputs
          if (node.inputs) {
            for (let i = 0, l = node.inputs.length; i < l; ++i) {
              let input = node.inputs[i];
              let link_pos = node.getConnectionPos(true, i);
              if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                if (is_double_click) {
                  if (node.onInputDblClick) {
                    node.onInputDblClick(i, e);
                  }
                } else {
                  if (node.onInputClick) {
                    node.onInputClick(i, e);
                  }
                }

                if (input.link !== null) {
                  let link_info = this.graph.links[input.link]; //before disconnecting
                  if (LiteGraph.click_do_break_link_to) {
                    node.disconnectInput(i);
                    this.dirty_bgcanvas = true;
                    skip_action = true;
                  } else {
                    // do same action as has not node ?
                  }

                  if (
                    this.allow_reconnect_links ||
                    //this.move_destination_link_without_shift ||
                    e.shiftKey
                  ) {
                    if (!LiteGraph.click_do_break_link_to) {
                      node.disconnectInput(i);
                    }
                    this.connecting_node = this.graph._nodes_by_id[link_info.origin_id];
                    this.connecting_slot = link_info.origin_slot;
                    this.connecting_output = this.connecting_node.outputs[this.connecting_slot];
                    this.connecting_pos = this.connecting_node.getConnectionPos(false, this.connecting_slot);

                    this.dirty_bgcanvas = true;
                    skip_action = true;
                  }
                } else {
                  // has not node
                }

                if (!skip_action) {
                  // connect from in to out, from to to from
                  this.connecting_node = node;
                  this.connecting_input = input;
                  this.connecting_input.slot_index = i;
                  this.connecting_pos = node.getConnectionPos(true, i);
                  this.connecting_slot = i;

                  this.dirty_bgcanvas = true;
                  skip_action = true;
                }
              }
            }
          }
        } //not resizing
      }

      //it wasn't clicked on the links boxes
      if (!skip_action) {
        let block_drag_node = false;
        let pos = [e.canvasX - node.pos[0], e.canvasY - node.pos[1]];

        //widgets
        let widget = this.processNodeWidgets(node, this.graph_mouse, e);
        if (widget) {
          block_drag_node = true;
          this.node_widget = [node, widget];
        }

        //double clicking
        if (is_double_click && this.selected_nodes[node.id]) {
          //double click node
          if (node.onDblClick) {
            node.onDblClick(e, pos, this);
          }
          this.processNodeDblClicked(node);
          block_drag_node = true;
        }

        //if do not capture mouse
        if (node.onMouseDown && node.onMouseDown(e, pos, this)) {
          block_drag_node = true;
        } else {
          //open subgraph button
          if (node.subgraph && !node.skip_subgraph_button) {
            if (!node.flags.collapsed && pos[0] > node.size[0] - LiteGraph.NODE_TITLE_HEIGHT && pos[1] < 0) {
              let that = this;
              setTimeout(function () {
                that.openSubgraph(node.subgraph);
              }, 10);
            }
          }

          if (this.live_mode) {
            clicking_canvas_bg = true;
            block_drag_node = true;
          }
        }

        if (!block_drag_node) {
          if (this.allow_dragnodes) {
            this.graph.beforeChange();
            this.node_dragged = node;
          }
          if (!this.selected_nodes[node.id]) {
            this.processNodeSelected(node, e);
          }
        }

        this.dirty_canvas = true;
      }
    } //clicked outside of nodes
    else {
      if (!skip_action) {
        //search for link connector
        if (!this.read_only) {
          for (let i = 0; i < this.visible_links.length; ++i) {
            let link = this.visible_links[i];
            let center = link._pos;
            if (
              !center ||
              e.canvasX < center[0] - 4 ||
              e.canvasX > center[0] + 4 ||
              e.canvasY < center[1] - 4 ||
              e.canvasY > center[1] + 4
            ) {
              continue;
            }
            //link clicked
            this.showLinkMenu(link, e);
            this.over_link_center = null; //clear tooltip
            break;
          }
        }

        this.selected_group = this.graph.getGroupOnPos(e.canvasX, e.canvasY);
        this.selected_group_resizing = false;
        if (this.selected_group && !this.read_only) {
          if (e.ctrlKey) {
            this.dragging_rectangle = null;
          }

          let dist = distance(
            [e.canvasX, e.canvasY],
            [
              this.selected_group.pos[0] + this.selected_group.size[0],
              this.selected_group.pos[1] + this.selected_group.size[1]
            ]
          );
          if (dist * this.ds.scale < 10) {
            this.selected_group_resizing = true;
          } else {
            this.selected_group.recomputeInsideNodes();
          }
        }

        if (is_double_click && !this.read_only && this.allow_searchbox) {
          this.showSearchBox(e);
          e.preventDefault();
          e.stopPropagation();
        }

        clicking_canvas_bg = true;
      }
    }

    if (!skip_action && clicking_canvas_bg && this.allow_dragcanvas) {
      //console.log("pointerevents: dragging_canvas start");
      this.dragging_canvas = true;
    }
  } else if (e.which == 2) {
    //middle button

    if (LiteGraph.middle_click_slot_add_default_node) {
      if (node && this.allow_interaction && !skip_action && !this.read_only) {
        //not dragging mouse to connect two slots
        if (!this.connecting_node && !node.flags.collapsed && !this.live_mode) {
          let mClikSlot = false;
          let mClikSlot_index = false;
          let mClikSlot_isOut = false;
          //search for outputs
          if (node.outputs) {
            for (let i = 0, l = node.outputs.length; i < l; ++i) {
              let output = node.outputs[i];
              let link_pos = node.getConnectionPos(false, i);
              if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                mClikSlot = output;
                mClikSlot_index = i;
                mClikSlot_isOut = true;
                break;
              }
            }
          }

          //search for inputs
          if (node.inputs) {
            for (let i = 0, l = node.inputs.length; i < l; ++i) {
              let input = node.inputs[i];
              let link_pos = node.getConnectionPos(true, i);
              if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 15, link_pos[1] - 10, 30, 20)) {
                mClikSlot = input;
                mClikSlot_index = i;
                mClikSlot_isOut = false;
                break;
              }
            }
          }
          //console.log("middleClickSlots? "+mClikSlot+" & "+(mClikSlot_index!==false));
          if (mClikSlot && mClikSlot_index !== false) {
            let alphaPosY = 0.5 - (mClikSlot_index + 1) / (mClikSlot_isOut ? node.outputs.length : node.inputs.length);
            let node_bounding = node.getBounding();
            // estimate a position: this is a bad semi-bad-working mess .. REFACTOR with a correct autoplacement that knows about the others slots and nodes
            let posRef = [
              !mClikSlot_isOut ? node_bounding[0] : node_bounding[0] + node_bounding[2], // + node_bounding[0]/this.canvas.width*150
              e.canvasY - 80 // + node_bounding[0]/this.canvas.width*66 // vertical "derive"
            ];
            let nodeCreated = this.createDefaultNodeForSlot({
              nodeFrom: !mClikSlot_isOut ? null : node,
              slotFrom: !mClikSlot_isOut ? null : mClikSlot_index,
              nodeTo: !mClikSlot_isOut ? node : null,
              slotTo: !mClikSlot_isOut ? mClikSlot_index : null,
              position: posRef, //,e: e
              nodeType: "AUTO", //nodeNewType
              posAdd: [!mClikSlot_isOut ? -30 : 30, -alphaPosY * 130], //-alphaPosY*30]
              posSizeFix: [!mClikSlot_isOut ? -1 : 0, 0] //-alphaPosY*2*/
            });
          }
        }
      }
    }
  } else if (e.which == 3 || this.pointer_is_double) {
    //right button
    if (this.allow_interaction && !skip_action && !this.read_only) {
      // is it hover a node ?
      if (node) {
        if (
          Object.keys(this.selected_nodes).length &&
          (this.selected_nodes[node.id] || e.shiftKey || e.ctrlKey || e.metaKey)
        ) {
          // is multiselected or using shift to include the now node
          if (!this.selected_nodes[node.id]) this.selectNodes([node], true); // add this if not present
        } else {
          // update selection
          this.selectNodes([node]);
        }
      }

      // show menu on this node
      this.processContextMenu(node, e);
    }
  }

  //TODO
  //if(this.node_selected != prev_selected)
  //	this.onNodeSelectionChange(this.node_selected);

  this.last_mouse[0] = e.clientX;
  this.last_mouse[1] = e.clientY;
  this.last_mouseclick = LiteGraph.getTime();
  this.last_mouse_dragging = true;

  /*
if( (this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
    this.draw();
*/

  this.graph.change();

  //this is to ensure to defocus(blur) if a text input element is on focus
  if (
    !ref_window.document.activeElement ||
    (ref_window.document.activeElement.nodeName.toLowerCase() != "input" &&
      ref_window.document.activeElement.nodeName.toLowerCase() != "textarea")
  ) {
    e.preventDefault();
  }
  e.stopPropagation();

  if (this.onMouseDown) {
    this.onMouseDown(e);
  }

  return false;
};

/**
 * Called when a mouse move event has to be processed
 * @method processMouseMove
 **/
LGraphCanvas.prototype.processMouseMove = function (e) {
  if (this.autoresize) {
    this.resize();
  }

  if (this.set_canvas_dirty_on_mouse_event) this.dirty_canvas = true;

  if (!this.graph) {
    return;
  }

  LGraphCanvas.active_canvas = this;
  this.adjustMouseEvent(e);
  let mouse = [e.clientX, e.clientY];
  this.mouse[0] = mouse[0];
  this.mouse[1] = mouse[1];
  let delta = [mouse[0] - this.last_mouse[0], mouse[1] - this.last_mouse[1]];
  this.last_mouse = mouse;
  this.graph_mouse[0] = e.canvasX;
  this.graph_mouse[1] = e.canvasY;

  //console.log("pointerevents: processMouseMove "+e.pointerId+" "+e.isPrimary);

  if (this.block_click) {
    //console.log("pointerevents: processMouseMove block_click");
    e.preventDefault();
    return false;
  }

  e.dragging = this.last_mouse_dragging;

  if (this.node_widget) {
    this.processNodeWidgets(this.node_widget[0], this.graph_mouse, e, this.node_widget[1]);
    this.dirty_canvas = true;
  }

  if (this.dragging_rectangle) {
    this.dragging_rectangle[2] = e.canvasX - this.dragging_rectangle[0];
    this.dragging_rectangle[3] = e.canvasY - this.dragging_rectangle[1];
    this.dirty_canvas = true;
  } else if (this.selected_group && !this.read_only) {
    //moving/resizing a group
    if (this.selected_group_resizing) {
      this.selected_group.size = [e.canvasX - this.selected_group.pos[0], e.canvasY - this.selected_group.pos[1]];
    } else {
      let deltax = delta[0] / this.ds.scale;
      let deltay = delta[1] / this.ds.scale;
      this.selected_group.move(deltax, deltay, e.ctrlKey);
      if (this.selected_group._nodes.length) {
        this.dirty_canvas = true;
      }
    }
    this.dirty_bgcanvas = true;
  } else if (this.dragging_canvas) {
    ////console.log("pointerevents: processMouseMove is dragging_canvas");
    this.ds.offset[0] += delta[0] / this.ds.scale;
    this.ds.offset[1] += delta[1] / this.ds.scale;
    this.dirty_canvas = true;
    this.dirty_bgcanvas = true;
  } else if (this.allow_interaction && !this.read_only) {
    if (this.connecting_node) {
      this.dirty_canvas = true;
    }

    //get node over
    let node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

    //remove mouseover flag
    for (let i = 0, l = this.graph._nodes.length; i < l; ++i) {
      if (this.graph._nodes[i].mouseOver && node != this.graph._nodes[i]) {
        //mouse leave
        this.graph._nodes[i].mouseOver = false;
        if (this.node_over && this.node_over.onMouseLeave) {
          this.node_over.onMouseLeave(e);
        }
        this.node_over = null;
        this.dirty_canvas = true;
      }
    }

    //mouse over a node
    if (node) {
      if (node.redraw_on_mouse) this.dirty_canvas = true;

      //this.canvas.style.cursor = "move";
      if (!node.mouseOver) {
        //mouse enter
        node.mouseOver = true;
        this.node_over = node;
        this.dirty_canvas = true;

        if (node.onMouseEnter) {
          node.onMouseEnter(e);
        }
      }

      //in case the node wants to do something
      if (node.onMouseMove) {
        node.onMouseMove(e, [e.canvasX - node.pos[0], e.canvasY - node.pos[1]], this);
      }

      //if dragging a link
      if (this.connecting_node) {
        if (this.connecting_output) {
          let pos = this._highlight_input || [0, 0]; //to store the output of isOverNodeInput

          //on top of input
          if (this.isOverNodeBox(node, e.canvasX, e.canvasY)) {
            //mouse on top of the corner box, don't know what to do
          } else {
            //check if I have a slot below de mouse
            let slot = this.isOverNodeInput(node, e.canvasX, e.canvasY, pos);
            if (slot != -1 && node.inputs[slot]) {
              let slot_type = node.inputs[slot].type;
              if (LiteGraph.isValidConnection(this.connecting_output.type, slot_type)) {
                this._highlight_input = pos;
                this._highlight_input_slot = node.inputs[slot]; // XXX CHECK THIS
              }
            } else {
              this._highlight_input = null;
              this._highlight_input_slot = null; // XXX CHECK THIS
            }
          }
        } else if (this.connecting_input) {
          let pos = this._highlight_output || [0, 0]; //to store the output of isOverNodeOutput

          //on top of output
          if (this.isOverNodeBox(node, e.canvasX, e.canvasY)) {
            //mouse on top of the corner box, don't know what to do
          } else {
            //check if I have a slot below de mouse
            let slot = this.isOverNodeOutput(node, e.canvasX, e.canvasY, pos);
            if (slot != -1 && node.outputs[slot]) {
              let slot_type = node.outputs[slot].type;
              if (LiteGraph.isValidConnection(this.connecting_input.type, slot_type)) {
                this._highlight_output = pos;
              }
            } else {
              this._highlight_output = null;
            }
          }
        }
      }

      //Search for corner
      if (this.canvas) {
        if (
          isInsideRectangle(e.canvasX, e.canvasY, node.pos[0] + node.size[0] - 5, node.pos[1] + node.size[1] - 5, 5, 5)
        ) {
          this.canvas.style.cursor = "se-resize";
        } else {
          this.canvas.style.cursor = "crosshair";
        }
      }
    } else {
      //not over a node

      //search for link connector
      let over_link = null;
      for (let i = 0; i < this.visible_links.length; ++i) {
        let link = this.visible_links[i];
        let center = link._pos;
        if (
          !center ||
          e.canvasX < center[0] - 4 ||
          e.canvasX > center[0] + 4 ||
          e.canvasY < center[1] - 4 ||
          e.canvasY > center[1] + 4
        ) {
          continue;
        }
        over_link = link;
        break;
      }
      if (over_link != this.over_link_center) {
        this.over_link_center = over_link;
        this.dirty_canvas = true;
      }

      if (this.canvas) {
        this.canvas.style.cursor = "";
      }
    } //end

    //send event to node if capturing input (used with widgets that allow drag outside of the area of the node)
    if (this.node_capturing_input && this.node_capturing_input != node && this.node_capturing_input.onMouseMove) {
      this.node_capturing_input.onMouseMove(
        e,
        [e.canvasX - this.node_capturing_input.pos[0], e.canvasY - this.node_capturing_input.pos[1]],
        this
      );
    }

    //node being dragged
    if (this.node_dragged && !this.live_mode) {
      //console.log("draggin!",this.selected_nodes);
      for (let i in this.selected_nodes) {
        let n = this.selected_nodes[i];
        n.pos[0] += delta[0] / this.ds.scale;
        n.pos[1] += delta[1] / this.ds.scale;
      }

      this.dirty_canvas = true;
      this.dirty_bgcanvas = true;
    }

    if (this.resizing_node && !this.live_mode) {
      //convert mouse to node space
      let desired_size = [e.canvasX - this.resizing_node.pos[0], e.canvasY - this.resizing_node.pos[1]];
      let min_size = this.resizing_node.computeSize();
      desired_size[0] = Math.max(min_size[0], desired_size[0]);
      desired_size[1] = Math.max(min_size[1], desired_size[1]);
      this.resizing_node.setSize(desired_size);

      this.canvas.style.cursor = "se-resize";
      this.dirty_canvas = true;
      this.dirty_bgcanvas = true;
    }
  }

  e.preventDefault();
  return false;
};

/**
 * Called when a mouse up event has to be processed
 * @method processMouseUp
 **/
LGraphCanvas.prototype.processMouseUp = function (e) {
  let is_primary = e.isPrimary === undefined || e.isPrimary;

  //early exit for extra pointer
  if (!is_primary) {
    /*e.stopPropagation();
        e.preventDefault();*/
    //console.log("pointerevents: processMouseUp pointerN_stop "+e.pointerId+" "+e.isPrimary);
    return false;
  }

  //console.log("pointerevents: processMouseUp "+e.pointerId+" "+e.isPrimary+" :: "+e.clientX+" "+e.clientY);

  if (this.set_canvas_dirty_on_mouse_event) this.dirty_canvas = true;

  if (!this.graph) return;

  let window = this.getCanvasWindow();
  let document = window.document;
  LGraphCanvas.active_canvas = this;

  //restore the mousemove event back to the canvas
  if (!this.options.skip_events) {
    //console.log("pointerevents: processMouseUp adjustEventListener");
    LiteGraph.pointerListenerRemove(document, "move", this._mousemove_callback, true);
    LiteGraph.pointerListenerAdd(this.canvas, "move", this._mousemove_callback, true);
    LiteGraph.pointerListenerRemove(document, "up", this._mouseup_callback, true);
  }

  this.adjustMouseEvent(e);
  let now = LiteGraph.getTime();
  e.click_time = now - this.last_mouseclick;
  this.last_mouse_dragging = false;
  this.last_click_position = null;

  if (this.block_click) {
    //console.log("pointerevents: processMouseUp block_clicks");
    this.block_click = false; //used to avoid sending twice a click in a immediate button
  }

  //console.log("pointerevents: processMouseUp which: "+e.which);

  if (e.which == 1) {
    if (this.node_widget) {
      this.processNodeWidgets(this.node_widget[0], this.graph_mouse, e);
    }

    //left button
    this.node_widget = null;

    if (this.selected_group) {
      let diffx = this.selected_group.pos[0] - Math.round(this.selected_group.pos[0]);
      let diffy = this.selected_group.pos[1] - Math.round(this.selected_group.pos[1]);
      this.selected_group.move(diffx, diffy, e.ctrlKey);
      this.selected_group.pos[0] = Math.round(this.selected_group.pos[0]);
      this.selected_group.pos[1] = Math.round(this.selected_group.pos[1]);
      if (this.selected_group._nodes.length) {
        this.dirty_canvas = true;
      }
      this.selected_group = null;
    }
    this.selected_group_resizing = false;

    let node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

    if (this.dragging_rectangle) {
      if (this.graph) {
        let nodes = this.graph._nodes;
        let node_bounding = new Float32Array(4);

        //compute bounding and flip if left to right
        let w = Math.abs(this.dragging_rectangle[2]);
        let h = Math.abs(this.dragging_rectangle[3]);
        let startx = this.dragging_rectangle[2] < 0 ? this.dragging_rectangle[0] - w : this.dragging_rectangle[0];
        let starty = this.dragging_rectangle[3] < 0 ? this.dragging_rectangle[1] - h : this.dragging_rectangle[1];
        this.dragging_rectangle[0] = startx;
        this.dragging_rectangle[1] = starty;
        this.dragging_rectangle[2] = w;
        this.dragging_rectangle[3] = h;

        // test dragging rect size, if minimun simulate a click
        if (!node || (w > 10 && h > 10)) {
          //test against all nodes (not visible because the rectangle maybe start outside
          let to_select = [];
          for (let i = 0; i < nodes.length; ++i) {
            let nodeX = nodes[i];
            nodeX.getBounding(node_bounding);
            if (!overlapBounding(this.dragging_rectangle, node_bounding)) {
              continue;
            } //out of the visible area
            to_select.push(nodeX);
          }
          if (to_select.length) {
            this.selectNodes(to_select, e.shiftKey); // add to selection with shift
          }
        } else {
          // will select of update selection
          this.selectNodes([node], e.shiftKey || e.ctrlKey); // add to selection add to selection with ctrlKey or shiftKey
        }
      }
      this.dragging_rectangle = null;
    } else if (this.connecting_node) {
      //dragging a connection
      this.dirty_canvas = true;
      this.dirty_bgcanvas = true;

      let connInOrOut = this.connecting_output || this.connecting_input;
      let connType = connInOrOut.type;

      //node below mouse
      if (node) {
        /* no need to condition on event type.. just another type
                if (
                    connType == LiteGraph.EVENT &&
                    this.isOverNodeBox(node, e.canvasX, e.canvasY)
                ) {
                    
                    this.connecting_node.connect(
                        this.connecting_slot,
                        node,
                        LiteGraph.EVENT
                    );
                    
                } else {*/

        //slot below mouse? connect

        if (this.connecting_output) {
          let slot = this.isOverNodeInput(node, e.canvasX, e.canvasY);
          if (slot != -1) {
            this.connecting_node.connect(this.connecting_slot, node, slot);
          } else {
            //not on top of an input
            // look for a good slot
            this.connecting_node.connectByType(this.connecting_slot, node, connType);
          }
        } else if (this.connecting_input) {
          let slot = this.isOverNodeOutput(node, e.canvasX, e.canvasY);

          if (slot != -1) {
            node.connect(slot, this.connecting_node, this.connecting_slot); // this is inverted has output-input nature like
          } else {
            //not on top of an input
            // look for a good slot
            this.connecting_node.connectByTypeOutput(this.connecting_slot, node, connType);
          }
        }

        //}
      } else {
        // add menu when releasing link in empty space
        if (LiteGraph.release_link_on_empty_shows_menu) {
          if (e.shiftKey && this.allow_searchbox) {
            if (this.connecting_output) {
              this.showSearchBox(e, {
                node_from: this.connecting_node,
                slot_from: this.connecting_output,
                type_filter_in: this.connecting_output.type
              });
            } else if (this.connecting_input) {
              this.showSearchBox(e, {
                node_to: this.connecting_node,
                slot_from: this.connecting_input,
                type_filter_out: this.connecting_input.type
              });
            }
          } else {
            if (this.connecting_output) {
              this.showConnectionMenu({ nodeFrom: this.connecting_node, slotFrom: this.connecting_output, e: e });
            } else if (this.connecting_input) {
              this.showConnectionMenu({ nodeTo: this.connecting_node, slotTo: this.connecting_input, e: e });
            }
          }
        }
      }

      this.connecting_output = null;
      this.connecting_input = null;
      this.connecting_pos = null;
      this.connecting_node = null;
      this.connecting_slot = -1;
    } //not dragging connection
    else if (this.resizing_node) {
      this.dirty_canvas = true;
      this.dirty_bgcanvas = true;
      this.graph.afterChange(this.resizing_node);
      this.resizing_node = null;
    } else if (this.node_dragged) {
      //node being dragged?
      let node = this.node_dragged;
      if (
        node &&
        e.click_time < 300 &&
        isInsideRectangle(
          e.canvasX,
          e.canvasY,
          node.pos[0],
          node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT,
          LiteGraph.NODE_TITLE_HEIGHT,
          LiteGraph.NODE_TITLE_HEIGHT
        )
      ) {
        node.collapse();
      }

      this.dirty_canvas = true;
      this.dirty_bgcanvas = true;
      this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
      this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
      if (this.graph.config.align_to_grid || this.align_to_grid) {
        this.node_dragged.alignToGrid();
      }
      if (this.onNodeMoved) this.onNodeMoved(this.node_dragged);
      this.graph.afterChange(this.node_dragged);
      this.node_dragged = null;
    } //no node being dragged
    else {
      //get node over
      let node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

      if (!node && e.click_time < 300) {
        this.deselectAllNodes();
      }

      this.dirty_canvas = true;
      this.dragging_canvas = false;

      if (this.node_over && this.node_over.onMouseUp) {
        this.node_over.onMouseUp(e, [e.canvasX - this.node_over.pos[0], e.canvasY - this.node_over.pos[1]], this);
      }
      if (this.node_capturing_input && this.node_capturing_input.onMouseUp) {
        this.node_capturing_input.onMouseUp(e, [
          e.canvasX - this.node_capturing_input.pos[0],
          e.canvasY - this.node_capturing_input.pos[1]
        ]);
      }
    }
  } else if (e.which == 2) {
    //middle button
    //trace("middle");
    this.dirty_canvas = true;
    this.dragging_canvas = false;
  } else if (e.which == 3) {
    //right button
    //trace("right");
    this.dirty_canvas = true;
    this.dragging_canvas = false;
  }

  /*
    if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
        this.draw();
    */

  if (is_primary) {
    this.pointer_is_down = false;
    this.pointer_is_double = false;
  }

  this.graph.change();

  //console.log("pointerevents: processMouseUp stopPropagation");
  e.stopPropagation();
  e.preventDefault();
  return false;
};

/**
 * Called when a mouse wheel event has to be processed
 * @method processMouseWheel
 **/
LGraphCanvas.prototype.processMouseWheel = function (e) {
  if (!this.graph || !this.allow_dragcanvas) {
    return;
  }

  let delta = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;

  this.adjustMouseEvent(e);

  let x = e.clientX;
  let y = e.clientY;
  let is_inside =
    !this.viewport ||
    (this.viewport &&
      x >= this.viewport[0] &&
      x < this.viewport[0] + this.viewport[2] &&
      y >= this.viewport[1] &&
      y < this.viewport[1] + this.viewport[3]);
  if (!is_inside) return;

  let scale = this.ds.scale;

  if (delta > 0) {
    scale *= 1.1;
  } else if (delta < 0) {
    scale *= 1 / 1.1;
  }

  //this.setZoom( scale, [ e.clientX, e.clientY ] );
  this.ds.changeScale(scale, [e.clientX, e.clientY]);

  this.graph.change();

  e.preventDefault();
  return false; // prevent default
};

/**
 * returns true if a position (in graph space) is on top of a node little corner box
 * @method isOverNodeBox
 **/
LGraphCanvas.prototype.isOverNodeBox = function (node, canvasx, canvasy) {
  let title_height = LiteGraph.NODE_TITLE_HEIGHT;
  if (
    isInsideRectangle(
      canvasx,
      canvasy,
      node.pos[0] + 2,
      node.pos[1] + 2 - title_height,
      title_height - 4,
      title_height - 4
    )
  ) {
    return true;
  }
  return false;
};

/**
 * returns the INDEX if a position (in graph space) is on top of a node input slot
 * @method isOverNodeInput
 **/
LGraphCanvas.prototype.isOverNodeInput = function (node, canvasx, canvasy, slot_pos) {
  if (node.inputs) {
    for (let i = 0, l = node.inputs.length; i < l; ++i) {
      let input = node.inputs[i];
      let link_pos = node.getConnectionPos(true, i);
      let is_inside = false;
      if (node.horizontal) {
        is_inside = isInsideRectangle(canvasx, canvasy, link_pos[0] - 5, link_pos[1] - 10, 10, 20);
      } else {
        is_inside = isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 40, 10);
      }
      if (is_inside) {
        if (slot_pos) {
          slot_pos[0] = link_pos[0];
          slot_pos[1] = link_pos[1];
        }
        return i;
      }
    }
  }
  return -1;
};

/**
 * returns the INDEX if a position (in graph space) is on top of a node output slot
 * @method isOverNodeOuput
 **/
LGraphCanvas.prototype.isOverNodeOutput = function (node, canvasx, canvasy, slot_pos) {
  if (node.outputs) {
    for (let i = 0, l = node.outputs.length; i < l; ++i) {
      let output = node.outputs[i];
      let link_pos = node.getConnectionPos(false, i);
      let is_inside = false;
      if (node.horizontal) {
        is_inside = isInsideRectangle(canvasx, canvasy, link_pos[0] - 5, link_pos[1] - 10, 10, 20);
      } else {
        is_inside = isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 40, 10);
      }
      if (is_inside) {
        if (slot_pos) {
          slot_pos[0] = link_pos[0];
          slot_pos[1] = link_pos[1];
        }
        return i;
      }
    }
  }
  return -1;
};

/**
 * process a key event
 * @method processKey
 **/
LGraphCanvas.prototype.processKey = function (e) {
  if (!this.graph) {
    return;
  }

  let block_default = false;
  //console.log(e); //debug

  if (e.target.localName == "input") {
    return;
  }

  if (e.type == "keydown") {
    if (e.keyCode == 32) {
      //space
      this.dragging_canvas = true;
      block_default = true;
    }

    if (e.keyCode == 27) {
      //esc
      if (this.node_panel) this.node_panel.close();
      if (this.options_panel) this.options_panel.close();
      block_default = true;
    }

    //select all Control A
    if (e.keyCode == 65 && e.ctrlKey) {
      this.selectNodes();
      block_default = true;
    }

    if (e.code == "KeyC" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
      //copy
      if (this.selected_nodes) {
        this.copyToClipboard();
        block_default = true;
      }
    }

    if (e.code == "KeyV" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
      //paste
      this.pasteFromClipboard();
    }

    //delete or backspace
    if (e.keyCode == 46 || e.keyCode == 8) {
      if (e.target.localName != "input" && e.target.localName != "textarea") {
        this.deleteSelectedNodes();
        block_default = true;
      }
    }

    //collapse
    //...

    //TODO
    if (this.selected_nodes) {
      for (let i in this.selected_nodes) {
        if (this.selected_nodes[i].onKeyDown) {
          this.selected_nodes[i].onKeyDown(e);
        }
      }
    }
  } else if (e.type == "keyup") {
    if (e.keyCode == 32) {
      // space
      this.dragging_canvas = false;
    }

    if (this.selected_nodes) {
      for (let i in this.selected_nodes) {
        if (this.selected_nodes[i].onKeyUp) {
          this.selected_nodes[i].onKeyUp(e);
        }
      }
    }
  }

  this.graph.change();

  if (block_default) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
};

LGraphCanvas.prototype.copyToClipboard = function () {
  let clipboard_info = {
    nodes: [],
    links: []
  };
  let index = 0;
  let selected_nodes_array = [];
  for (let i in this.selected_nodes) {
    let node = this.selected_nodes[i];
    node._relative_id = index;
    selected_nodes_array.push(node);
    index += 1;
  }

  for (let i = 0; i < selected_nodes_array.length; ++i) {
    let node = selected_nodes_array[i];
    let cloned = node.clone();
    if (!cloned) {
      console.warn("node type not found: " + node.type);
      continue;
    }
    clipboard_info.nodes.push(cloned.serialize());
    if (node.inputs && node.inputs.length) {
      for (let j = 0; j < node.inputs.length; ++j) {
        let input = node.inputs[j];
        if (!input || input.link == null) {
          continue;
        }
        let link_info = this.graph.links[input.link];
        if (!link_info) {
          continue;
        }
        let target_node = this.graph.getNodeById(link_info.origin_id);
        if (!target_node || !this.selected_nodes[target_node.id]) {
          //improve this by allowing connections to non-selected nodes
          continue;
        } //not selected
        clipboard_info.links.push([
          target_node._relative_id,
          link_info.origin_slot, //j,
          node._relative_id,
          link_info.target_slot
        ]);
      }
    }
  }
  localStorage.setItem("litegrapheditor_clipboard", JSON.stringify(clipboard_info));
};

LGraphCanvas.prototype.pasteFromClipboard = function () {
  let data = localStorage.getItem("litegrapheditor_clipboard");
  if (!data) {
    return;
  }

  this.graph.beforeChange();

  //create nodes
  let clipboard_info = JSON.parse(data);
  // calculate top-left node, could work without this processing but using diff with last node pos :: clipboard_info.nodes[clipboard_info.nodes.length-1].pos
  let posMin = false;
  let posMinIndexes = false;
  for (let i = 0; i < clipboard_info.nodes.length; ++i) {
    if (posMin) {
      if (posMin[0] > clipboard_info.nodes[i].pos[0]) {
        posMin[0] = clipboard_info.nodes[i].pos[0];
        posMinIndexes[0] = i;
      }
      if (posMin[1] > clipboard_info.nodes[i].pos[1]) {
        posMin[1] = clipboard_info.nodes[i].pos[1];
        posMinIndexes[1] = i;
      }
    } else {
      posMin = [clipboard_info.nodes[i].pos[0], clipboard_info.nodes[i].pos[1]];
      posMinIndexes = [i, i];
    }
  }
  let nodes = [];
  for (let i = 0; i < clipboard_info.nodes.length; ++i) {
    let node_data = clipboard_info.nodes[i];
    let node = LiteGraph.createNode(node_data.type);
    if (node) {
      node.configure(node_data);

      //paste in last known mouse position
      node.pos[0] += this.graph_mouse[0] - posMin[0]; //+= 5;
      node.pos[1] += this.graph_mouse[1] - posMin[1]; //+= 5;

      this.graph.add(node, { doProcessChange: false });

      nodes.push(node);
    }
  }

  //create links
  for (let i = 0; i < clipboard_info.links.length; ++i) {
    let link_info = clipboard_info.links[i];
    let origin_node = nodes[link_info[0]];
    let target_node = nodes[link_info[2]];
    if (origin_node && target_node) origin_node.connect(link_info[1], target_node, link_info[3]);
    else console.warn("Warning, nodes missing on pasting");
  }

  this.selectNodes(nodes);

  this.graph.afterChange();
};

/**
 * process a item drop event on top the canvas
 * @method processDrop
 **/
LGraphCanvas.prototype.processDrop = function (e) {
  e.preventDefault();
  this.adjustMouseEvent(e);
  let x = e.clientX;
  let y = e.clientY;
  let is_inside =
    !this.viewport ||
    (this.viewport &&
      x >= this.viewport[0] &&
      x < this.viewport[0] + this.viewport[2] &&
      y >= this.viewport[1] &&
      y < this.viewport[1] + this.viewport[3]);
  if (!is_inside) {
    return;
    // --- BREAK ---
  }

  let pos = [e.canvasX, e.canvasY];

  let node = this.graph ? this.graph.getNodeOnPos(pos[0], pos[1]) : null;

  if (!node) {
    let r = null;
    if (this.onDropItem) {
      r = this.onDropItem(event);
    }
    if (!r) {
      this.checkDropItem(e);
    }
    return;
  }

  if (node.onDropFile || node.onDropData) {
    let files = e.dataTransfer.files;
    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        let file = e.dataTransfer.files[0];
        let filename = file.name;
        let ext = LGraphCanvas.getFileExtension(filename);
        //console.log(file);

        if (node.onDropFile) {
          node.onDropFile(file);
        }

        if (node.onDropData) {
          //prepare reader
          let reader = new FileReader();
          reader.onload = function (event) {
            //console.log(event.target);
            let data = event.target.result;
            node.onDropData(data, filename, file);
          };

          //read data
          let type = file.type.split("/")[0];
          if (type == "text" || type == "") {
            reader.readAsText(file);
          } else if (type == "image") {
            reader.readAsDataURL(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        }
      }
    }
  }

  if (node.onDropItem) {
    if (node.onDropItem(event)) {
      return true;
    }
  }

  if (this.onDropItem) {
    return this.onDropItem(event);
  }

  return false;
};

//called if the graph doesn't have a default drop item behaviour
LGraphCanvas.prototype.checkDropItem = function (e) {
  if (e.dataTransfer.files.length) {
    let file = e.dataTransfer.files[0];
    let ext = LGraphCanvas.getFileExtension(file.name).toLowerCase();
    let nodetype = LiteGraph.node_types_by_file_extension[ext];
    if (nodetype) {
      this.graph.beforeChange();
      let node = LiteGraph.createNode(nodetype.type);
      node.pos = [e.canvasX, e.canvasY];
      this.graph.add(node);
      if (node.onDropFile) {
        node.onDropFile(file);
      }
      this.graph.afterChange();
    }
  }
};

LGraphCanvas.prototype.processNodeDblClicked = function (n) {
  if (this.onShowNodePanel) {
    this.onShowNodePanel(n);
  } else {
    this.showShowNodePanel(n);
  }

  if (this.onNodeDblClicked) {
    this.onNodeDblClicked(n);
  }

  this.setDirty(true);
};

LGraphCanvas.prototype.processNodeSelected = function (node, e) {
  this.selectNode(node, e && (e.shiftKey || e.ctrlKey));
  if (this.onNodeSelected) {
    this.onNodeSelected(node);
  }
};

/**
 * selects a given node (or adds it to the current selection)
 * @method selectNode
 **/
LGraphCanvas.prototype.selectNode = function (node, add_to_current_selection) {
  if (node == null) {
    this.deselectAllNodes();
  } else {
    this.selectNodes([node], add_to_current_selection);
  }
};

/**
 * selects several nodes (or adds them to the current selection)
 * @method selectNodes
 **/
LGraphCanvas.prototype.selectNodes = function (nodes, add_to_current_selection) {
  if (!add_to_current_selection) {
    this.deselectAllNodes();
  }

  nodes = nodes || this.graph._nodes;
  if (typeof nodes == "string") nodes = [nodes];
  for (let i in nodes) {
    let node = nodes[i];
    if (node.is_selected) {
      continue;
    }

    if (!node.is_selected && node.onSelected) {
      node.onSelected();
    }
    node.is_selected = true;
    this.selected_nodes[node.id] = node;

    if (node.inputs) {
      for (let j = 0; j < node.inputs.length; ++j) {
        this.highlighted_links[node.inputs[j].link] = true;
      }
    }
    if (node.outputs) {
      for (let j = 0; j < node.outputs.length; ++j) {
        let out = node.outputs[j];
        if (out.links) {
          for (let k = 0; k < out.links.length; ++k) {
            this.highlighted_links[out.links[k]] = true;
          }
        }
      }
    }
  }

  if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes);

  this.setDirty(true);
};

/**
 * removes a node from the current selection
 * @method deselectNode
 **/
LGraphCanvas.prototype.deselectNode = function (node) {
  if (!node.is_selected) {
    return;
  }
  if (node.onDeselected) {
    node.onDeselected();
  }
  node.is_selected = false;

  if (this.onNodeDeselected) {
    this.onNodeDeselected(node);
  }

  //remove highlighted
  if (node.inputs) {
    for (let i = 0; i < node.inputs.length; ++i) {
      delete this.highlighted_links[node.inputs[i].link];
    }
  }
  if (node.outputs) {
    for (let i = 0; i < node.outputs.length; ++i) {
      let out = node.outputs[i];
      if (out.links) {
        for (let j = 0; j < out.links.length; ++j) {
          delete this.highlighted_links[out.links[j]];
        }
      }
    }
  }
};

/**
 * removes all nodes from the current selection
 * @method deselectAllNodes
 **/
LGraphCanvas.prototype.deselectAllNodes = function () {
  if (!this.graph) {
    return;
  }
  let nodes = this.graph._nodes;
  for (let i = 0, l = nodes.length; i < l; ++i) {
    let node = nodes[i];
    if (!node.is_selected) {
      continue;
    }
    if (node.onDeselected) {
      node.onDeselected();
    }
    node.is_selected = false;
    if (this.onNodeDeselected) {
      this.onNodeDeselected(node);
    }
  }
  this.selected_nodes = {};
  this.current_node = null;
  this.highlighted_links = {};
  if (this.onSelectionChange) this.onSelectionChange(this.selected_nodes);
  this.setDirty(true);
};

/**
 * deletes all nodes in the current selection from the graph
 * @method deleteSelectedNodes
 **/
LGraphCanvas.prototype.deleteSelectedNodes = function () {
  this.graph.beforeChange();

  for (let i in this.selected_nodes) {
    let node = this.selected_nodes[i];

    if (node.block_delete) continue;

    //autoconnect when possible (very basic, only takes into account first input-output)
    if (
      node.inputs &&
      node.inputs.length &&
      node.outputs &&
      node.outputs.length &&
      LiteGraph.isValidConnection(node.inputs[0].type, node.outputs[0].type) &&
      node.inputs[0].link &&
      node.outputs[0].links &&
      node.outputs[0].links.length
    ) {
      let input_link = node.graph.links[node.inputs[0].link];
      let output_link = node.graph.links[node.outputs[0].links[0]];
      let input_node = node.getInputNode(0);
      let output_node = node.getOutputNodes(0)[0];
      if (input_node && output_node) input_node.connect(input_link.origin_slot, output_node, output_link.target_slot);
    }
    this.graph.remove(node);
    if (this.onNodeDeselected) {
      this.onNodeDeselected(node);
    }
  }
  this.selected_nodes = {};
  this.current_node = null;
  this.highlighted_links = {};
  this.setDirty(true);
  this.graph.afterChange();
};

/**
 * centers the camera on a given node
 * @method centerOnNode
 **/
LGraphCanvas.prototype.centerOnNode = function (node) {
  this.ds.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (this.canvas.width * 0.5) / this.ds.scale;
  this.ds.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (this.canvas.height * 0.5) / this.ds.scale;
  this.setDirty(true, true);
};

/**
 * adds some useful properties to a mouse event, like the position in graph coordinates
 * @method adjustMouseEvent
 **/
LGraphCanvas.prototype.adjustMouseEvent = function (e) {
  let clientX_rel = 0;
  let clientY_rel = 0;

  if (this.canvas) {
    let b = this.canvas.getBoundingClientRect();
    clientX_rel = e.clientX - b.left;
    clientY_rel = e.clientY - b.top;
  } else {
    clientX_rel = e.clientX;
    clientY_rel = e.clientY;
  }

  // e.deltaX = clientX_rel - this.last_mouse_position[0];
  // e.deltaY = clientY_rel - this.last_mouse_position[1];

  this.last_mouse_position[0] = clientX_rel;
  this.last_mouse_position[1] = clientY_rel;

  e.canvasX = clientX_rel / this.ds.scale - this.ds.offset[0];
  e.canvasY = clientY_rel / this.ds.scale - this.ds.offset[1];

  //console.log("pointerevents: adjustMouseEvent "+e.clientX+":"+e.clientY+" "+clientX_rel+":"+clientY_rel+" "+e.canvasX+":"+e.canvasY);
};

/**
 * changes the zoom level of the graph (default is 1), you can pass also a place used to pivot the zoom
 * @method setZoom
 **/
LGraphCanvas.prototype.setZoom = function (value, zooming_center) {
  this.ds.changeScale(value, zooming_center);
  /*
if(!zooming_center && this.canvas)
    zooming_center = [this.canvas.width * 0.5,this.canvas.height * 0.5];

let center = this.convertOffsetToCanvas( zooming_center );

this.ds.scale = value;

if(this.scale > this.max_zoom)
    this.scale = this.max_zoom;
else if(this.scale < this.min_zoom)
    this.scale = this.min_zoom;

let new_center = this.convertOffsetToCanvas( zooming_center );
let delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];

this.offset[0] += delta_offset[0];
this.offset[1] += delta_offset[1];
*/

  this.dirty_canvas = true;
  this.dirty_bgcanvas = true;
};

/**
 * converts a coordinate from graph coordinates to canvas2D coordinates
 * @method convertOffsetToCanvas
 **/
LGraphCanvas.prototype.convertOffsetToCanvas = function (pos, out) {
  return this.ds.convertOffsetToCanvas(pos, out);
};

/**
 * converts a coordinate from Canvas2D coordinates to graph space
 * @method convertCanvasToOffset
 **/
LGraphCanvas.prototype.convertCanvasToOffset = function (pos, out) {
  return this.ds.convertCanvasToOffset(pos, out);
};

//converts event coordinates from canvas2D to graph coordinates
LGraphCanvas.prototype.convertEventToCanvasOffset = function (e) {
  let rect = this.canvas.getBoundingClientRect();
  return this.convertCanvasToOffset([e.clientX - rect.left, e.clientY - rect.top]);
};

/**
 * brings a node to front (above all other nodes)
 * @method bringToFront
 **/
LGraphCanvas.prototype.bringToFront = function (node) {
  let i = this.graph._nodes.indexOf(node);
  if (i == -1) {
    return;
  }

  this.graph._nodes.splice(i, 1);
  this.graph._nodes.push(node);
};

/**
 * sends a node to the back (below all other nodes)
 * @method sendToBack
 **/
LGraphCanvas.prototype.sendToBack = function (node) {
  let i = this.graph._nodes.indexOf(node);
  if (i == -1) {
    return;
  }

  this.graph._nodes.splice(i, 1);
  this.graph._nodes.unshift(node);
};

/**
 * checks which nodes are visible (inside the camera area)
 * @method computeVisibleNodes
 **/
LGraphCanvas.prototype.computeVisibleNodes = function (nodes, out) {
  const visible_nodes = out || [];
  visible_nodes.length = 0;
  nodes = nodes || this.graph._nodes;
  for (let i = 0, l = nodes.length; i < l; ++i) {
    let n = nodes[i];

    //skip rendering nodes in live mode
    if (this.live_mode && !n.onDrawBackground && !n.onDrawForeground) {
      continue;
    }

    if (!overlapBounding(this.visible_area, n.getBounding(canvas_bounding_vec4))) {
      continue;
    } //out of the visible area

    visible_nodes.push(n);
  }
  return visible_nodes;
};

/**
 * renders the whole canvas content, by rendering in two separated canvas, one containing the background grid and the connections, and one containing the nodes)
 * @method draw
 **/
LGraphCanvas.prototype.draw = function (force_canvas, force_bgcanvas) {
  if (!this.canvas || this.canvas.width == 0 || this.canvas.height == 0) {
    return;
  }

  //fps counting
  let now = LiteGraph.getTime();
  this.render_time = (now - this.last_draw_time) * 0.001;
  this.last_draw_time = now;

  if (this.graph) {
    this.ds.computeVisibleArea(this.viewport);
  }

  if (
    this.dirty_bgcanvas ||
    force_bgcanvas ||
    this.always_render_background ||
    (this.graph && this.graph._last_trigger_time && now - this.graph._last_trigger_time < 1000)
  ) {
    this.drawBackCanvas();
  }

  if (this.dirty_canvas || force_canvas) {
    this.drawFrontCanvas();
  }

  this.fps = this.render_time ? 1.0 / this.render_time : 0;
  this.frame += 1;
};

/**
 * draws the front canvas (the one containing all the nodes)
 * @method drawFrontCanvas
 **/
LGraphCanvas.prototype.drawFrontCanvas = function () {
  this.dirty_canvas = false;

  if (!this.ctx) {
    this.ctx = this.bgcanvas.getContext("2d");
  }
  let ctx = this.ctx;
  if (!ctx) {
    //maybe is using webgl...
    return;
  }

  let canvas = this.canvas;
  if (ctx.start2D && !this.viewport) {
    ctx.start2D();
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  //clip dirty area if there is one, otherwise work in full canvas
  let area = this.viewport || this.dirty_area;
  if (area) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(area[0], area[1], area[2], area[3]);
    ctx.clip();
  }

  //clear
  //canvas.width = canvas.width;
  if (this.clear_background) {
    if (area) ctx.clearRect(area[0], area[1], area[2], area[3]);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  //draw bg canvas
  if (this.bgcanvas == this.canvas) {
    this.drawBackCanvas();
  } else {
    ctx.drawImage(this.bgcanvas, 0, 0);
  }

  //rendering
  if (this.onRender) {
    this.onRender(canvas, ctx);
  }

  //info widget
  if (this.show_info) {
    this.renderInfo(ctx, area ? area[0] : 0, area ? area[1] : 0);
  }

  if (this.graph) {
    //apply transformations
    ctx.save();
    this.ds.toCanvasContext(ctx);

    //draw nodes
    let drawn_nodes = 0;
    let visible_nodes = this.computeVisibleNodes(null, this.visible_nodes);

    for (let i = 0; i < visible_nodes.length; ++i) {
      let node = visible_nodes[i];

      //transform coords system
      ctx.save();
      ctx.translate(node.pos[0], node.pos[1]);

      //Draw
      this.drawNode(node, ctx);
      drawn_nodes += 1;

      //Restore
      ctx.restore();
    }

    //on top (debug)
    if (this.render_execution_order) {
      this.drawExecutionOrder(ctx);
    }

    //connections ontop?
    if (this.graph.config.links_ontop) {
      if (!this.live_mode) {
        this.drawConnections(ctx);
      }
    }

    //current connection (the one being dragged by the mouse)
    if (this.connecting_pos != null) {
      ctx.lineWidth = this.connections_width;
      let link_color = null;

      let connInOrOut = this.connecting_output || this.connecting_input;

      let connType = connInOrOut.type;
      let connDir = connInOrOut.dir;
      if (connDir == null) {
        if (this.connecting_output) connDir = this.connecting_node.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT;
        else connDir = this.connecting_node.horizontal ? LiteGraph.UP : LiteGraph.LEFT;
      }
      let connShape = connInOrOut.shape;

      switch (connType) {
        case LiteGraph.EVENT:
          link_color = LiteGraph.EVENT_LINK_COLOR;
          break;
        default:
          link_color = LiteGraph.CONNECTING_LINK_COLOR;
      }

      //the connection being dragged by the mouse
      this.renderLink(
        ctx,
        this.connecting_pos,
        [this.graph_mouse[0], this.graph_mouse[1]],
        null,
        false,
        null,
        link_color,
        connDir,
        LiteGraph.CENTER
      );

      ctx.beginPath();
      if (connType === LiteGraph.EVENT || connShape === LiteGraph.BOX_SHAPE) {
        ctx.rect(this.connecting_pos[0] - 6 + 0.5, this.connecting_pos[1] - 5 + 0.5, 14, 10);
        ctx.fill();
        ctx.beginPath();
        ctx.rect(this.graph_mouse[0] - 6 + 0.5, this.graph_mouse[1] - 5 + 0.5, 14, 10);
      } else if (connShape === LiteGraph.ARROW_SHAPE) {
        ctx.moveTo(this.connecting_pos[0] + 8, this.connecting_pos[1] + 0.5);
        ctx.lineTo(this.connecting_pos[0] - 4, this.connecting_pos[1] + 6 + 0.5);
        ctx.lineTo(this.connecting_pos[0] - 4, this.connecting_pos[1] - 6 + 0.5);
        ctx.closePath();
      } else {
        ctx.arc(this.connecting_pos[0], this.connecting_pos[1], 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.graph_mouse[0], this.graph_mouse[1], 4, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.fillStyle = "#ffcc00";
      if (this._highlight_input) {
        ctx.beginPath();
        let shape = this._highlight_input_slot.shape;
        if (shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(this._highlight_input[0] + 8, this._highlight_input[1] + 0.5);
          ctx.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] + 6 + 0.5);
          ctx.lineTo(this._highlight_input[0] - 4, this._highlight_input[1] - 6 + 0.5);
          ctx.closePath();
        } else {
          ctx.arc(this._highlight_input[0], this._highlight_input[1], 6, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      if (this._highlight_output) {
        ctx.beginPath();
        if (shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(this._highlight_output[0] + 8, this._highlight_output[1] + 0.5);
          ctx.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] + 6 + 0.5);
          ctx.lineTo(this._highlight_output[0] - 4, this._highlight_output[1] - 6 + 0.5);
          ctx.closePath();
        } else {
          ctx.arc(this._highlight_output[0], this._highlight_output[1], 6, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }

    //the selection rectangle
    if (this.dragging_rectangle) {
      ctx.strokeStyle = "#FFF";
      ctx.strokeRect(
        this.dragging_rectangle[0],
        this.dragging_rectangle[1],
        this.dragging_rectangle[2],
        this.dragging_rectangle[3]
      );
    }

    //on top of link center
    if (this.over_link_center && this.render_link_tooltip) this.drawLinkTooltip(ctx, this.over_link_center);
    else if (this.onDrawLinkTooltip)
      //to remove
      this.onDrawLinkTooltip(ctx, null);

    //custom info
    if (this.onDrawForeground) {
      this.onDrawForeground(ctx, this.visible_rect);
    }

    ctx.restore();
  }

  //draws panel in the corner
  if (this._graph_stack && this._graph_stack.length) {
    this.drawSubgraphPanel(ctx);
  }

  if (this.onDrawOverlay) {
    this.onDrawOverlay(ctx);
  }

  if (area) {
    ctx.restore();
  }

  if (ctx.finish2D) {
    //this is a function I use in webgl renderer
    ctx.finish2D();
  }
};

/**
 * draws the panel in the corner that shows subgraph properties
 * @method drawSubgraphPanel
 **/
LGraphCanvas.prototype.drawSubgraphPanel = function (ctx) {
  let subgraph = this.graph;
  let subnode = subgraph._subgraph_node;
  if (!subnode) {
    console.warn("subgraph without subnode");
    return;
  }
  this.drawSubgraphPanelLeft(subgraph, subnode, ctx);
  this.drawSubgraphPanelRight(subgraph, subnode, ctx);
};

LGraphCanvas.prototype.drawSubgraphPanelLeft = function (subgraph, subnode, ctx) {
  let num = subnode.inputs ? subnode.inputs.length : 0;
  let w = 200;
  let h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);

  ctx.fillStyle = "#111";
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.roundRect(10, 10, w, (num + 1) * h + 50, [8]);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#888";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Graph Inputs", 20, 34);
  // let pos = this.mouse;

  if (this.drawButton(w - 20, 20, 20, 20, "X", "#151515")) {
    this.closeSubgraph();
    return;
  }

  let y = 50;
  ctx.font = "14px Arial";
  if (subnode.inputs)
    for (let i = 0; i < subnode.inputs.length; ++i) {
      let input = subnode.inputs[i];
      if (input.not_subgraph_input) continue;

      //input button clicked
      if (this.drawButton(20, y + 2, w - 20, h - 2)) {
        let type = subnode.constructor.input_node_type || "graph/input";
        this.graph.beforeChange();
        let newnode = LiteGraph.createNode(type);
        if (newnode) {
          subgraph.add(newnode);
          this.block_click = false;
          this.last_click_position = null;
          this.selectNodes([newnode]);
          this.node_dragged = newnode;
          this.dragging_canvas = false;
          newnode.setProperty("name", input.name);
          newnode.setProperty("type", input.type);
          this.node_dragged.pos[0] = this.graph_mouse[0] - 5;
          this.node_dragged.pos[1] = this.graph_mouse[1] - 5;
          this.graph.afterChange();
        } else console.error("graph input node not found:", type);
      }
      ctx.fillStyle = "#9C9";
      ctx.beginPath();
      ctx.arc(w - 16, y + h * 0.5, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#AAA";
      ctx.fillText(input.name, 30, y + h * 0.75);
      // let tw = ctx.measureText(input.name);
      ctx.fillStyle = "#777";
      ctx.fillText(input.type, 130, y + h * 0.75);
      y += h;
    }
  //add + button
  if (this.drawButton(20, y + 2, w - 20, h - 2, "+", "#151515", "#222")) {
    this.showSubgraphPropertiesDialog(subnode);
  }
};
LGraphCanvas.prototype.drawSubgraphPanelRight = function (subgraph, subnode, ctx) {
  let num = subnode.outputs ? subnode.outputs.length : 0;
  let canvas_w = this.bgcanvas.width;
  let w = 200;
  let h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);

  ctx.fillStyle = "#111";
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.roundRect(canvas_w - w - 10, 10, w, (num + 1) * h + 50, [8]);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#888";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  let title_text = "Graph Outputs";
  let tw = ctx.measureText(title_text).width;
  ctx.fillText(title_text, canvas_w - tw - 20, 34);
  // let pos = this.mouse;
  if (this.drawButton(canvas_w - w, 20, 20, 20, "X", "#151515")) {
    this.closeSubgraph();
    return;
  }

  let y = 50;
  ctx.font = "14px Arial";
  if (subnode.outputs)
    for (let i = 0; i < subnode.outputs.length; ++i) {
      let output = subnode.outputs[i];
      if (output.not_subgraph_input) continue;

      //output button clicked
      if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2)) {
        let type = subnode.constructor.output_node_type || "graph/output";
        this.graph.beforeChange();
        let newnode = LiteGraph.createNode(type);
        if (newnode) {
          subgraph.add(newnode);
          this.block_click = false;
          this.last_click_position = null;
          this.selectNodes([newnode]);
          this.node_dragged = newnode;
          this.dragging_canvas = false;
          newnode.setProperty("name", output.name);
          newnode.setProperty("type", output.type);
          this.node_dragged.pos[0] = this.graph_mouse[0] - 5;
          this.node_dragged.pos[1] = this.graph_mouse[1] - 5;
          this.graph.afterChange();
        } else console.error("graph input node not found:", type);
      }
      ctx.fillStyle = "#9C9";
      ctx.beginPath();
      ctx.arc(canvas_w - w + 16, y + h * 0.5, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#AAA";
      ctx.fillText(output.name, canvas_w - w + 30, y + h * 0.75);
      // let tw = ctx.measureText(input.name);
      ctx.fillStyle = "#777";
      ctx.fillText(output.type, canvas_w - w + 130, y + h * 0.75);
      y += h;
    }
  //add + button
  if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2, "+", "#151515", "#222")) {
    this.showSubgraphPropertiesDialogRight(subnode);
  }
};
//Draws a button into the canvas overlay and computes if it was clicked using the immediate gui paradigm
LGraphCanvas.prototype.drawButton = function (x, y, w, h, text, bgcolor, hovercolor, textcolor) {
  let ctx = this.ctx;
  bgcolor = bgcolor || LiteGraph.NODE_DEFAULT_COLOR;
  hovercolor = hovercolor || "#555";
  textcolor = textcolor || LiteGraph.NODE_TEXT_COLOR;
  let yFix = y + LiteGraph.NODE_TITLE_HEIGHT + 2; // fix the height with the title
  let pos = this.mouse;
  let hover = LiteGraph.isInsideRectangle(pos[0], pos[1], x, yFix, w, h);
  pos = this.last_click_position;
  let clicked = pos && LiteGraph.isInsideRectangle(pos[0], pos[1], x, yFix, w, h);

  ctx.fillStyle = hover ? hovercolor : bgcolor;
  if (clicked) ctx.fillStyle = "#AAA";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [4]);
  ctx.fill();

  if (text != null) {
    if (text.constructor == String) {
      ctx.fillStyle = textcolor;
      ctx.textAlign = "center";
      ctx.font = ((h * 0.65) | 0) + "px Arial";
      ctx.fillText(text, x + w * 0.5, y + h * 0.75);
      ctx.textAlign = "left";
    }
  }

  let was_clicked = clicked && !this.block_click;
  if (clicked) this.blockClick();
  return was_clicked;
};

LGraphCanvas.prototype.isAreaClicked = function (x, y, w, h, hold_click) {
  let pos = this.mouse;
  let hover = LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h);
  pos = this.last_click_position;
  let clicked = pos && LiteGraph.isInsideRectangle(pos[0], pos[1], x, y, w, h);
  let was_clicked = clicked && !this.block_click;
  if (clicked && hold_click) this.blockClick();
  return was_clicked;
};

/**
 * draws some useful stats in the corner of the canvas
 * @method renderInfo
 **/
LGraphCanvas.prototype.renderInfo = function (ctx, x, y) {
  x = x || 10;
  y = y || this.canvas.height - 80;

  ctx.save();
  ctx.translate(x, y);

  ctx.font = "10px Arial";
  ctx.fillStyle = "#888";
  ctx.textAlign = "left";
  if (this.graph) {
    ctx.fillText("T: " + this.graph.globaltime.toFixed(2) + "s", 5, 13 * 1);
    ctx.fillText("I: " + this.graph.iteration, 5, 13 * 2);
    ctx.fillText("N: " + this.graph._nodes.length + " [" + this.visible_nodes.length + "]", 5, 13 * 3);
    ctx.fillText("V: " + this.graph._version, 5, 13 * 4);
    ctx.fillText("FPS:" + this.fps.toFixed(2), 5, 13 * 5);
  } else {
    ctx.fillText("No graph selected", 5, 13 * 1);
  }
  ctx.restore();
};

/**
 * draws the back canvas (the one containing the background and the connections)
 * @method drawBackCanvas
 **/
LGraphCanvas.prototype.drawBackCanvas = function () {
  let canvas = this.bgcanvas;
  if (canvas.width != this.canvas.width || canvas.height != this.canvas.height) {
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
  }

  if (!this.bgctx) {
    this.bgctx = this.bgcanvas.getContext("2d");
  }
  let ctx = this.bgctx;
  if (ctx.start) {
    ctx.start();
  }

  let viewport = this.viewport || [0, 0, ctx.canvas.width, ctx.canvas.height];

  //clear
  if (this.clear_background) {
    ctx.clearRect(viewport[0], viewport[1], viewport[2], viewport[3]);
  }

  //show subgraph stack header
  if (this._graph_stack && this._graph_stack.length) {
    ctx.save();
    let parent_graph = this._graph_stack[this._graph_stack.length - 1];
    let subgraph_node = this.graph._subgraph_node;
    ctx.strokeStyle = subgraph_node.bgcolor;
    ctx.lineWidth = 10;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    ctx.lineWidth = 1;
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = subgraph_node.bgcolor || "#AAA";
    let title = "";
    for (let i = 1; i < this._graph_stack.length; ++i) {
      title += this._graph_stack[i]._subgraph_node.getTitle() + " >> ";
    }
    ctx.fillText(title + subgraph_node.getTitle(), canvas.width * 0.5, 40);
    ctx.restore();
  }

  let bg_already_painted = false;
  if (this.onRenderBackground) {
    bg_already_painted = this.onRenderBackground(canvas, ctx);
  }

  //reset in case of error
  if (!this.viewport) {
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  this.visible_links.length = 0;

  if (this.graph) {
    //apply transformations
    ctx.save();
    this.ds.toCanvasContext(ctx);

    //render BG
    if (this.background_image && this.ds.scale > 0.5 && !bg_already_painted) {
      if (this.zoom_modify_alpha) {
        ctx.globalAlpha = (1.0 - 0.5 / this.ds.scale) * this.editor_alpha;
      } else {
        ctx.globalAlpha = this.editor_alpha;
      }
      ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled = false; // ctx.mozImageSmoothingEnabled =
      if (!this._bg_img || this._bg_img.name != this.background_image) {
        this._bg_img = new Image();
        this._bg_img.name = this.background_image;
        this._bg_img.src = this.background_image;
        let that = this;
        this._bg_img.onload = function () {
          that.draw(true, true);
        };
      }

      let pattern = null;
      if (this._pattern == null && this._bg_img.width > 0) {
        pattern = ctx.createPattern(this._bg_img, "repeat");
        this._pattern_img = this._bg_img;
        this._pattern = pattern;
      } else {
        pattern = this._pattern;
      }
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(this.visible_area[0], this.visible_area[1], this.visible_area[2], this.visible_area[3]);
        ctx.fillStyle = "transparent";
      }

      ctx.globalAlpha = 1.0;
      ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled = true; //= ctx.mozImageSmoothingEnabled
    }

    //groups
    if (this.graph._groups.length && !this.live_mode) {
      this.drawGroups(canvas, ctx);
    }

    if (this.onDrawBackground) {
      this.onDrawBackground(ctx, this.visible_area);
    }
    if (this.onBackgroundRender) {
      //LEGACY
      console.error("WARNING! onBackgroundRender deprecated, now is named onDrawBackground ");
      this.onBackgroundRender = null;
    }

    //DEBUG: show clipping area
    //ctx.fillStyle = "red";
    //ctx.fillRect( this.visible_area[0] + 10, this.visible_area[1] + 10, this.visible_area[2] - 20, this.visible_area[3] - 20);

    //bg
    if (this.render_canvas_border) {
      ctx.strokeStyle = "#235";
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    if (this.render_connections_shadows) {
      ctx.shadowColor = "#000";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 6;
    } else {
      ctx.shadowColor = "rgba(0,0,0,0)";
    }

    //draw connections
    if (!this.live_mode) {
      this.drawConnections(ctx);
    }

    ctx.shadowColor = "rgba(0,0,0,0)";

    //restore state
    ctx.restore();
  }

  if (ctx.finish) {
    ctx.finish();
  }

  this.dirty_bgcanvas = false;
  this.dirty_canvas = true; //to force to repaint the front canvas with the bgcanvas
};

/**
 * draws the given node inside the canvas
 * @method drawNode
 **/
LGraphCanvas.prototype.drawNode = function (node, ctx) {
  let glow = false;

  this.current_node = node;

  let color = node.color || node.constructor.color || LiteGraph.NODE_DEFAULT_COLOR;
  let bgcolor = node.bgcolor || node.constructor.bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR;
  let low_quality = this.ds.scale < 0.6; //zoomed out

  // shadow and glow
  if (node.mouseOver) {
    glow = true;
  }

  //only render if it forces it to do it
  if (this.live_mode) {
    if (!node.flags.collapsed) {
      ctx.shadowColor = "transparent";
      if (node.onDrawForeground) {
        node.onDrawForeground(ctx, this, this.canvas);
      }
    }
    return;
  }

  let editor_alpha = this.editor_alpha;
  ctx.globalAlpha = editor_alpha;

  if (this.render_shadows && !low_quality) {
    ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR;
    ctx.shadowOffsetX = 2 * this.ds.scale;
    ctx.shadowOffsetY = 2 * this.ds.scale;
    ctx.shadowBlur = 3 * this.ds.scale;
  } else {
    ctx.shadowColor = "transparent";
  }

  //custom draw collapsed method (draw after shadows because they are affected)
  if (node.flags.collapsed && node.onDrawCollapsed && node.onDrawCollapsed(ctx, this) == true) {
    return;
  }

  //clip if required (mask)
  let shape = node._shape || LiteGraph.BOX_SHAPE;
  let size = temp_size_vec2;
  temp_size_vec2.set(node.size);
  let horizontal = node.horizontal; // || node.flags.horizontal;

  if (node.flags.collapsed) {
    ctx.font = this.inner_text_font;
    let title = node.getTitle ? node.getTitle() : node.title;
    if (title != null) {
      node._collapsed_width = Math.min(node.size[0], ctx.measureText(title).width + LiteGraph.NODE_TITLE_HEIGHT * 2); //LiteGraph.NODE_COLLAPSED_WIDTH;
      size[0] = node._collapsed_width;
      size[1] = 0;
    }
  }

  if (node.clip_area) {
    //Start clipping
    ctx.save();
    ctx.beginPath();
    if (shape == LiteGraph.BOX_SHAPE) {
      ctx.rect(0, 0, size[0], size[1]);
    } else if (shape == LiteGraph.ROUND_SHAPE) {
      ctx.roundRect(0, 0, size[0], size[1], [10]);
    } else if (shape == LiteGraph.CIRCLE_SHAPE) {
      ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5, 0, Math.PI * 2);
    }
    ctx.clip();
  }

  //draw shape
  if (node.has_errors) {
    bgcolor = "red";
  }
  this.drawNodeShape(node, ctx, size, color, bgcolor, node.is_selected, node.mouseOver);
  ctx.shadowColor = "transparent";

  //draw foreground
  if (node.onDrawForeground) {
    node.onDrawForeground(ctx, this, this.canvas);
  }

  //connection slots
  ctx.textAlign = horizontal ? "center" : "left";
  ctx.font = this.inner_text_font;

  let render_text = !low_quality;

  let out_slot = this.connecting_output;
  let in_slot = this.connecting_input;
  ctx.lineWidth = 1;

  let max_y = 0;
  let slot_pos = new Float32Array(2); //to reuse

  //render inputs and outputs
  if (!node.flags.collapsed) {
    //input connection slots
    if (node.inputs) {
      for (let i = 0; i < node.inputs.length; i++) {
        let slot = node.inputs[i];

        let slot_type = slot.type;
        let slot_shape = slot.shape;

        ctx.globalAlpha = editor_alpha;
        //change opacity of incompatible slots when dragging a connection
        if (this.connecting_output && !LiteGraph.isValidConnection(slot.type, out_slot.type)) {
          ctx.globalAlpha = 0.4 * editor_alpha;
        }

        ctx.fillStyle =
          slot.link != null
            ? slot.color_on || this.default_connection_color_byType[slot_type] || this.default_connection_color.input_on
            : slot.color_off ||
              this.default_connection_color_byTypeOff[slot_type] ||
              this.default_connection_color_byType[slot_type] ||
              this.default_connection_color.input_off;

        let pos = node.getConnectionPos(true, i, slot_pos);
        pos[0] -= node.pos[0];
        pos[1] -= node.pos[1];
        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
          max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5;
        }

        ctx.beginPath();

        if (slot_type == "array") {
          slot_shape = LiteGraph.GRID_SHAPE; // place in addInput? addOutput instead?
        }

        let doStroke = true;

        if (slot.type === LiteGraph.EVENT || slot.shape === LiteGraph.BOX_SHAPE) {
          if (horizontal) {
            ctx.rect(pos[0] - 5 + 0.5, pos[1] - 8 + 0.5, 10, 14);
          } else {
            ctx.rect(pos[0] - 6 + 0.5, pos[1] - 5 + 0.5, 14, 10);
          }
        } else if (slot_shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(pos[0] + 8, pos[1] + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5);
          ctx.closePath();
        } else if (slot_shape === LiteGraph.GRID_SHAPE) {
          ctx.rect(pos[0] - 4, pos[1] - 4, 2, 2);
          ctx.rect(pos[0] - 1, pos[1] - 4, 2, 2);
          ctx.rect(pos[0] + 2, pos[1] - 4, 2, 2);
          ctx.rect(pos[0] - 4, pos[1] - 1, 2, 2);
          ctx.rect(pos[0] - 1, pos[1] - 1, 2, 2);
          ctx.rect(pos[0] + 2, pos[1] - 1, 2, 2);
          ctx.rect(pos[0] - 4, pos[1] + 2, 2, 2);
          ctx.rect(pos[0] - 1, pos[1] + 2, 2, 2);
          ctx.rect(pos[0] + 2, pos[1] + 2, 2, 2);
          doStroke = false;
        } else {
          if (low_quality) ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8); //faster
          else ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
        }
        ctx.fill();

        //render name
        if (render_text) {
          let text = slot.label != null ? slot.label : slot.name;
          if (text) {
            ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR;
            if (horizontal || slot.dir == LiteGraph.UP) {
              ctx.fillText(text, pos[0], pos[1] - 10);
            } else {
              ctx.fillText(text, pos[0] + 10, pos[1] + 5);
            }
          }
        }
      }
    }

    //output connection slots

    ctx.textAlign = horizontal ? "center" : "right";
    ctx.strokeStyle = "black";
    if (node.outputs) {
      for (let i = 0; i < node.outputs.length; i++) {
        let slot = node.outputs[i];

        let slot_type = slot.type;
        let slot_shape = slot.shape;

        //change opacity of incompatible slots when dragging a connection
        if (this.connecting_input && !LiteGraph.isValidConnection(slot_type, in_slot.type)) {
          ctx.globalAlpha = 0.4 * editor_alpha;
        }

        let pos = node.getConnectionPos(false, i, slot_pos);
        pos[0] -= node.pos[0];
        pos[1] -= node.pos[1];
        if (max_y < pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5) {
          max_y = pos[1] + LiteGraph.NODE_SLOT_HEIGHT * 0.5;
        }

        ctx.fillStyle =
          slot.links && slot.links.length
            ? slot.color_on ||
              this.default_connection_color_byType[slot_type] ||
              this.default_connection_color.output_on
            : slot.color_off ||
              this.default_connection_color_byTypeOff[slot_type] ||
              this.default_connection_color_byType[slot_type] ||
              this.default_connection_color.output_off;
        ctx.beginPath();
        //ctx.rect( node.size[0] - 14,i*14,10,10);

        if (slot_type == "array") {
          slot_shape = LiteGraph.GRID_SHAPE;
        }

        let doStroke = true;

        if (slot_type === LiteGraph.EVENT || slot_shape === LiteGraph.BOX_SHAPE) {
          if (horizontal) {
            ctx.rect(pos[0] - 5 + 0.5, pos[1] - 8 + 0.5, 10, 14);
          } else {
            ctx.rect(pos[0] - 6 + 0.5, pos[1] - 5 + 0.5, 14, 10);
          }
        } else if (slot_shape === LiteGraph.ARROW_SHAPE) {
          ctx.moveTo(pos[0] + 8, pos[1] + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] + 6 + 0.5);
          ctx.lineTo(pos[0] - 4, pos[1] - 6 + 0.5);
          ctx.closePath();
        } else if (slot_shape === LiteGraph.GRID_SHAPE) {
          ctx.rect(pos[0] - 4, pos[1] - 4, 2, 2);
          ctx.rect(pos[0] - 1, pos[1] - 4, 2, 2);
          ctx.rect(pos[0] + 2, pos[1] - 4, 2, 2);
          ctx.rect(pos[0] - 4, pos[1] - 1, 2, 2);
          ctx.rect(pos[0] - 1, pos[1] - 1, 2, 2);
          ctx.rect(pos[0] + 2, pos[1] - 1, 2, 2);
          ctx.rect(pos[0] - 4, pos[1] + 2, 2, 2);
          ctx.rect(pos[0] - 1, pos[1] + 2, 2, 2);
          ctx.rect(pos[0] + 2, pos[1] + 2, 2, 2);
          doStroke = false;
        } else {
          if (low_quality) ctx.rect(pos[0] - 4, pos[1] - 4, 8, 8);
          else ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
        }

        //trigger
        //if(slot.node_id != null && slot.slot == -1)
        //	ctx.fillStyle = "#F85";

        //if(slot.links != null && slot.links.length)
        ctx.fill();
        if (!low_quality && doStroke) ctx.stroke();

        //render output name
        if (render_text) {
          let text = slot.label != null ? slot.label : slot.name;
          if (text) {
            ctx.fillStyle = LiteGraph.NODE_TEXT_COLOR;
            if (horizontal || slot.dir == LiteGraph.DOWN) {
              ctx.fillText(text, pos[0], pos[1] - 8);
            } else {
              ctx.fillText(text, pos[0] - 10, pos[1] + 5);
            }
          }
        }
      }
    }

    ctx.textAlign = "left";
    ctx.globalAlpha = 1;

    if (node.widgets) {
      let widgets_y = max_y;
      if (horizontal || node.widgets_up) {
        widgets_y = 2;
      }
      if (node.widgets_start_y != null) widgets_y = node.widgets_start_y;
      this.drawNodeWidgets(
        node,
        widgets_y,
        ctx,
        this.node_widget && this.node_widget[0] == node ? this.node_widget[1] : null
      );
    }
  } else if (this.render_collapsed_slots) {
    //if collapsed
    let input_slot = null;
    let output_slot = null;

    //get first connected slot to render
    if (node.inputs) {
      for (let i = 0; i < node.inputs.length; i++) {
        let slot = node.inputs[i];
        if (slot.link == null) {
          continue;
        }
        input_slot = slot;
        break;
      }
    }
    if (node.outputs) {
      for (let i = 0; i < node.outputs.length; i++) {
        let slot = node.outputs[i];
        if (!slot.links || !slot.links.length) {
          continue;
        }
        output_slot = slot;
      }
    }

    if (input_slot) {
      let x = 0;
      let y = LiteGraph.NODE_TITLE_HEIGHT * -0.5; //center
      if (horizontal) {
        x = node._collapsed_width * 0.5;
        y = -LiteGraph.NODE_TITLE_HEIGHT;
      }
      ctx.fillStyle = "#686";
      ctx.beginPath();
      if (slot.type === LiteGraph.EVENT || slot.shape === LiteGraph.BOX_SHAPE) {
        ctx.rect(x - 7 + 0.5, y - 4, 14, 8);
      } else if (slot.shape === LiteGraph.ARROW_SHAPE) {
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x + -4, y - 4);
        ctx.lineTo(x + -4, y + 4);
        ctx.closePath();
      } else {
        ctx.arc(x, y, 4, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    if (output_slot) {
      let x = node._collapsed_width;
      let y = LiteGraph.NODE_TITLE_HEIGHT * -0.5; //center
      if (horizontal) {
        x = node._collapsed_width * 0.5;
        y = 0;
      }
      ctx.fillStyle = "#686";
      ctx.strokeStyle = "black";
      ctx.beginPath();
      if (output_slot.type === LiteGraph.EVENT || output_slot.shape === LiteGraph.BOX_SHAPE) {
        ctx.rect(x - 7 + 0.5, y - 4, 14, 8);
      } else if (output_slot.shape === LiteGraph.ARROW_SHAPE) {
        ctx.moveTo(x + 6, y);
        ctx.lineTo(x - 6, y - 4);
        ctx.lineTo(x - 6, y + 4);
        ctx.closePath();
      } else {
        ctx.arc(x, y, 4, 0, Math.PI * 2);
      }
      ctx.fill();
      //ctx.stroke();
    }
  }

  if (node.clip_area) {
    ctx.restore();
  }

  ctx.globalAlpha = 1.0;
};

//used by this.over_link_center
LGraphCanvas.prototype.drawLinkTooltip = function (ctx, link) {
  let pos = link._pos;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(pos[0], pos[1], 3, 0, Math.PI * 2);
  ctx.fill();

  if (link.data == null) return;

  if (this.onDrawLinkTooltip) if (this.onDrawLinkTooltip(ctx, link, this) == true) return;

  let data = link.data;
  let text = null;

  if (data.constructor === Number) text = data.toFixed(2);
  else if (data.constructor === String) text = '"' + data + '"';
  else if (data.constructor === Boolean) text = String(data);
  else if (data.toToolTip) text = data.toToolTip();
  else text = "[" + data.constructor.name + "]";

  if (text == null) return;
  text = text.substr(0, 30); //avoid weird

  ctx.font = "14px Courier New";
  let info = ctx.measureText(text);
  let w = info.width + 20;
  let h = 24;
  ctx.shadowColor = "black";
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 3;
  ctx.fillStyle = "#454";
  ctx.beginPath();
  ctx.roundRect(pos[0] - w * 0.5, pos[1] - 15 - h, w, h, [3]);
  ctx.moveTo(pos[0] - 10, pos[1] - 15);
  ctx.lineTo(pos[0] + 10, pos[1] - 15);
  ctx.lineTo(pos[0], pos[1] - 5);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.textAlign = "center";
  ctx.fillStyle = "#CEC";
  ctx.fillText(text, pos[0], pos[1] - 15 - h * 0.3);
};

/**
 * draws the shape of the given node in the canvas
 * @method drawNodeShape
 **/

LGraphCanvas.prototype.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, selected, mouse_over) {
  //bg rect
  ctx.strokeStyle = fgcolor;
  ctx.fillStyle = bgcolor;

  let title_height = LiteGraph.NODE_TITLE_HEIGHT;
  let low_quality = this.ds.scale < 0.5;

  //render node area depending on shape
  let shape = node._shape || node.constructor.shape || LiteGraph.ROUND_SHAPE;

  let title_mode = node.constructor.title_mode;

  let render_title = true;
  if (title_mode == LiteGraph.TRANSPARENT_TITLE || title_mode == LiteGraph.NO_TITLE) {
    render_title = false;
  } else if (title_mode == LiteGraph.AUTOHIDE_TITLE && mouse_over) {
    render_title = true;
  }

  let area = temp_area_vec4;
  area[0] = 0; //x
  area[1] = render_title ? -title_height : 0; //y
  area[2] = size[0] + 1; //w
  area[3] = render_title ? size[1] + title_height : size[1]; //h

  let old_alpha = ctx.globalAlpha;

  //full node shape
  //if(node.flags.collapsed)
  {
    ctx.beginPath();
    if (shape == LiteGraph.BOX_SHAPE || low_quality) {
      ctx.fillRect(area[0], area[1], area[2], area[3]);
    } else if (shape == LiteGraph.ROUND_SHAPE || shape == LiteGraph.CARD_SHAPE) {
      ctx.roundRect(
        area[0],
        area[1],
        area[2],
        area[3],
        shape == LiteGraph.CARD_SHAPE ? [this.round_radius, this.round_radius, 0, 0] : [this.round_radius]
      );
    } else if (shape == LiteGraph.CIRCLE_SHAPE) {
      ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5, 0, Math.PI * 2);
    }
    ctx.fill();

    //separator
    if (!node.flags.collapsed && render_title) {
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, -1, area[2], 2);
    }
  }
  ctx.shadowColor = "transparent";

  if (node.onDrawBackground) {
    node.onDrawBackground(ctx, this, this.canvas, this.graph_mouse);
  }

  //title bg (remember, it is rendered ABOVE the node)
  if (render_title || title_mode == LiteGraph.TRANSPARENT_TITLE) {
    //title bar
    if (node.onDrawTitleBar) {
      node.onDrawTitleBar(ctx, title_height, size, this.ds.scale, fgcolor);
    } else if (
      title_mode != LiteGraph.TRANSPARENT_TITLE &&
      (node.constructor.title_color || this.render_title_colored)
    ) {
      let title_color = node.constructor.title_color || fgcolor;

      if (node.flags.collapsed) {
        ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR;
      }

      //* gradient test
      if (this.use_gradients) {
        let grad = LGraphCanvas.gradients[title_color];
        if (!grad) {
          grad = LGraphCanvas.gradients[title_color] = ctx.createLinearGradient(0, 0, 400, 0);
          grad.addColorStop(0, title_color); // TODO refactor: validate color !! prevent DOMException
          grad.addColorStop(1, "#000");
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = title_color;
      }

      //ctx.globalAlpha = 0.5 * old_alpha;
      ctx.beginPath();
      if (shape == LiteGraph.BOX_SHAPE || low_quality) {
        ctx.rect(0, -title_height, size[0] + 1, title_height);
      } else if (shape == LiteGraph.ROUND_SHAPE || shape == LiteGraph.CARD_SHAPE) {
        ctx.roundRect(
          0,
          -title_height,
          size[0] + 1,
          title_height,
          node.flags.collapsed ? [this.round_radius] : [this.round_radius, this.round_radius, 0, 0]
        );
      }
      ctx.fill();
      ctx.shadowColor = "transparent";
    }

    let colState = false;
    if (LiteGraph.node_box_coloured_by_mode) {
      if (LiteGraph.NODE_MODES_COLORS[node.mode]) {
        colState = LiteGraph.NODE_MODES_COLORS[node.mode];
      }
    }
    if (LiteGraph.node_box_coloured_when_on) {
      colState = node.action_triggered ? "#FFF" : node.execute_triggered ? "#AAA" : colState;
    }

    //title box
    let box_size = 10;
    if (node.onDrawTitleBox) {
      node.onDrawTitleBox(ctx, title_height, size, this.ds.scale);
    } else if (shape == LiteGraph.ROUND_SHAPE || shape == LiteGraph.CIRCLE_SHAPE || shape == LiteGraph.CARD_SHAPE) {
      if (low_quality) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(title_height * 0.5, title_height * -0.5, box_size * 0.5 + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = node.boxcolor || colState || LiteGraph.NODE_DEFAULT_BOXCOLOR;
      if (low_quality)
        ctx.fillRect(title_height * 0.5 - box_size * 0.5, title_height * -0.5 - box_size * 0.5, box_size, box_size);
      else {
        ctx.beginPath();
        ctx.arc(title_height * 0.5, title_height * -0.5, box_size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      if (low_quality) {
        ctx.fillStyle = "black";
        ctx.fillRect(
          (title_height - box_size) * 0.5 - 1,
          (title_height + box_size) * -0.5 - 1,
          box_size + 2,
          box_size + 2
        );
      }
      ctx.fillStyle = node.boxcolor || colState || LiteGraph.NODE_DEFAULT_BOXCOLOR;
      ctx.fillRect((title_height - box_size) * 0.5, (title_height + box_size) * -0.5, box_size, box_size);
    }
    ctx.globalAlpha = old_alpha;

    //title text
    if (node.onDrawTitleText) {
      node.onDrawTitleText(ctx, title_height, size, this.ds.scale, this.title_text_font, selected);
    }
    if (!low_quality) {
      ctx.font = this.title_text_font;
      let title = String(node.getTitle());
      if (title) {
        if (selected) {
          ctx.fillStyle = LiteGraph.NODE_SELECTED_TITLE_COLOR;
        } else {
          ctx.fillStyle = node.constructor.title_text_color || this.node_title_color;
        }
        if (node.flags.collapsed) {
          ctx.textAlign = "left";
          let measure = ctx.measureText(title);
          ctx.fillText(
            title.substr(0, 20), //avoid urls too long
            title_height, // + measure.width * 0.5,
            LiteGraph.NODE_TITLE_TEXT_Y - title_height
          );
          ctx.textAlign = "left";
        } else {
          ctx.textAlign = "left";
          ctx.fillText(title, title_height, LiteGraph.NODE_TITLE_TEXT_Y - title_height);
        }
      }
    }

    //subgraph box
    if (!node.flags.collapsed && node.subgraph && !node.skip_subgraph_button) {
      let w = LiteGraph.NODE_TITLE_HEIGHT;
      let x = node.size[0] - w;
      let over = LiteGraph.isInsideRectangle(
        this.graph_mouse[0] - node.pos[0],
        this.graph_mouse[1] - node.pos[1],
        x + 2,
        -w + 2,
        w - 4,
        w - 4
      );
      ctx.fillStyle = over ? "#888" : "#555";
      if (shape == LiteGraph.BOX_SHAPE || low_quality) ctx.fillRect(x + 2, -w + 2, w - 4, w - 4);
      else {
        ctx.beginPath();
        ctx.roundRect(x + 2, -w + 2, w - 4, w - 4, [4]);
        ctx.fill();
      }
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.2, -w * 0.6);
      ctx.lineTo(x + w * 0.8, -w * 0.6);
      ctx.lineTo(x + w * 0.5, -w * 0.3);
      ctx.fill();
    }

    //custom title render
    if (node.onDrawTitle) {
      node.onDrawTitle(ctx);
    }
  }

  //render selection marker
  if (selected) {
    if (node.onBounding) {
      node.onBounding(area);
    }

    if (title_mode == LiteGraph.TRANSPARENT_TITLE) {
      area[1] -= title_height;
      area[3] += title_height;
    }
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    if (shape == LiteGraph.BOX_SHAPE) {
      ctx.rect(-6 + area[0], -6 + area[1], 12 + area[2], 12 + area[3]);
    } else if (shape == LiteGraph.ROUND_SHAPE || (shape == LiteGraph.CARD_SHAPE && node.flags.collapsed)) {
      ctx.roundRect(-6 + area[0], -6 + area[1], 12 + area[2], 12 + area[3], [this.round_radius * 2]);
    } else if (shape == LiteGraph.CARD_SHAPE) {
      ctx.roundRect(-6 + area[0], -6 + area[1], 12 + area[2], 12 + area[3], [
        this.round_radius * 2,
        2,
        this.round_radius * 2,
        2
      ]);
    } else if (shape == LiteGraph.CIRCLE_SHAPE) {
      ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5 + 6, 0, Math.PI * 2);
    }
    ctx.strokeStyle = LiteGraph.NODE_BOX_OUTLINE_COLOR;
    ctx.stroke();
    ctx.strokeStyle = fgcolor;
    ctx.globalAlpha = 1;
  }

  // these counter helps in conditioning drawing based on if the node has been executed or an action occurred
  if (node.execute_triggered > 0) node.execute_triggered--;
  if (node.action_triggered > 0) node.action_triggered--;
};

/**
 * draws every connection visible in the canvas
 * OPTIMIZE THIS: pre-catch connections position instead of recomputing them every time
 * @method drawConnections
 **/

LGraphCanvas.prototype.drawConnections = function (ctx) {
  let now = LiteGraph.getTime();
  let visible_area = this.visible_area;
  temp_margin_vec4[0] = visible_area[0] - 20;
  temp_margin_vec4[1] = visible_area[1] - 20;
  temp_margin_vec4[2] = visible_area[2] + 40;
  temp_margin_vec4[3] = visible_area[3] + 40;

  //draw connections
  ctx.lineWidth = this.connections_width;

  ctx.fillStyle = "#AAA";
  ctx.strokeStyle = "#AAA";
  ctx.globalAlpha = this.editor_alpha;
  //for every node
  let nodes = this.graph._nodes;
  for (let n = 0, l = nodes.length; n < l; ++n) {
    let node = nodes[n];
    //for every input (we render just inputs because it is easier as every slot can only have one input)
    if (!node.inputs || !node.inputs.length) {
      continue;
    }

    for (let i = 0; i < node.inputs.length; ++i) {
      let input = node.inputs[i];
      if (!input || input.link == null) {
        continue;
      }
      let link_id = input.link;
      let link = this.graph.links[link_id];
      if (!link) {
        continue;
      }

      //find link info
      let start_node = this.graph.getNodeById(link.origin_id);
      if (start_node == null) {
        continue;
      }
      let start_node_slot = link.origin_slot;
      let start_node_slotpos = null;
      if (start_node_slot == -1) {
        start_node_slotpos = [start_node.pos[0] + 10, start_node.pos[1] + 10];
      } else {
        start_node_slotpos = start_node.getConnectionPos(false, start_node_slot, temp_slot_a_vec2);
      }
      let end_node_slotpos = node.getConnectionPos(true, i, temp_slot_b_vec2);

      //compute link bounding
      link_bounding_vec4[0] = start_node_slotpos[0];
      link_bounding_vec4[1] = start_node_slotpos[1];
      link_bounding_vec4[2] = end_node_slotpos[0] - start_node_slotpos[0];
      link_bounding_vec4[3] = end_node_slotpos[1] - start_node_slotpos[1];
      if (link_bounding_vec4[2] < 0) {
        link_bounding_vec4[0] += link_bounding_vec4[2];
        link_bounding_vec4[2] = Math.abs(link_bounding_vec4[2]);
      }
      if (link_bounding_vec4[3] < 0) {
        link_bounding_vec4[1] += link_bounding_vec4[3];
        link_bounding_vec4[3] = Math.abs(link_bounding_vec4[3]);
      }

      //skip links outside of the visible area of the canvas
      if (!overlapBounding(link_bounding_vec4, temp_margin_vec4)) {
        continue;
      }

      let start_slot = start_node.outputs[start_node_slot];
      let end_slot = node.inputs[i];
      if (!start_slot || !end_slot) {
        continue;
      }
      let start_dir = start_slot.dir || (start_node.horizontal ? LiteGraph.DOWN : LiteGraph.RIGHT);
      let end_dir = end_slot.dir || (node.horizontal ? LiteGraph.UP : LiteGraph.LEFT);

      this.renderLink(ctx, start_node_slotpos, end_node_slotpos, link, false, 0, null, start_dir, end_dir);

      //event triggered rendered on top
      if (link && link._last_time && now - link._last_time < 1000) {
        let f = 2.0 - (now - link._last_time) * 0.002;
        let tmp = ctx.globalAlpha;
        ctx.globalAlpha = tmp * f;
        this.renderLink(ctx, start_node_slotpos, end_node_slotpos, link, true, f, "white", start_dir, end_dir);
        ctx.globalAlpha = tmp;
      }
    }
  }
  ctx.globalAlpha = 1;
};

/**
 * draws a link between two points
 * @method renderLink
 * @param {vec2} a start pos
 * @param {vec2} b end pos
 * @param {Object} link the link object with all the link info
 * @param {boolean} skip_border ignore the shadow of the link
 * @param {boolean} flow show flow animation (for events)
 * @param {string} color the color for the link
 * @param {number} start_dir the direction enum
 * @param {number} end_dir the direction enum
 * @param {number} num_sublines number of sublines (useful to represent vec3 or rgb)
 **/
LGraphCanvas.prototype.renderLink = function (
  ctx,
  a,
  b,
  link,
  skip_border,
  flow,
  color,
  start_dir,
  end_dir,
  num_sublines
) {
  if (link) {
    this.visible_links.push(link);
  }

  //choose color
  if (!color && link) {
    color = link.color || LGraphCanvas.link_type_colors[link.type];
  }
  if (!color) {
    color = this.default_link_color;
  }
  if (link != null && this.highlighted_links[link.id]) {
    color = "#FFF";
  }

  start_dir = start_dir || LiteGraph.RIGHT;
  end_dir = end_dir || LiteGraph.LEFT;

  let dist = distance(a, b);

  if (this.render_connections_border && this.ds.scale > 0.6) {
    ctx.lineWidth = this.connections_width + 4;
  }
  ctx.lineJoin = "round";
  num_sublines = num_sublines || 1;
  if (num_sublines > 1) {
    ctx.lineWidth = 0.5;
  }

  //begin line shape
  ctx.beginPath();
  for (let i = 0; i < num_sublines; i += 1) {
    let offsety = (i - (num_sublines - 1) * 0.5) * 5;

    if (this.links_render_mode == LiteGraph.SPLINE_LINK) {
      ctx.moveTo(a[0], a[1] + offsety);
      let start_offset_x = 0;
      let start_offset_y = 0;
      let end_offset_x = 0;
      let end_offset_y = 0;
      switch (start_dir) {
        case LiteGraph.LEFT:
          start_offset_x = dist * -0.25;
          break;
        case LiteGraph.RIGHT:
          start_offset_x = dist * 0.25;
          break;
        case LiteGraph.UP:
          start_offset_y = dist * -0.25;
          break;
        case LiteGraph.DOWN:
          start_offset_y = dist * 0.25;
          break;
      }
      switch (end_dir) {
        case LiteGraph.LEFT:
          end_offset_x = dist * -0.25;
          break;
        case LiteGraph.RIGHT:
          end_offset_x = dist * 0.25;
          break;
        case LiteGraph.UP:
          end_offset_y = dist * -0.25;
          break;
        case LiteGraph.DOWN:
          end_offset_y = dist * 0.25;
          break;
      }
      ctx.bezierCurveTo(
        a[0] + start_offset_x,
        a[1] + start_offset_y + offsety,
        b[0] + end_offset_x,
        b[1] + end_offset_y + offsety,
        b[0],
        b[1] + offsety
      );
    } else if (this.links_render_mode == LiteGraph.LINEAR_LINK) {
      ctx.moveTo(a[0], a[1] + offsety);
      let start_offset_x = 0;
      let start_offset_y = 0;
      let end_offset_x = 0;
      let end_offset_y = 0;
      switch (start_dir) {
        case LiteGraph.LEFT:
          start_offset_x = -1;
          break;
        case LiteGraph.RIGHT:
          start_offset_x = 1;
          break;
        case LiteGraph.UP:
          start_offset_y = -1;
          break;
        case LiteGraph.DOWN:
          start_offset_y = 1;
          break;
      }
      switch (end_dir) {
        case LiteGraph.LEFT:
          end_offset_x = -1;
          break;
        case LiteGraph.RIGHT:
          end_offset_x = 1;
          break;
        case LiteGraph.UP:
          end_offset_y = -1;
          break;
        case LiteGraph.DOWN:
          end_offset_y = 1;
          break;
      }
      let l = 15;
      ctx.lineTo(a[0] + start_offset_x * l, a[1] + start_offset_y * l + offsety);
      ctx.lineTo(b[0] + end_offset_x * l, b[1] + end_offset_y * l + offsety);
      ctx.lineTo(b[0], b[1] + offsety);
    } else if (this.links_render_mode == LiteGraph.STRAIGHT_LINK) {
      ctx.moveTo(a[0], a[1]);
      let start_x = a[0];
      let start_y = a[1];
      let end_x = b[0];
      let end_y = b[1];
      if (start_dir == LiteGraph.RIGHT) {
        start_x += 10;
      } else {
        start_y += 10;
      }
      if (end_dir == LiteGraph.LEFT) {
        end_x -= 10;
      } else {
        end_y -= 10;
      }
      ctx.lineTo(start_x, start_y);
      ctx.lineTo((start_x + end_x) * 0.5, start_y);
      ctx.lineTo((start_x + end_x) * 0.5, end_y);
      ctx.lineTo(end_x, end_y);
      ctx.lineTo(b[0], b[1]);
    } else {
      return;
    } //unknown
  }

  //rendering the outline of the connection can be a little bit slow
  if (this.render_connections_border && this.ds.scale > 0.6 && !skip_border) {
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.stroke();
  }

  ctx.lineWidth = this.connections_width;
  ctx.fillStyle = ctx.strokeStyle = color;
  ctx.stroke();
  //end line shape

  let pos = this.computeConnectionPoint(a, b, 0.5, start_dir, end_dir);
  if (link && link._pos) {
    link._pos[0] = pos[0];
    link._pos[1] = pos[1];
  }

  //render arrow in the middle
  if (this.ds.scale >= 0.6 && this.highquality_render && end_dir != LiteGraph.CENTER) {
    //render arrow
    if (this.render_connection_arrows) {
      //compute two points in the connection
      let posA = this.computeConnectionPoint(a, b, 0.25, start_dir, end_dir);
      let posB = this.computeConnectionPoint(a, b, 0.26, start_dir, end_dir);
      let posC = this.computeConnectionPoint(a, b, 0.75, start_dir, end_dir);
      let posD = this.computeConnectionPoint(a, b, 0.76, start_dir, end_dir);

      //compute the angle between them so the arrow points in the right direction
      let angleA = 0;
      let angleB = 0;
      if (this.render_curved_connections) {
        angleA = -Math.atan2(posB[0] - posA[0], posB[1] - posA[1]);
        angleB = -Math.atan2(posD[0] - posC[0], posD[1] - posC[1]);
      } else {
        angleB = angleA = b[1] > a[1] ? 0 : Math.PI;
      }

      //render arrow
      ctx.save();
      ctx.translate(posA[0], posA[1]);
      ctx.rotate(angleA);
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(0, +7);
      ctx.lineTo(+5, -3);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(posC[0], posC[1]);
      ctx.rotate(angleB);
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(0, +7);
      ctx.lineTo(+5, -3);
      ctx.fill();
      ctx.restore();
    }

    //circle
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
    ctx.fill();
  }

  //render flowing points
  if (flow) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; ++i) {
      let f = (LiteGraph.getTime() * 0.001 + i * 0.2) % 1;
      let pos = this.computeConnectionPoint(a, b, f, start_dir, end_dir);
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
};

//returns the link center point based on curvature
LGraphCanvas.prototype.computeConnectionPoint = function (a, b, t, start_dir, end_dir) {
  start_dir = start_dir || LiteGraph.RIGHT;
  end_dir = end_dir || LiteGraph.LEFT;

  let dist = distance(a, b);
  let p0 = a;
  let p1 = [a[0], a[1]];
  let p2 = [b[0], b[1]];
  let p3 = b;

  switch (start_dir) {
    case LiteGraph.LEFT:
      p1[0] += dist * -0.25;
      break;
    case LiteGraph.RIGHT:
      p1[0] += dist * 0.25;
      break;
    case LiteGraph.UP:
      p1[1] += dist * -0.25;
      break;
    case LiteGraph.DOWN:
      p1[1] += dist * 0.25;
      break;
  }
  switch (end_dir) {
    case LiteGraph.LEFT:
      p2[0] += dist * -0.25;
      break;
    case LiteGraph.RIGHT:
      p2[0] += dist * 0.25;
      break;
    case LiteGraph.UP:
      p2[1] += dist * -0.25;
      break;
    case LiteGraph.DOWN:
      p2[1] += dist * 0.25;
      break;
  }

  let c1 = (1 - t) * (1 - t) * (1 - t);
  let c2 = 3 * ((1 - t) * (1 - t)) * t;
  let c3 = 3 * (1 - t) * (t * t);
  let c4 = t * t * t;

  let x = c1 * p0[0] + c2 * p1[0] + c3 * p2[0] + c4 * p3[0];
  let y = c1 * p0[1] + c2 * p1[1] + c3 * p2[1] + c4 * p3[1];
  return [x, y];
};

LGraphCanvas.prototype.drawExecutionOrder = function (ctx) {
  ctx.shadowColor = "transparent";
  ctx.globalAlpha = 0.25;

  ctx.textAlign = "center";
  ctx.strokeStyle = "white";
  ctx.globalAlpha = 0.75;

  let visible_nodes = this.visible_nodes;
  for (let i = 0; i < visible_nodes.length; ++i) {
    let node = visible_nodes[i];
    ctx.fillStyle = "black";
    ctx.fillRect(
      node.pos[0] - LiteGraph.NODE_TITLE_HEIGHT,
      node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT,
      LiteGraph.NODE_TITLE_HEIGHT,
      LiteGraph.NODE_TITLE_HEIGHT
    );
    if (node.order == 0) {
      ctx.strokeRect(
        node.pos[0] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
        node.pos[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5,
        LiteGraph.NODE_TITLE_HEIGHT,
        LiteGraph.NODE_TITLE_HEIGHT
      );
    }
    ctx.fillStyle = "#FFF";
    ctx.fillText(node.order, node.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * -0.5, node.pos[1] - 6);
  }
  ctx.globalAlpha = 1;
};

/**
 * draws the widgets stored inside a node
 * @method drawNodeWidgets
 **/
LGraphCanvas.prototype.drawNodeWidgets = function (node, posY, ctx, active_widget) {
  if (!node.widgets || !node.widgets.length) {
    return 0;
  }
  let width = node.size[0];
  let widgets = node.widgets;
  posY += 2;
  let H = LiteGraph.NODE_WIDGET_HEIGHT;
  let show_text = this.ds.scale > 0.5;
  ctx.save();
  ctx.globalAlpha = this.editor_alpha;
  let outline_color = LiteGraph.WIDGET_OUTLINE_COLOR;
  let background_color = LiteGraph.WIDGET_BGCOLOR;
  let text_color = LiteGraph.WIDGET_TEXT_COLOR;
  let secondary_text_color = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR;
  let margin = 15;

  for (let i = 0; i < widgets.length; ++i) {
    let w = widgets[i];
    let y = posY;
    if (w.y) {
      y = w.y;
    }
    w.last_y = y;
    ctx.strokeStyle = outline_color;
    ctx.fillStyle = "#222";
    ctx.textAlign = "left";
    //ctx.lineWidth = 2;
    if (w.disabled) ctx.globalAlpha *= 0.5;
    let widget_width = w.width || width;

    switch (w.type) {
      case "button":
        if (w.clicked) {
          ctx.fillStyle = "#AAA";
          w.clicked = false;
          this.dirty_canvas = true;
        }
        ctx.fillRect(margin, y, widget_width - margin * 2, H);
        if (show_text && !w.disabled) ctx.strokeRect(margin, y, widget_width - margin * 2, H);
        if (show_text) {
          ctx.textAlign = "center";
          ctx.fillStyle = text_color;
          ctx.fillText(w.name, widget_width * 0.5, y + H * 0.7);
        }
        break;
      case "toggle":
        ctx.textAlign = "left";
        ctx.strokeStyle = outline_color;
        ctx.fillStyle = background_color;
        ctx.beginPath();
        if (show_text) ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);
        else ctx.rect(margin, y, widget_width - margin * 2, H);
        ctx.fill();
        if (show_text && !w.disabled) ctx.stroke();
        ctx.fillStyle = w.value ? "#89A" : "#333";
        ctx.beginPath();
        ctx.arc(widget_width - margin * 2, y + H * 0.5, H * 0.36, 0, Math.PI * 2);
        ctx.fill();
        if (show_text) {
          ctx.fillStyle = secondary_text_color;
          if (w.name != null) {
            ctx.fillText(w.name, margin * 2, y + H * 0.7);
          }
          ctx.fillStyle = w.value ? text_color : secondary_text_color;
          ctx.textAlign = "right";
          ctx.fillText(w.value ? w.options.on || "true" : w.options.off || "false", widget_width - 40, y + H * 0.7);
        }
        break;
      case "slider":
        ctx.fillStyle = background_color;
        ctx.fillRect(margin, y, widget_width - margin * 2, H);
        let range = w.options.max - w.options.min;
        let nvalue = (w.value - w.options.min) / range;
        ctx.fillStyle = active_widget == w ? "#89A" : "#678";
        ctx.fillRect(margin, y, nvalue * (widget_width - margin * 2), H);
        if (show_text && !w.disabled) ctx.strokeRect(margin, y, widget_width - margin * 2, H);
        if (w.marker) {
          let marker_nvalue = (w.marker - w.options.min) / range;
          ctx.fillStyle = "#AA9";
          ctx.fillRect(margin + marker_nvalue * (widget_width - margin * 2), y, 2, H);
        }
        if (show_text) {
          ctx.textAlign = "center";
          ctx.fillStyle = text_color;
          ctx.fillText(w.name + "  " + Number(w.value).toFixed(3), widget_width * 0.5, y + H * 0.7);
        }
        break;
      case "number":
      case "combo":
        ctx.textAlign = "left";
        ctx.strokeStyle = outline_color;
        ctx.fillStyle = background_color;
        ctx.beginPath();
        if (show_text) ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);
        else ctx.rect(margin, y, widget_width - margin * 2, H);
        ctx.fill();
        if (show_text) {
          if (!w.disabled) ctx.stroke();
          ctx.fillStyle = text_color;
          if (!w.disabled) {
            ctx.beginPath();
            ctx.moveTo(margin + 16, y + 5);
            ctx.lineTo(margin + 6, y + H * 0.5);
            ctx.lineTo(margin + 16, y + H - 5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(widget_width - margin - 16, y + 5);
            ctx.lineTo(widget_width - margin - 6, y + H * 0.5);
            ctx.lineTo(widget_width - margin - 16, y + H - 5);
            ctx.fill();
          }
          ctx.fillStyle = secondary_text_color;
          ctx.fillText(w.name, margin * 2 + 5, y + H * 0.7);
          ctx.fillStyle = text_color;
          ctx.textAlign = "right";
          if (w.type == "number") {
            ctx.fillText(
              Number(w.value).toFixed(w.options.precision !== undefined ? w.options.precision : 3),
              widget_width - margin * 2 - 20,
              y + H * 0.7
            );
          } else {
            let v = w.value;
            if (w.options.values) {
              let values = w.options.values;
              if (values.constructor === Function) values = values();
              if (values && values.constructor !== Array) v = values[w.value];
            }
            ctx.fillText(v, widget_width - margin * 2 - 20, y + H * 0.7);
          }
        }
        break;
      case "string":
      case "text":
        ctx.textAlign = "left";
        ctx.strokeStyle = outline_color;
        ctx.fillStyle = background_color;
        ctx.beginPath();
        if (show_text) ctx.roundRect(margin, y, widget_width - margin * 2, H, [H * 0.5]);
        else ctx.rect(margin, y, widget_width - margin * 2, H);
        ctx.fill();
        if (show_text) {
          if (!w.disabled) ctx.stroke();
          ctx.save();
          ctx.beginPath();
          ctx.rect(margin, y, widget_width - margin * 2, H);
          ctx.clip();

          //ctx.stroke();
          ctx.fillStyle = secondary_text_color;
          if (w.name != null) {
            ctx.fillText(w.name, margin * 2, y + H * 0.7);
          }
          ctx.fillStyle = text_color;
          ctx.textAlign = "right";
          ctx.fillText(String(w.value).substr(0, 30), widget_width - margin * 2, y + H * 0.7); //30 chars max
          ctx.restore();
        }
        break;
      default:
        if (w.draw) {
          w.draw(ctx, node, widget_width, y, H);
        }
        break;
    }
    posY += (w.computeSize ? w.computeSize(widget_width)[1] : H) + 4;
    ctx.globalAlpha = this.editor_alpha;
  }
  ctx.restore();
  ctx.textAlign = "left";
};

/**
 * process an event on widgets
 * @method processNodeWidgets
 **/
LGraphCanvas.prototype.processNodeWidgets = function (node, pos, event, active_widget) {
  if (!node.widgets || !node.widgets.length) {
    return null;
  }

  let x = pos[0] - node.pos[0];
  let y = pos[1] - node.pos[1];
  let width = node.size[0];
  let that = this;
  let ref_window = this.getCanvasWindow();

  for (let i = 0; i < node.widgets.length; ++i) {
    let w = node.widgets[i];
    if (!w || w.disabled) continue;
    let widget_height = w.computeSize ? w.computeSize(width)[1] : LiteGraph.NODE_WIDGET_HEIGHT;
    let widget_width = w.width || width;
    //outside
    if (
      w != active_widget &&
      (x < 6 || x > widget_width - 12 || y < w.last_y || y > w.last_y + widget_height || w.last_y === undefined)
    )
      continue;

    let old_value = w.value;

    //if ( w == active_widget || (x > 6 && x < widget_width - 12 && y > w.last_y && y < w.last_y + widget_height) ) {
    //inside widget
    switch (w.type) {
      case "button":
        if (event.type === LiteGraph.pointerevents_method + "down") {
          if (w.callback) {
            setTimeout(function () {
              w.callback(w, that, node, pos, event);
            }, 20);
          }
          w.clicked = true;
          this.dirty_canvas = true;
        }
        break;
      case "slider":
        let range = w.options.max - w.options.min;
        let nvalue = Math.clamp((x - 15) / (widget_width - 30), 0, 1);
        w.value = w.options.min + (w.options.max - w.options.min) * nvalue;
        if (w.callback) {
          setTimeout(function () {
            inner_value_change(w, w.value);
          }, 20);
        }
        this.dirty_canvas = true;
        break;
      case "number":
      case "combo":
        let old_value = w.value;
        if (event.type == LiteGraph.pointerevents_method + "move" && w.type == "number") {
          w.value += event.deltaX * 0.1 * (w.options.step || 1);
          if (w.options.min != null && w.value < w.options.min) {
            w.value = w.options.min;
          }
          if (w.options.max != null && w.value > w.options.max) {
            w.value = w.options.max;
          }
        } else if (event.type == LiteGraph.pointerevents_method + "down") {
          let values = w.options.values;
          if (values && values.constructor === Function) {
            values = w.options.values(w, node);
          }
          let values_list = null;

          if (w.type != "number") values_list = values.constructor === Array ? values : Object.keys(values);

          let delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
          if (w.type == "number") {
            w.value += delta * 0.1 * (w.options.step || 1);
            if (w.options.min != null && w.value < w.options.min) {
              w.value = w.options.min;
            }
            if (w.options.max != null && w.value > w.options.max) {
              w.value = w.options.max;
            }
          } else if (delta) {
            //clicked in arrow, used for combos
            let index = -1;
            this.last_mouseclick = 0; //avoids dobl click event
            if (values.constructor === Object) index = values_list.indexOf(String(w.value)) + delta;
            else index = values_list.indexOf(w.value) + delta;
            if (index >= values_list.length) {
              index = values_list.length - 1;
            }
            if (index < 0) {
              index = 0;
            }
            if (values.constructor === Array) w.value = values[index];
            else w.value = index;
          } else {
            //combo clicked
            let text_values = values != values_list ? Object.values(values) : values;
            let menu = new LiteGraph.ContextMenu(
              text_values,
              {
                scale: Math.max(1, this.ds.scale),
                event: event,
                className: "dark",
                callback: inner_clicked.bind(w)
              },
              ref_window
            );
            function inner_clicked(v, option, event) {
              if (values != values_list) v = text_values.indexOf(v);
              this.value = v;
              inner_value_change(this, v);
              that.dirty_canvas = true;
              return false;
            }
          }
        } //end mousedown
        else if (event.type == LiteGraph.pointerevents_method + "up" && w.type == "number") {
          let delta = x < 40 ? -1 : x > widget_width - 40 ? 1 : 0;
          if (event.click_time < 200 && delta == 0) {
            this.prompt(
              "Value",
              w.value,
              function (v) {
                this.value = Number(v);
                inner_value_change(this, this.value);
              }.bind(w),
              event
            );
          }
        }

        if (old_value != w.value)
          setTimeout(
            function () {
              inner_value_change(this, this.value);
            }.bind(w),
            20
          );
        this.dirty_canvas = true;
        break;
      case "toggle":
        if (event.type == LiteGraph.pointerevents_method + "down") {
          w.value = !w.value;
          setTimeout(function () {
            inner_value_change(w, w.value);
          }, 20);
        }
        break;
      case "string":
      case "text":
        if (event.type == LiteGraph.pointerevents_method + "down") {
          this.prompt(
            "Value",
            w.value,
            function (v) {
              this.value = v;
              inner_value_change(this, v);
            }.bind(w),
            event,
            w.options ? w.options.multiline : false
          );
        }
        break;
      default:
        if (w.mouse) {
          this.dirty_canvas = w.mouse(event, [x, y], node);
        }
        break;
    } //end switch

    //value changed
    if (old_value != w.value) {
      if (node.onWidgetChanged) node.onWidgetChanged(w.name, w.value, old_value, w);
      node.graph._version++;
    }

    return w;
  } //end for

  function inner_value_change(widget, value) {
    widget.value = value;
    if (widget.options && widget.options.property && node.properties[widget.options.property] !== undefined) {
      node.setProperty(widget.options.property, value);
    }
    if (widget.callback) {
      widget.callback(widget.value, that, node, pos, event);
    }
  }

  return null;
};

/**
 * draws every group area in the background
 * @method drawGroups
 **/
LGraphCanvas.prototype.drawGroups = function (canvas, ctx) {
  if (!this.graph) {
    return;
  }

  let groups = this.graph._groups;

  ctx.save();
  ctx.globalAlpha = 0.5 * this.editor_alpha;

  for (let i = 0; i < groups.length; ++i) {
    let group = groups[i];

    if (!overlapBounding(this.visible_area, group._bounding)) {
      continue;
    } //out of the visible area

    ctx.fillStyle = group.color || "#335";
    ctx.strokeStyle = group.color || "#335";
    let pos = group._pos;
    let size = group._size;
    ctx.globalAlpha = 0.25 * this.editor_alpha;
    ctx.beginPath();
    ctx.rect(pos[0] + 0.5, pos[1] + 0.5, size[0], size[1]);
    ctx.fill();
    ctx.globalAlpha = this.editor_alpha;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pos[0] + size[0], pos[1] + size[1]);
    ctx.lineTo(pos[0] + size[0] - 10, pos[1] + size[1]);
    ctx.lineTo(pos[0] + size[0], pos[1] + size[1] - 10);
    ctx.fill();

    let font_size = group.font_size || LiteGraph.DEFAULT_GROUP_FONT_SIZE;
    ctx.font = font_size + "px Arial";
    ctx.textAlign = "left";
    ctx.fillText(group.title, pos[0] + 4, pos[1] + font_size);
  }

  ctx.restore();
};

LGraphCanvas.prototype.adjustNodesSize = function () {
  let nodes = this.graph._nodes;
  for (let i = 0; i < nodes.length; ++i) {
    nodes[i].size = nodes[i].computeSize();
  }
  this.setDirty(true, true);
};

/**
 * resizes the canvas to a given size, if no size is passed, then it tries to fill the parentNode
 * @method resize
 **/
LGraphCanvas.prototype.resize = function (width, height) {
  if (!width && !height) {
    let parent = this.canvas.parentNode;
    width = parent.offsetWidth;
    height = parent.offsetHeight;
  }

  if (this.canvas.width == width && this.canvas.height == height) {
    return;
  }

  this.canvas.width = width;
  this.canvas.height = height;
  this.bgcanvas.width = this.canvas.width;
  this.bgcanvas.height = this.canvas.height;
  this.setDirty(true, true);
};

/**
 * switches to live mode (node shapes are not rendered, only the content)
 * this feature was designed when graphs where meant to create user interfaces
 * @method switchLiveMode
 **/
LGraphCanvas.prototype.switchLiveMode = function (transition) {
  if (!transition) {
    this.live_mode = !this.live_mode;
    this.dirty_canvas = true;
    this.dirty_bgcanvas = true;
    return;
  }

  let self = this;
  let delta = this.live_mode ? 1.1 : 0.9;
  if (this.live_mode) {
    this.live_mode = false;
    this.editor_alpha = 0.1;
  }

  let t = setInterval(function () {
    self.editor_alpha *= delta;
    self.dirty_canvas = true;
    self.dirty_bgcanvas = true;

    if (delta < 1 && self.editor_alpha < 0.01) {
      clearInterval(t);
      if (delta < 1) {
        self.live_mode = true;
      }
    }
    if (delta > 1 && self.editor_alpha > 0.99) {
      clearInterval(t);
      self.editor_alpha = 1;
    }
  }, 1);
};

LGraphCanvas.prototype.onNodeSelectionChange = function (node) {
  return; //disabled
};

/* this is an implementation for touch not in production and not ready
 */
/*LGraphCanvas.prototype.touchHandler = function(event) {
    //alert("foo");
    let touches = event.changedTouches,
        first = touches[0],
        type = "";

    switch (event.type) {
        case "touchstart":
            type = "mousedown";
            break;
        case "touchmove":
            type = "mousemove";
            break;
        case "touchend":
            type = "mouseup";
            break;
        default:
            return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //           screenX, screenY, clientX, clientY, ctrlKey,
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    // this is eventually a Dom object, get the LGraphCanvas back
    if(typeof this.getCanvasWindow == "undefined"){
        let window = this.lgraphcanvas.getCanvasWindow();
    }else{
        let window = this.getCanvasWindow();
    }
    
    let document = window.document;

    let simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(
        type,
        true,
        true,
        window,
        1,
        first.screenX,
        first.screenY,
        first.clientX,
        first.clientY,
        false,
        false,
        false,
        false,
        0, //left
        null
    );
    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
};*/

/* CONTEXT MENU ********************/

LGraphCanvas.onGroupAdd = function (info, entry, mouse_event) {
  let canvas = LGraphCanvas.active_canvas;
  let ref_window = canvas.getCanvasWindow();

  let group = new LiteGraph.LGraphGroup();
  group.pos = canvas.convertEventToCanvasOffset(mouse_event);
  canvas.graph.add(group);
};

LGraphCanvas.onMenuAdd = function (node, options, e, prev_menu, callback) {
  let canvas = LGraphCanvas.active_canvas;
  let ref_window = canvas.getCanvasWindow();
  let graph = canvas.graph;
  if (!graph) return;

  function inner_onMenuAdded(base_category, prev_menu) {
    let categories = LiteGraph.getNodeTypesCategories(canvas.filter || graph.filter).filter(function (category) {
      return category.startsWith(base_category);
    });
    let entries = [];

    categories.map(function (category) {
      if (!category) return;

      let base_category_regex = new RegExp("^(" + base_category + ")");
      let category_name = category.replace(base_category_regex, "").split("/")[0];
      let category_path = base_category === "" ? category_name + "/" : base_category + category_name + "/";

      let name = category_name;
      if (name.indexOf("::") != -1)
        //in case it has a namespace like "shader::math/rand" it hides the namespace
        name = name.split("::")[1];

      let index = entries.findIndex(function (entry) {
        return entry.value === category_path;
      });
      if (index === -1) {
        entries.push({
          value: category_path,
          content: name,
          has_submenu: true,
          callback: function (value, event, mouseEvent, contextMenu) {
            inner_onMenuAdded(value.value, contextMenu);
          }
        });
      }
    });

    let nodes = LiteGraph.getNodeTypesInCategory(base_category.slice(0, -1), canvas.filter || graph.filter);
    nodes.map(function (node) {
      if (node.skip_list) return;

      let entry = {
        value: node.type,
        content: node.title,
        has_submenu: false,
        callback: function (value, event, mouseEvent, contextMenu) {
          let first_event = contextMenu.getFirstEvent();
          canvas.graph.beforeChange();
          let node = LiteGraph.createNode(value.value);
          if (node) {
            node.pos = canvas.convertEventToCanvasOffset(first_event);
            canvas.graph.add(node);
          }
          if (callback) callback(node);
          canvas.graph.afterChange();
        }
      };

      entries.push(entry);
    });

    new LiteGraph.ContextMenu(entries, { event: e, parentMenu: prev_menu }, ref_window);
  }

  inner_onMenuAdded("", prev_menu);
  return false;
};

LGraphCanvas.onMenuCollapseAll = function () {};

LGraphCanvas.onMenuNodeEdit = function () {};

LGraphCanvas.showMenuNodeOptionalInputs = function (v, options, e, prev_menu, node) {
  if (!node) {
    return;
  }

  let that = this;
  let canvas = LGraphCanvas.active_canvas;
  let ref_window = canvas.getCanvasWindow();

  options = node.optional_inputs;
  if (node.onGetInputs) {
    options = node.onGetInputs();
  }

  let entries = [];
  if (options) {
    for (let i = 0; i < options.length; i++) {
      let entry = options[i];
      if (!entry) {
        entries.push(null);
        continue;
      }
      let label = entry[0];
      if (!entry[2]) entry[2] = {};

      if (entry[2].label) {
        label = entry[2].label;
      }

      entry[2].removable = true;
      let data = { content: label, value: entry };
      if (entry[1] == LiteGraph.ACTION) {
        data.className = "event";
      }
      entries.push(data);
    }
  }

  if (node.onMenuNodeInputs) {
    let retEntries = node.onMenuNodeInputs(entries);
    if (retEntries) entries = retEntries;
  }

  if (!entries.length) {
    console.log("no input entries");
    return;
  }

  let menu = new LiteGraph.ContextMenu(
    entries,
    {
      event: e,
      callback: inner_clicked,
      parentMenu: prev_menu,
      node: node
    },
    ref_window
  );

  function inner_clicked(v, e, prev) {
    if (!node) {
      return;
    }

    if (v.callback) {
      v.callback.call(that, node, v, e, prev);
    }

    if (v.value) {
      node.graph.beforeChange();
      node.addInput(v.value[0], v.value[1], v.value[2]);

      if (node.onNodeInputAdd) {
        // callback to the node when adding a slot
        node.onNodeInputAdd(v.value);
      }
      node.setDirtyCanvas(true, true);
      node.graph.afterChange();
    }
  }

  return false;
};

LGraphCanvas.showMenuNodeOptionalOutputs = function (v, options, e, prev_menu, node) {
  if (!node) {
    return;
  }

  let that = this;
  let canvas = LGraphCanvas.active_canvas;
  let ref_window = canvas.getCanvasWindow();

  options = node.optional_outputs;
  if (node.onGetOutputs) {
    options = node.onGetOutputs();
  }

  let entries = [];
  if (options) {
    for (let i = 0; i < options.length; i++) {
      let entry = options[i];
      if (!entry) {
        //separator?
        entries.push(null);
        continue;
      }

      if (node.flags && node.flags.skip_repeated_outputs && node.findOutputSlot(entry[0]) != -1) {
        continue;
      } //skip the ones already on
      let label = entry[0];
      if (!entry[2]) entry[2] = {};
      if (entry[2].label) {
        label = entry[2].label;
      }
      entry[2].removable = true;
      let data = { content: label, value: entry };
      if (entry[1] == LiteGraph.EVENT) {
        data.className = "event";
      }
      entries.push(data);
    }
  }

  if (this.onMenuNodeOutputs) {
    entries = this.onMenuNodeOutputs(entries);
  }
  if (LiteGraph.do_add_triggers_slots) {
    //canvas.allow_addOutSlot_onExecuted
    if (node.findOutputSlot("onExecuted") == -1) {
      entries.push({
        content: "On Executed",
        value: ["onExecuted", LiteGraph.EVENT, { nameLocked: true }],
        className: "event"
      }); //, opts: {}
    }
  }
  // add callback for modifing the menu elements onMenuNodeOutputs
  if (node.onMenuNodeOutputs) {
    let retEntries = node.onMenuNodeOutputs(entries);
    if (retEntries) entries = retEntries;
  }

  if (!entries.length) {
    return;
  }

  let menu = new LiteGraph.ContextMenu(
    entries,
    {
      event: e,
      callback: inner_clicked,
      parentMenu: prev_menu,
      node: node
    },
    ref_window
  );

  function inner_clicked(v, e, prev) {
    if (!node) {
      return;
    }

    if (v.callback) {
      v.callback.call(that, node, v, e, prev);
    }

    if (!v.value) {
      return;
    }

    let value = v.value[1];

    if (value && (value.constructor === Object || value.constructor === Array)) {
      //submenu why?
      let entries = [];
      for (let i in value) {
        entries.push({ content: i, value: value[i] });
      }
      new LiteGraph.ContextMenu(entries, {
        event: e,
        callback: inner_clicked,
        parentMenu: prev_menu,
        node: node
      });
      return false;
    } else {
      node.graph.beforeChange();
      node.addOutput(v.value[0], v.value[1], v.value[2]);

      if (node.onNodeOutputAdd) {
        // a callback to the node when adding a slot
        node.onNodeOutputAdd(v.value);
      }
      node.setDirtyCanvas(true, true);
      node.graph.afterChange();
    }
  }

  return false;
};

LGraphCanvas.onShowMenuNodeProperties = function (value, options, e, prev_menu, node) {
  if (!node || !node.properties) {
    return;
  }

  let that = this;
  let canvas = LGraphCanvas.active_canvas;
  let ref_window = canvas.getCanvasWindow();

  let entries = [];
  for (let i in node.properties) {
    let value = node.properties[i] !== undefined ? node.properties[i] : " ";
    if (typeof value == "object") value = JSON.stringify(value);
    let info = node.getPropertyInfo(i);
    if (info.type == "enum" || info.type == "combo") value = LGraphCanvas.getPropertyPrintableValue(value, info.values);

    //value could contain invalid html characters, clean that
    value = LGraphCanvas.decodeHTML(value);
    entries.push({
      content:
        "<span class='property_name'>" +
        (info.label ? info.label : i) +
        "</span>" +
        "<span class='property_value'>" +
        value +
        "</span>",
      value: i
    });
  }
  if (!entries.length) {
    return;
  }

  let menu = new LiteGraph.ContextMenu(
    entries,
    {
      event: e,
      callback: inner_clicked,
      parentMenu: prev_menu,
      allow_html: true,
      node: node
    },
    ref_window
  );

  function inner_clicked(v, options, e, prev) {
    if (!node) {
      return;
    }
    let rect = this.getBoundingClientRect();
    canvas.showEditPropertyValue(node, v.value, {
      position: [rect.left, rect.top]
    });
  }

  return false;
};

LGraphCanvas.decodeHTML = function (str) {
  let e = document.createElement("div");
  e.innerText = str;
  return e.innerHTML;
};

LGraphCanvas.onMenuResizeNode = function (value, options, e, menu, node) {
  if (!node) {
    return;
  }

  let fApplyMultiNode = function (node) {
    node.size = node.computeSize();
    if (node.onResize) node.onResize(node.size);
  };

  let graphcanvas = LGraphCanvas.active_canvas;
  if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
    fApplyMultiNode(node);
  } else {
    for (let i in graphcanvas.selected_nodes) {
      fApplyMultiNode(graphcanvas.selected_nodes[i]);
    }
  }

  node.setDirtyCanvas(true, true);
};

LGraphCanvas.prototype.showLinkMenu = function (link, e) {
  let that = this;
  // console.log(link);
  let node_left = that.graph.getNodeById(link.origin_id);
  let node_right = that.graph.getNodeById(link.target_id);
  let fromType = false;
  if (node_left && node_left.outputs && node_left.outputs[link.origin_slot])
    fromType = node_left.outputs[link.origin_slot].type;
  let destType = false;
  if (node_right && node_right.outputs && node_right.outputs[link.target_slot])
    destType = node_right.inputs[link.target_slot].type;

  let options = ["Add Node", null, "Delete", null];

  let menu = new LiteGraph.ContextMenu(options, {
    event: e,
    title: link.data != null ? link.data.constructor.name : null,
    callback: inner_clicked
  });

  function inner_clicked(v, options, e) {
    switch (v) {
      case "Add Node":
        LGraphCanvas.onMenuAdd(null, null, e, menu, function (node) {
          // console.debug("node autoconnect");
          if (!node.inputs || !node.inputs.length || !node.outputs || !node.outputs.length) {
            return;
          }
          // leave the connection type checking inside connectByType
          if (node_left.connectByType(link.origin_slot, node, fromType)) {
            node.connectByType(link.target_slot, node_right, destType);
            node.pos[0] -= node.size[0] * 0.5;
          }
        });
        break;

      case "Delete":
        that.graph.removeLink(link.id);
        break;
      default:
      /*let nodeCreated = createDefaultNodeForSlot({   nodeFrom: node_left
                                                            ,slotFrom: link.origin_slot
                                                            ,nodeTo: node
                                                            ,slotTo: link.target_slot
                                                            ,e: e
                                                            ,nodeType: "AUTO"
                                                        });
            if(nodeCreated) console.log("new node in beetween "+v+" created");*/
    }
  }

  return false;
};

LGraphCanvas.prototype.createDefaultNodeForSlot = function (optPass) {
  // addNodeMenu for connection
  optPass = optPass || {};
  let opts = Object.assign(
    {
      nodeFrom: null, // input
      slotFrom: null, // input
      nodeTo: null, // output
      slotTo: null, // output
      position: [], // pass the event coords
      nodeType: null, // choose a nodetype to add, AUTO to set at first good
      posAdd: [0, 0], // adjust x,y
      posSizeFix: [0, 0] // alpha, adjust the position x,y based on the new node size w,h
    },
    optPass
  );
  let that = this;

  let isFrom = opts.nodeFrom && opts.slotFrom !== null;
  let isTo = !isFrom && opts.nodeTo && opts.slotTo !== null;

  if (!isFrom && !isTo) {
    console.warn(
      "No data passed to createDefaultNodeForSlot " +
        opts.nodeFrom +
        " " +
        opts.slotFrom +
        " " +
        opts.nodeTo +
        " " +
        opts.slotTo
    );
    return false;
  }
  if (!opts.nodeType) {
    console.warn("No type to createDefaultNodeForSlot");
    return false;
  }

  let nodeX = isFrom ? opts.nodeFrom : opts.nodeTo;
  let slotX = isFrom ? opts.slotFrom : opts.slotTo;

  let iSlotConn = false;
  switch (typeof slotX) {
    case "string":
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX, false) : nodeX.findInputSlot(slotX, false);
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
      break;
    case "object":
      // ok slotX
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX.name) : nodeX.findInputSlot(slotX.name);
      break;
    case "number":
      iSlotConn = slotX;
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
      break;
    case "undefined":
    default:
      // bad ?
      //iSlotConn = 0;
      console.warn("Cant get slot information " + slotX);
      return false;
  }

  if (slotX === false || iSlotConn === false) {
    console.warn("createDefaultNodeForSlot bad slotX " + slotX + " " + iSlotConn);
  }

  // check for defaults nodes for this slottype
  let fromSlotType = slotX.type == LiteGraph.EVENT ? "_event_" : slotX.type;
  let slotTypesDefault = isFrom ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in;
  if (slotTypesDefault && slotTypesDefault[fromSlotType]) {
    if (slotX.link !== null) {
      // is connected
    } else {
      // is not not connected
    }
    nodeNewType = false;
    if (typeof slotTypesDefault[fromSlotType] == "object" || typeof slotTypesDefault[fromSlotType] == "array") {
      for (let typeX in slotTypesDefault[fromSlotType]) {
        if (opts.nodeType == slotTypesDefault[fromSlotType][typeX] || opts.nodeType == "AUTO") {
          nodeNewType = slotTypesDefault[fromSlotType][typeX];
          // console.log("opts.nodeType == slotTypesDefault[fromSlotType][typeX] :: "+opts.nodeType);
          break; // --------
        }
      }
    } else {
      if (opts.nodeType == slotTypesDefault[fromSlotType] || opts.nodeType == "AUTO")
        nodeNewType = slotTypesDefault[fromSlotType];
    }
    if (nodeNewType) {
      let nodeNewOpts = false;
      if (typeof nodeNewType == "object" && nodeNewType.node) {
        nodeNewOpts = nodeNewType;
        nodeNewType = nodeNewType.node;
      }

      //that.graph.beforeChange();

      let newNode = LiteGraph.createNode(nodeNewType);
      if (newNode) {
        // if is object pass options
        if (nodeNewOpts) {
          if (nodeNewOpts.properties) {
            for (let i in nodeNewOpts.properties) {
              newNode.addProperty(i, nodeNewOpts.properties[i]);
            }
          }
          if (nodeNewOpts.inputs) {
            newNode.inputs = [];
            for (let i in nodeNewOpts.inputs) {
              newNode.addOutput(nodeNewOpts.inputs[i][0], nodeNewOpts.inputs[i][1]);
            }
          }
          if (nodeNewOpts.outputs) {
            newNode.outputs = [];
            for (let i in nodeNewOpts.outputs) {
              newNode.addOutput(nodeNewOpts.outputs[i][0], nodeNewOpts.outputs[i][1]);
            }
          }
          if (nodeNewOpts.title) {
            newNode.title = nodeNewOpts.title;
          }
          if (nodeNewOpts.json) {
            newNode.configure(nodeNewOpts.json);
          }
        }

        // add the node
        that.graph.add(newNode);
        newNode.pos = [
          opts.position[0] + opts.posAdd[0] + (opts.posSizeFix[0] ? opts.posSizeFix[0] * newNode.size[0] : 0),
          opts.position[1] + opts.posAdd[1] + (opts.posSizeFix[1] ? opts.posSizeFix[1] * newNode.size[1] : 0)
        ]; //that.last_click_position; //[e.canvasX+30, e.canvasX+5];*/

        //that.graph.afterChange();

        // connect the two!
        if (isFrom) {
          opts.nodeFrom.connectByType(iSlotConn, newNode, fromSlotType);
        } else {
          opts.nodeTo.connectByTypeOutput(iSlotConn, newNode, fromSlotType);
        }

        // if connecting in between
        if (isFrom && isTo) {
          // TODO
        }

        return true;
      } else {
        console.log("failed creating " + nodeNewType);
      }
    }
  }
  return false;
};

LGraphCanvas.prototype.showConnectionMenu = function (optPass) {
  // addNodeMenu for connection
  optPass = optPass || {};
  let opts = Object.assign(
    {
      nodeFrom: null, // input
      slotFrom: null, // input
      nodeTo: null, // output
      slotTo: null, // output
      e: null
    },
    optPass
  );
  let that = this;

  let isFrom = opts.nodeFrom && opts.slotFrom;
  let isTo = !isFrom && opts.nodeTo && opts.slotTo;

  if (!isFrom && !isTo) {
    console.warn("No data passed to showConnectionMenu");
    return false;
  }

  let nodeX = isFrom ? opts.nodeFrom : opts.nodeTo;
  let slotX = isFrom ? opts.slotFrom : opts.slotTo;

  let iSlotConn = false;
  switch (typeof slotX) {
    case "string":
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX, false) : nodeX.findInputSlot(slotX, false);
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
      break;
    case "object":
      // ok slotX
      iSlotConn = isFrom ? nodeX.findOutputSlot(slotX.name) : nodeX.findInputSlot(slotX.name);
      break;
    case "number":
      iSlotConn = slotX;
      slotX = isFrom ? nodeX.outputs[slotX] : nodeX.inputs[slotX];
      break;
    default:
      // bad ?
      //iSlotConn = 0;
      console.warn("Cant get slot information " + slotX);
      return false;
  }

  let options = ["Add Node", null];

  if (that.allow_searchbox) {
    options.push("Search");
    options.push(null);
  }

  // get defaults nodes for this slottype
  let fromSlotType = slotX.type == LiteGraph.EVENT ? "_event_" : slotX.type;
  let slotTypesDefault = isFrom ? LiteGraph.slot_types_default_out : LiteGraph.slot_types_default_in;
  if (slotTypesDefault && slotTypesDefault[fromSlotType]) {
    if (typeof slotTypesDefault[fromSlotType] == "object" || typeof slotTypesDefault[fromSlotType] == "array") {
      for (let typeX in slotTypesDefault[fromSlotType]) {
        options.push(slotTypesDefault[fromSlotType][typeX]);
      }
    } else {
      options.push(slotTypesDefault[fromSlotType]);
    }
  }

  // build menu
  let menu = new LiteGraph.ContextMenu(options, {
    event: opts.e,
    title:
      (slotX && slotX.name != "" ? slotX.name + (fromSlotType ? " | " : "") : "") +
      (slotX && fromSlotType ? fromSlotType : ""),
    callback: inner_clicked
  });

  // callback
  function inner_clicked(v, options, e) {
    //console.log("Process showConnectionMenu selection");
    switch (v) {
      case "Add Node":
        LGraphCanvas.onMenuAdd(null, null, e, menu, function (node) {
          if (isFrom) {
            opts.nodeFrom.connectByType(iSlotConn, node, fromSlotType);
          } else {
            opts.nodeTo.connectByTypeOutput(iSlotConn, node, fromSlotType);
          }
        });
        break;
      case "Search":
        if (isFrom) {
          that.showSearchBox(e, { node_from: opts.nodeFrom, slot_from: slotX, type_filter_in: fromSlotType });
        } else {
          that.showSearchBox(e, { node_to: opts.nodeTo, slot_from: slotX, type_filter_out: fromSlotType });
        }
        break;
      default:
        // check for defaults nodes for this slottype
        let nodeCreated = that.createDefaultNodeForSlot(
          Object.assign(opts, {
            position: [opts.e.canvasX, opts.e.canvasY],
            nodeType: v
          })
        );
        if (nodeCreated) {
          // new node created
          //console.log("node "+v+" created")
        } else {
          // failed or v is not in defaults
        }
        break;
    }
  }

  return false;
};

// TODO refactor :: this is used fot title but not for properties!
LGraphCanvas.onShowPropertyEditor = function (item, options, e, menu, node) {
  let input_html = "";
  let property = item.property || "title";
  let value = node[property];

  // TODO refactor :: use createDialog ?

  let dialog = document.createElement("div");
  dialog.is_modified = false;
  dialog.className = "graphdialog";
  dialog.innerHTML = "<span class='name'></span><input autofocus type='text' class='value'/><button>OK</button>";
  dialog.close = function () {
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog);
    }
  };
  let title = dialog.querySelector(".name");
  title.innerText = property;
  let input = dialog.querySelector(".value");
  if (input) {
    input.value = value;
    input.addEventListener("blur", function (e) {
      this.focus();
    });
    input.addEventListener("keydown", function (e) {
      dialog.is_modified = true;
      if (e.keyCode == 27) {
        //ESC
        dialog.close();
      } else if (e.keyCode == 13) {
        inner(); // save
      } else if (e.keyCode != 13 && e.target.localName != "textarea") {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    });
  }

  let graphcanvas = LGraphCanvas.active_canvas;
  let canvas = graphcanvas.canvas;

  let rect = canvas.getBoundingClientRect();
  let offsetx = -20;
  let offsety = -20;
  if (rect) {
    offsetx -= rect.left;
    offsety -= rect.top;
  }

  if (event) {
    dialog.style.left = event.clientX + offsetx + "px";
    dialog.style.top = event.clientY + offsety + "px";
  } else {
    dialog.style.left = canvas.width * 0.5 + offsetx + "px";
    dialog.style.top = canvas.height * 0.5 + offsety + "px";
  }

  let button = dialog.querySelector("button");
  button.addEventListener("click", inner);
  canvas.parentNode.appendChild(dialog);

  if (input) input.focus();

  let dialogCloseTimer = null;
  dialog.addEventListener("mouseleave", function (e) {
    if (LiteGraph.dialog_close_on_mouse_leave)
      if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave)
        dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay); //dialog.close();
  });
  dialog.addEventListener("mouseenter", function (e) {
    if (LiteGraph.dialog_close_on_mouse_leave) if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
  });

  function inner() {
    if (input) setValue(input.value);
  }

  function setValue(value) {
    if (item.type == "Number") {
      value = Number(value);
    } else if (item.type == "Boolean") {
      value = Boolean(value);
    }
    node[property] = value;
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog);
    }
    node.setDirtyCanvas(true, true);
  }
};

// refactor: there are different dialogs, some uses createDialog some dont
LGraphCanvas.prototype.prompt = function (title, value, callback, event, multiline) {
  let that = this;
  let input_html = "";
  title = title || "";

  let dialog = document.createElement("div");
  dialog.is_modified = false;
  dialog.className = "graphdialog rounded";
  if (multiline)
    dialog.innerHTML =
      "<span class='name'></span> <textarea autofocus class='value'></textarea><button class='rounded'>OK</button>";
  else
    dialog.innerHTML =
      "<span class='name'></span> <input autofocus type='text' class='value'/><button class='rounded'>OK</button>";
  dialog.close = function () {
    that.prompt_box = null;
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog);
    }
  };

  let graphcanvas = LGraphCanvas.active_canvas;
  let canvas = graphcanvas.canvas;
  canvas.parentNode.appendChild(dialog);

  if (this.ds.scale > 1) {
    dialog.style.transform = "scale(" + this.ds.scale + ")";
  }

  let dialogCloseTimer = null;
  let prevent_timeout = false;
  LiteGraph.pointerListenerAdd(dialog, "leave", function (e) {
    if (prevent_timeout) return;
    if (LiteGraph.dialog_close_on_mouse_leave)
      if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave)
        dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay); //dialog.close();
  });
  LiteGraph.pointerListenerAdd(dialog, "enter", function (e) {
    if (LiteGraph.dialog_close_on_mouse_leave) if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
  });
  let selInDia = dialog.querySelectorAll("select");
  if (selInDia) {
    // if filtering, check focus changed to comboboxes and prevent closing
    selInDia.forEach(function (selIn) {
      selIn.addEventListener("click", function (e) {
        prevent_timeout++;
      });
      selIn.addEventListener("blur", function (e) {
        prevent_timeout = 0;
      });
      selIn.addEventListener("change", function (e) {
        prevent_timeout = -1;
      });
    });
  }

  if (that.prompt_box) {
    that.prompt_box.close();
  }
  that.prompt_box = dialog;

  let first = null;
  let timeout = null;
  let selected = null;

  let name_element = dialog.querySelector(".name");
  name_element.innerText = title;
  let value_element = dialog.querySelector(".value");
  value_element.value = value;

  let input = value_element;
  input.addEventListener("keydown", function (e) {
    dialog.is_modified = true;
    if (e.keyCode == 27) {
      //ESC
      dialog.close();
    } else if (e.keyCode == 13 && e.target.localName != "textarea") {
      if (callback) {
        callback(this.value);
      }
      dialog.close();
    } else {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  });

  let button = dialog.querySelector("button");
  button.addEventListener("click", function (e) {
    if (callback) {
      callback(input.value);
    }
    that.setDirty(true);
    dialog.close();
  });

  let rect = canvas.getBoundingClientRect();
  let offsetx = -20;
  let offsety = -20;
  if (rect) {
    offsetx -= rect.left;
    offsety -= rect.top;
  }

  if (event) {
    dialog.style.left = event.clientX + offsetx + "px";
    dialog.style.top = event.clientY + offsety + "px";
  } else {
    dialog.style.left = canvas.width * 0.5 + offsetx + "px";
    dialog.style.top = canvas.height * 0.5 + offsety + "px";
  }

  setTimeout(function () {
    input.focus();
  }, 10);

  return dialog;
};

LGraphCanvas.search_limit = -1;
LGraphCanvas.prototype.showSearchBox = function (event, options) {
  // proposed defaults
  def_options = {
    slot_from: null,
    node_from: null,
    node_to: null,
    do_type_filter: LiteGraph.search_filter_enabled, // TODO check for registered_slot_[in/out]_types not empty // this will be checked for functionality enabled : filter on slot type, in and out
    type_filter_in: false, // these are default: pass to set initially set values
    type_filter_out: false,
    show_general_if_none_on_typefilter: true,
    show_general_after_typefiltered: true,
    hide_on_mouse_leave: LiteGraph.search_hide_on_mouse_leave,
    show_all_if_empty: true,
    show_all_on_open: LiteGraph.search_show_all_on_open
  };
  options = Object.assign(def_options, options || {});

  //console.log(options);

  let that = this;
  let input_html = "";
  let graphcanvas = LGraphCanvas.active_canvas;
  let canvas = graphcanvas.canvas;
  let root_document = canvas.ownerDocument || document;

  let dialog = document.createElement("div");
  dialog.className = "litegraph litesearchbox graphdialog rounded";
  dialog.innerHTML = "<span class='name'>Search</span> <input autofocus type='text' class='value rounded'/>";
  if (options.do_type_filter) {
    dialog.innerHTML += "<select class='slot_in_type_filter'><option value=''></option></select>";
    dialog.innerHTML += "<select class='slot_out_type_filter'><option value=''></option></select>";
  }
  dialog.innerHTML += "<div class='helper'></div>";

  if (root_document.fullscreenElement) root_document.fullscreenElement.appendChild(dialog);
  else {
    root_document.body.appendChild(dialog);
    root_document.body.style.overflow = "hidden";
  }
  // dialog element has been appended

  if (options.do_type_filter) {
    let selIn = dialog.querySelector(".slot_in_type_filter");
    let selOut = dialog.querySelector(".slot_out_type_filter");
  }

  dialog.close = function () {
    that.search_box = null;
    this.blur();
    canvas.focus();
    root_document.body.style.overflow = "";

    setTimeout(function () {
      that.canvas.focus();
    }, 20); //important, if canvas loses focus keys wont be captured
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog);
    }
  };

  if (this.ds.scale > 1) {
    dialog.style.transform = "scale(" + this.ds.scale + ")";
  }

  // hide on mouse leave
  if (options.hide_on_mouse_leave) {
    let prevent_timeout = false;
    let timeout_close = null;
    LiteGraph.pointerListenerAdd(dialog, "enter", function (e) {
      if (timeout_close) {
        clearTimeout(timeout_close);
        timeout_close = null;
      }
    });
    LiteGraph.pointerListenerAdd(dialog, "leave", function (e) {
      if (prevent_timeout) {
        return;
      }
      timeout_close = setTimeout(function () {
        dialog.close();
      }, 500);
    });
    // if filtering, check focus changed to comboboxes and prevent closing
    if (options.do_type_filter) {
      selIn.addEventListener("click", function (e) {
        prevent_timeout++;
      });
      selIn.addEventListener("blur", function (e) {
        prevent_timeout = 0;
      });
      selIn.addEventListener("change", function (e) {
        prevent_timeout = -1;
      });
      selOut.addEventListener("click", function (e) {
        prevent_timeout++;
      });
      selOut.addEventListener("blur", function (e) {
        prevent_timeout = 0;
      });
      selOut.addEventListener("change", function (e) {
        prevent_timeout = -1;
      });
    }
  }

  if (that.search_box) {
    that.search_box.close();
  }
  that.search_box = dialog;

  let helper = dialog.querySelector(".helper");

  let first = null;
  let timeout = null;
  let selected = null;

  let input = dialog.querySelector("input");
  if (input) {
    input.addEventListener("blur", function (e) {
      this.focus();
    });
    input.addEventListener("keydown", function (e) {
      if (e.keyCode == 38) {
        //UP
        changeSelection(false);
      } else if (e.keyCode == 40) {
        //DOWN
        changeSelection(true);
      } else if (e.keyCode == 27) {
        //ESC
        dialog.close();
      } else if (e.keyCode == 13) {
        if (selected) {
          select(selected.innerHTML);
        } else if (first) {
          select(first);
        } else {
          dialog.close();
        }
      } else {
        if (timeout) {
          clearInterval(timeout);
        }
        timeout = setTimeout(refreshHelper, 250);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return true;
    });
  }

  // if should filter on type, load and fill selected and choose elements if passed
  if (options.do_type_filter) {
    if (selIn) {
      let aSlots = LiteGraph.slot_types_in;
      let nSlots = aSlots.length; // this for object :: Object.keys(aSlots).length;

      if (options.type_filter_in == LiteGraph.EVENT || options.type_filter_in == LiteGraph.ACTION)
        options.type_filter_in = "_event_";
      /* this will filter on * .. but better do it manually in case
            else if(options.type_filter_in === "" || options.type_filter_in === 0)
                options.type_filter_in = "*";*/

      for (let iK = 0; iK < nSlots; iK++) {
        let opt = document.createElement("option");
        opt.value = aSlots[iK];
        opt.innerHTML = aSlots[iK];
        selIn.appendChild(opt);
        if (
          options.type_filter_in !== false &&
          (options.type_filter_in + "").toLowerCase() == (aSlots[iK] + "").toLowerCase()
        ) {
          //selIn.selectedIndex ..
          opt.selected = true;
          //console.log("comparing IN "+options.type_filter_in+" :: "+aSlots[iK]);
        } else {
          //console.log("comparing OUT "+options.type_filter_in+" :: "+aSlots[iK]);
        }
      }
      selIn.addEventListener("change", function () {
        refreshHelper();
      });
    }
    if (selOut) {
      let aSlots = LiteGraph.slot_types_out;
      let nSlots = aSlots.length; // this for object :: Object.keys(aSlots).length;

      if (options.type_filter_out == LiteGraph.EVENT || options.type_filter_out == LiteGraph.ACTION)
        options.type_filter_out = "_event_";
      /* this will filter on * .. but better do it manually in case
            else if(options.type_filter_out === "" || options.type_filter_out === 0)
                options.type_filter_out = "*";*/

      for (let iK = 0; iK < nSlots; iK++) {
        let opt = document.createElement("option");
        opt.value = aSlots[iK];
        opt.innerHTML = aSlots[iK];
        selOut.appendChild(opt);
        if (
          options.type_filter_out !== false &&
          (options.type_filter_out + "").toLowerCase() == (aSlots[iK] + "").toLowerCase()
        ) {
          //selOut.selectedIndex ..
          opt.selected = true;
        }
      }
      selOut.addEventListener("change", function () {
        refreshHelper();
      });
    }
  }

  //compute best position
  let rect = canvas.getBoundingClientRect();

  let left = (event ? event.clientX : rect.left + rect.width * 0.5) - 80;
  let top = (event ? event.clientY : rect.top + rect.height * 0.5) - 20;
  dialog.style.left = left + "px";
  dialog.style.top = top + "px";

  //To avoid out of screen problems
  if (event.layerY > rect.height - 200) helper.style.maxHeight = rect.height - event.layerY - 20 + "px";

  /*
    let offsetx = -20;
    let offsety = -20;
    if (rect) {
        offsetx -= rect.left;
        offsety -= rect.top;
    }

    if (event) {
        dialog.style.left = event.clientX + offsetx + "px";
        dialog.style.top = event.clientY + offsety + "px";
    } else {
        dialog.style.left = canvas.width * 0.5 + offsetx + "px";
        dialog.style.top = canvas.height * 0.5 + offsety + "px";
    }
    canvas.parentNode.appendChild(dialog);
    */

  input.focus();
  if (options.show_all_on_open) refreshHelper();

  function select(name) {
    if (name) {
      if (that.onSearchBoxSelection) {
        that.onSearchBoxSelection(name, event, graphcanvas);
      } else {
        let extra = LiteGraph.searchbox_extras[name.toLowerCase()];
        if (extra) {
          name = extra.type;
        }

        graphcanvas.graph.beforeChange();
        let node = LiteGraph.createNode(name);
        if (node) {
          node.pos = graphcanvas.convertEventToCanvasOffset(event);
          graphcanvas.graph.add(node, false);
        }

        if (extra && extra.data) {
          if (extra.data.properties) {
            for (let i in extra.data.properties) {
              node.addProperty(i, extra.data.properties[i]);
            }
          }
          if (extra.data.inputs) {
            node.inputs = [];
            for (let i in extra.data.inputs) {
              node.addOutput(extra.data.inputs[i][0], extra.data.inputs[i][1]);
            }
          }
          if (extra.data.outputs) {
            node.outputs = [];
            for (let i in extra.data.outputs) {
              node.addOutput(extra.data.outputs[i][0], extra.data.outputs[i][1]);
            }
          }
          if (extra.data.title) {
            node.title = extra.data.title;
          }
          if (extra.data.json) {
            node.configure(extra.data.json);
          }
        }

        // join node after inserting
        if (options.node_from) {
          let iS = false;
          switch (typeof options.slot_from) {
            case "string":
              iS = options.node_from.findOutputSlot(options.slot_from);
              break;
            case "object":
              if (options.slot_from.name) {
                iS = options.node_from.findOutputSlot(options.slot_from.name);
              } else {
                iS = -1;
              }
              if (iS == -1 && typeof options.slot_from.slot_index !== "undefined") iS = options.slot_from.slot_index;
              break;
            case "number":
              iS = options.slot_from;
              break;
            default:
              iS = 0; // try with first if no name set
          }
          if (typeof options.node_from.outputs[iS] !== undefined) {
            if (iS !== false && iS > -1) {
              options.node_from.connectByType(iS, node, options.node_from.outputs[iS].type);
            }
          } else {
            // console.warn("cant find slot " + options.slot_from);
          }
        }
        if (options.node_to) {
          let iS = false;
          switch (typeof options.slot_from) {
            case "string":
              iS = options.node_to.findInputSlot(options.slot_from);
              break;
            case "object":
              if (options.slot_from.name) {
                iS = options.node_to.findInputSlot(options.slot_from.name);
              } else {
                iS = -1;
              }
              if (iS == -1 && typeof options.slot_from.slot_index !== "undefined") iS = options.slot_from.slot_index;
              break;
            case "number":
              iS = options.slot_from;
              break;
            default:
              iS = 0; // try with first if no name set
          }
          if (typeof options.node_to.inputs[iS] !== undefined) {
            if (iS !== false && iS > -1) {
              // try connection
              options.node_to.connectByTypeOutput(iS, node, options.node_to.inputs[iS].type);
            }
          } else {
            // console.warn("cant find slot_nodeTO " + options.slot_from);
          }
        }

        graphcanvas.graph.afterChange();
      }
    }

    dialog.close();
  }

  function changeSelection(forward) {
    let prev = selected;
    if (selected) {
      selected.classList.remove("selected");
    }
    if (!selected) {
      selected = forward ? helper.childNodes[0] : helper.childNodes[helper.childNodes.length];
    } else {
      selected = forward ? selected.nextSibling : selected.previousSibling;
      if (!selected) {
        selected = prev;
      }
    }
    if (!selected) {
      return;
    }
    selected.classList.add("selected");
    selected.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  function refreshHelper() {
    timeout = null;
    let str = input.value;
    first = null;
    helper.innerHTML = "";
    if (!str && !options.show_all_if_empty) {
      return;
    }

    if (that.onSearchBox) {
      let list = that.onSearchBox(helper, str, graphcanvas);
      if (list) {
        for (let i = 0; i < list.length; ++i) {
          addResult(list[i]);
        }
      }
    } else {
      let c = 0;
      str = str.toLowerCase();
      let filter = graphcanvas.filter || graphcanvas.graph.filter;

      // filter by type preprocess
      if (options.do_type_filter && that.search_box) {
        let sIn = that.search_box.querySelector(".slot_in_type_filter");
        let sOut = that.search_box.querySelector(".slot_out_type_filter");
      } else {
        let sIn = false;
        let sOut = false;
      }

      //extras
      for (let i in LiteGraph.searchbox_extras) {
        let extra = LiteGraph.searchbox_extras[i];
        if ((!options.show_all_if_empty || str) && extra.desc.toLowerCase().indexOf(str) === -1) {
          continue;
        }
        let ctor = LiteGraph.registered_node_types[extra.type];
        if (ctor && ctor.filter != filter) continue;
        if (!inner_test_filter(extra.type)) continue;
        addResult(extra.desc, "searchbox_extra");
        if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
          break;
        }
      }

      let filtered = null;
      if (Array.prototype.filter) {
        //filter supported
        let keys = Object.keys(LiteGraph.registered_node_types); //types
        let filtered = keys.filter(inner_test_filter);
      } else {
        filtered = [];
        for (let i in LiteGraph.registered_node_types) {
          if (inner_test_filter(i)) filtered.push(i);
        }
      }

      for (let i = 0; i < filtered.length; i++) {
        addResult(filtered[i]);
        if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
          break;
        }
      }

      // add general type if filtering
      if (options.show_general_after_typefiltered && (sIn.value || sOut.value)) {
        filtered_extra = [];
        for (let i in LiteGraph.registered_node_types) {
          if (
            inner_test_filter(i, {
              inTypeOverride: sIn && sIn.value ? "*" : false,
              outTypeOverride: sOut && sOut.value ? "*" : false
            })
          )
            filtered_extra.push(i);
        }
        for (let i = 0; i < filtered_extra.length; i++) {
          addResult(filtered_extra[i], "generic_type");
          if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
            break;
          }
        }
      }

      // check il filtering gave no results
      if ((sIn.value || sOut.value) && helper.childNodes.length == 0 && options.show_general_if_none_on_typefilter) {
        filtered_extra = [];
        for (let i in LiteGraph.registered_node_types) {
          if (inner_test_filter(i, { skipFilter: true })) filtered_extra.push(i);
        }
        for (let i = 0; i < filtered_extra.length; i++) {
          addResult(filtered_extra[i], "not_in_filter");
          if (LGraphCanvas.search_limit !== -1 && c++ > LGraphCanvas.search_limit) {
            break;
          }
        }
      }

      function inner_test_filter(type, optsIn) {
        optsIn = optsIn || {};
        let optsDef = {
          skipFilter: false,
          inTypeOverride: false,
          outTypeOverride: false
        };
        let opts = Object.assign(optsDef, optsIn);
        let ctor = LiteGraph.registered_node_types[type];
        if (filter && ctor.filter != filter) return false;
        if ((!options.show_all_if_empty || str) && type.toLowerCase().indexOf(str) === -1) return false;

        // filter by slot IN, OUT types
        if (options.do_type_filter && !opts.skipFilter) {
          let sType = type;

          sV = sIn.value;
          if (opts.inTypeOverride !== false) sV = opts.inTypeOverride;
          //if (sV.toLowerCase() == "_event_") sV = LiteGraph.EVENT; // -1

          if (sIn && sV) {
            //console.log("will check filter against "+sV);
            if (LiteGraph.registered_slot_in_types[sV] && LiteGraph.registered_slot_in_types[sV].nodes) {
              // type is stored
              //console.debug("check "+sType+" in "+LiteGraph.registered_slot_in_types[sV].nodes);
              let doesInc = LiteGraph.registered_slot_in_types[sV].nodes.includes(sType);
              if (doesInc !== false) {
                //console.log(sType+" HAS "+sV);
              } else {
                /*console.debug(LiteGraph.registered_slot_in_types[sV]);
                                console.log(+" DONT includes "+type);*/
                return false;
              }
            }
          }

          sV = sOut.value;
          if (opts.outTypeOverride !== false) sV = opts.outTypeOverride;
          //if (sV.toLowerCase() == "_event_") sV = LiteGraph.EVENT; // -1

          if (sOut && sV) {
            //console.log("search will check filter against "+sV);
            if (LiteGraph.registered_slot_out_types[sV] && LiteGraph.registered_slot_out_types[sV].nodes) {
              // type is stored
              //console.debug("check "+sType+" in "+LiteGraph.registered_slot_out_types[sV].nodes);
              let doesInc = LiteGraph.registered_slot_out_types[sV].nodes.includes(sType);
              if (doesInc !== false) {
                //console.log(sType+" HAS "+sV);
              } else {
                /*console.debug(LiteGraph.registered_slot_out_types[sV]);
                                console.log(+" DONT includes "+type);*/
                return false;
              }
            }
          }
        }
        return true;
      }
    }

    function addResult(type, className) {
      let help = document.createElement("div");
      if (!first) {
        first = type;
      }
      help.innerText = type;
      help.dataset["type"] = escape(type);
      help.className = "litegraph lite-search-item";
      if (className) {
        help.className += " " + className;
      }
      help.addEventListener("click", function (e) {
        select(unescape(this.dataset["type"]));
      });
      helper.appendChild(help);
    }
  }

  return dialog;
};

LGraphCanvas.prototype.showEditPropertyValue = function (node, property, options) {
  if (!node || node.properties[property] === undefined) {
    return;
  }

  options = options || {};
  let that = this;

  let info = node.getPropertyInfo(property);
  let type = info.type;

  let input_html = "";

  if (type == "string" || type == "number" || type == "array" || type == "object") {
    input_html = "<input autofocus type='text' class='value'/>";
  } else if ((type == "enum" || type == "combo") && info.values) {
    input_html = "<select autofocus type='text' class='value'>";
    for (let i in info.values) {
      let v = i;
      if (info.values.constructor === Array) v = info.values[i];

      input_html +=
        "<option value='" +
        v +
        "' " +
        (v == node.properties[property] ? "selected" : "") +
        ">" +
        info.values[i] +
        "</option>";
    }
    input_html += "</select>";
  } else if (type == "boolean" || type == "toggle") {
    input_html =
      "<input autofocus type='checkbox' class='value' " + (node.properties[property] ? "checked" : "") + "/>";
  } else {
    console.warn("unknown type: " + type);
    return;
  }

  let dialog = this.createDialog(
    "<span class='name'>" + (info.label ? info.label : property) + "</span>" + input_html + "<button>OK</button>",
    options
  );

  let input = false;
  if ((type == "enum" || type == "combo") && info.values) {
    input = dialog.querySelector("select");
    input.addEventListener("change", function (e) {
      dialog.modified();
      setValue(e.target.value);
      //let index = e.target.value;
      //setValue( e.options[e.selectedIndex].value );
    });
  } else if (type == "boolean" || type == "toggle") {
    input = dialog.querySelector("input");
    if (input) {
      input.addEventListener("click", function (e) {
        dialog.modified();
        setValue(!!input.checked);
      });
    }
  } else {
    input = dialog.querySelector("input");
    if (input) {
      input.addEventListener("blur", function (e) {
        this.focus();
      });

      let v = node.properties[property] !== undefined ? node.properties[property] : "";
      if (type !== "string") {
        v = JSON.stringify(v);
      }

      input.value = v;
      input.addEventListener("keydown", function (e) {
        if (e.keyCode == 27) {
          //ESC
          dialog.close();
        } else if (e.keyCode == 13) {
          // ENTER
          inner(); // save
        } else if (e.keyCode != 13) {
          dialog.modified();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      });
    }
  }
  if (input) input.focus();

  let button = dialog.querySelector("button");
  button.addEventListener("click", inner);

  function inner() {
    setValue(input.value);
  }

  function setValue(value) {
    if (info && info.values && info.values.constructor === Object && info.values[value] != undefined)
      value = info.values[value];

    if (typeof node.properties[property] == "number") {
      value = Number(value);
    }
    if (type == "array" || type == "object") {
      value = JSON.parse(value);
    }
    node.properties[property] = value;
    if (node.graph) {
      node.graph._version++;
    }
    if (node.onPropertyChanged) {
      node.onPropertyChanged(property, value);
    }
    if (options.onclose) options.onclose();
    dialog.close();
    node.setDirtyCanvas(true, true);
  }

  return dialog;
};

// TODO refactor, theer are different dialog, some uses createDialog, some dont
LGraphCanvas.prototype.createDialog = function (html, options) {
  def_options = { checkForInput: false, closeOnLeave: true, closeOnLeave_checkModified: true };
  options = Object.assign(def_options, options || {});

  let dialog = document.createElement("div");
  dialog.className = "graphdialog";
  dialog.innerHTML = html;
  dialog.is_modified = false;

  let rect = this.canvas.getBoundingClientRect();
  let offsetx = -20;
  let offsety = -20;
  if (rect) {
    offsetx -= rect.left;
    offsety -= rect.top;
  }

  if (options.position) {
    offsetx += options.position[0];
    offsety += options.position[1];
  } else if (options.event) {
    offsetx += options.event.clientX;
    offsety += options.event.clientY;
  } //centered
  else {
    offsetx += this.canvas.width * 0.5;
    offsety += this.canvas.height * 0.5;
  }

  dialog.style.left = offsetx + "px";
  dialog.style.top = offsety + "px";

  this.canvas.parentNode.appendChild(dialog);

  // acheck for input and use default behaviour: save on enter, close on esc
  if (options.checkForInput) {
    let aI = [];
    let focused = false;
    if ((aI = dialog.querySelectorAll("input"))) {
      aI.forEach(function (iX) {
        iX.addEventListener("keydown", function (e) {
          dialog.modified();
          if (e.keyCode == 27) {
            dialog.close();
          } else if (e.keyCode != 13) {
            return;
          }
          // set value ?
          e.preventDefault();
          e.stopPropagation();
        });
        if (!focused) iX.focus();
      });
    }
  }

  dialog.modified = function () {
    dialog.is_modified = true;
  };
  dialog.close = function () {
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog);
    }
  };

  let dialogCloseTimer = null;
  let prevent_timeout = false;
  dialog.addEventListener("mouseleave", function (e) {
    if (prevent_timeout) return;
    if (options.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave)
      if (!dialog.is_modified && LiteGraph.dialog_close_on_mouse_leave)
        dialogCloseTimer = setTimeout(dialog.close, LiteGraph.dialog_close_on_mouse_leave_delay); //dialog.close();
  });
  dialog.addEventListener("mouseenter", function (e) {
    if (options.closeOnLeave || LiteGraph.dialog_close_on_mouse_leave)
      if (dialogCloseTimer) clearTimeout(dialogCloseTimer);
  });
  let selInDia = dialog.querySelectorAll("select");
  if (selInDia) {
    // if filtering, check focus changed to comboboxes and prevent closing
    selInDia.forEach(function (selIn) {
      selIn.addEventListener("click", function (e) {
        prevent_timeout++;
      });
      selIn.addEventListener("blur", function (e) {
        prevent_timeout = 0;
      });
      selIn.addEventListener("change", function (e) {
        prevent_timeout = -1;
      });
    });
  }

  return dialog;
};

LGraphCanvas.prototype.createPanel = function (title, options) {
  options = options || {};

  let ref_window = options.window || window;
  let root = document.createElement("div");
  root.className = "litegraph dialog";
  root.innerHTML =
    "<div class='dialog-header'><span class='dialog-title'></span></div><div class='dialog-content'></div><div style='display:none;' class='dialog-alt-content'></div><div class='dialog-footer'></div>";
  root.header = root.querySelector(".dialog-header");

  if (options.width) root.style.width = options.width + (options.width.constructor === Number ? "px" : "");
  if (options.height) root.style.height = options.height + (options.height.constructor === Number ? "px" : "");
  if (options.closable) {
    let close = document.createElement("span");
    close.innerHTML = "&#10005;";
    close.classList.add("close");
    close.addEventListener("click", function () {
      root.close();
    });
    root.header.appendChild(close);
  }
  root.title_element = root.querySelector(".dialog-title");
  root.title_element.innerText = title;
  root.content = root.querySelector(".dialog-content");
  root.alt_content = root.querySelector(".dialog-alt-content");
  root.footer = root.querySelector(".dialog-footer");

  root.close = function () {
    if (root.onClose && typeof root.onClose == "function") {
      root.onClose();
    }
    root.parentNode.removeChild(root);
    /* XXX CHECK THIS */
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
    /* XXX this was not working, was fixed with an IF, check this */
  };

  // function to swap panel content
  root.toggleAltContent = function (force) {
    if (typeof force != "undefined") {
      let vTo = force ? "block" : "none";
      let vAlt = force ? "none" : "block";
    } else {
      let vTo = root.alt_content.style.display != "block" ? "block" : "none";
      let vAlt = root.alt_content.style.display != "block" ? "none" : "block";
    }
    root.alt_content.style.display = vTo;
    root.content.style.display = vAlt;
  };

  root.toggleFooterVisibility = function (force) {
    if (typeof force != "undefined") {
      let vTo = force ? "block" : "none";
    } else {
      let vTo = root.footer.style.display != "block" ? "block" : "none";
    }
    root.footer.style.display = vTo;
  };

  root.clear = function () {
    this.content.innerHTML = "";
  };

  root.addHTML = function (code, classname, on_footer) {
    let elem = document.createElement("div");
    if (classname) elem.className = classname;
    elem.innerHTML = code;
    if (on_footer) root.footer.appendChild(elem);
    else root.content.appendChild(elem);
    return elem;
  };

  root.addButton = function (name, callback, options) {
    let elem = document.createElement("button");
    elem.innerText = name;
    elem.options = options;
    elem.classList.add("btn");
    elem.addEventListener("click", callback);
    root.footer.appendChild(elem);
    return elem;
  };

  root.addSeparator = function () {
    let elem = document.createElement("div");
    elem.className = "separator";
    root.content.appendChild(elem);
  };

  root.addWidget = function (type, name, value, options, callback) {
    options = options || {};
    let str_value = String(value);
    type = type.toLowerCase();
    if (type == "number") str_value = value.toFixed(3);

    let elem = document.createElement("div");
    elem.className = "property";
    elem.innerHTML = "<span class='property_name'></span><span class='property_value'></span>";
    elem.querySelector(".property_name").innerText = options.label || name;
    let value_element = elem.querySelector(".property_value");
    value_element.innerText = str_value;
    elem.dataset["property"] = name;
    elem.dataset["type"] = options.type || type;
    elem.options = options;
    elem.value = value;

    if (type == "code")
      elem.addEventListener("click", function (e) {
        root.inner_showCodePad(this.dataset["property"]);
      });
    else if (type == "boolean") {
      elem.classList.add("boolean");
      if (value) elem.classList.add("bool-on");
      elem.addEventListener("click", function () {
        //let v = node.properties[this.dataset["property"]];
        //node.setProperty(this.dataset["property"],!v); this.innerText = v ? "true" : "false";
        let propname = this.dataset["property"];
        this.value = !this.value;
        this.classList.toggle("bool-on");
        this.querySelector(".property_value").innerText = this.value ? "true" : "false";
        innerChange(propname, this.value);
      });
    } else if (type == "string" || type == "number") {
      value_element.setAttribute("contenteditable", true);
      value_element.addEventListener("keydown", function (e) {
        if (e.code == "Enter" && (type != "string" || !e.shiftKey)) {
          // allow for multiline
          e.preventDefault();
          this.blur();
        }
      });
      value_element.addEventListener("blur", function () {
        let v = this.innerText;
        let propname = this.parentNode.dataset["property"];
        let proptype = this.parentNode.dataset["type"];
        if (proptype == "number") v = Number(v);
        innerChange(propname, v);
      });
    } else if (type == "enum" || type == "combo") {
      let str_value = LGraphCanvas.getPropertyPrintableValue(value, options.values);
      value_element.innerText = str_value;

      value_element.addEventListener("click", function (event) {
        let values = options.values || [];
        let propname = this.parentNode.dataset["property"];
        let elem_that = this;
        let menu = new LiteGraph.ContextMenu(
          values,
          {
            event: event,
            className: "dark",
            callback: inner_clicked
          },
          ref_window
        );
        function inner_clicked(v, option, event) {
          //node.setProperty(propname,v);
          //graphcanvas.dirty_canvas = true;
          elem_that.innerText = v;
          innerChange(propname, v);
          return false;
        }
      });
    }

    root.content.appendChild(elem);

    function innerChange(name, value) {
      //console.log("change",name,value);
      //that.dirty_canvas = true;
      if (options.callback) options.callback(name, value, options);
      if (callback) callback(name, value, options);
    }

    return elem;
  };

  if (root.onOpen && typeof root.onOpen == "function") root.onOpen();

  return root;
};

LGraphCanvas.getPropertyPrintableValue = function (value, values) {
  if (!values) return String(value);

  if (values.constructor === Array) {
    return String(value);
  }

  if (values.constructor === Object) {
    let desc_value = "";
    for (let k in values) {
      if (values[k] != value) continue;
      desc_value = k;
      break;
    }
    return String(value) + " (" + desc_value + ")";
  }
};

LGraphCanvas.prototype.closePanels = function () {
  let panel = document.querySelector("#node-panel");
  if (panel) panel.close();
  panel = document.querySelector("#option-panel");
  if (panel) panel.close();
};

LGraphCanvas.prototype.showShowGraphOptionsPanel = function (refOpts, obEv, refMenu, refMenu2) {
  if (this.constructor && this.constructor.name == "HTMLDivElement") {
    // assume coming from the menu event click
    if (!obEv || !obEv.event || !obEv.event.target || !obEv.event.target.lgraphcanvas) {
      console.warn("Canvas not found"); // need a ref to canvas obj
      /*console.debug(event);
            console.debug(event.target);*/
      return;
    }
    let graphcanvas = obEv.event.target.lgraphcanvas;
  } else {
    // assume called internally
    let graphcanvas = this;
  }
  graphcanvas.closePanels();
  let ref_window = graphcanvas.getCanvasWindow();
  panel = graphcanvas.createPanel("Options", {
    closable: true,
    window: ref_window,
    onOpen: function () {
      graphcanvas.OPTIONPANEL_IS_OPEN = true;
    },
    onClose: function () {
      graphcanvas.OPTIONPANEL_IS_OPEN = false;
      graphcanvas.options_panel = null;
    }
  });
  graphcanvas.options_panel = panel;
  panel.id = "option-panel";
  panel.classList.add("settings");

  function inner_refresh() {
    panel.content.innerHTML = ""; //clear

    let fUpdate = function (name, value, options) {
      switch (name) {
        /*case "Render mode":
                    // Case "".. 
                    if (options.values && options.key){
                        let kV = Object.values(options.values).indexOf(value);
                        if (kV>=0 && options.values[kV]){
                            console.debug("update graph options: "+options.key+": "+kV);
                            graphcanvas[options.key] = kV;
                            //console.debug(graphcanvas);
                            break;
                        }
                    }
                    console.warn("unexpected options");
                    console.debug(options);
                    break;*/
        default:
          //console.debug("want to update graph options: "+name+": "+value);
          if (options && options.key) {
            name = options.key;
          }
          if (options.values) {
            value = Object.values(options.values).indexOf(value);
          }
          //console.debug("update graph option: "+name+": "+value);
          graphcanvas[name] = value;
          break;
      }
    };

    // panel.addWidget( "string", "Graph name", "", {}, fUpdate); // implement

    let aProps = LiteGraph.availableCanvasOptions;
    aProps.sort();
    for (pI in aProps) {
      let pX = aProps[pI];
      panel.addWidget("boolean", pX, graphcanvas[pX], { key: pX, on: "True", off: "False" }, fUpdate);
    }

    let aLinks = [graphcanvas.links_render_mode];
    panel.addWidget(
      "combo",
      "Render mode",
      LiteGraph.LINK_RENDER_MODES[graphcanvas.links_render_mode],
      { key: "links_render_mode", values: LiteGraph.LINK_RENDER_MODES },
      fUpdate
    );

    panel.addSeparator();

    panel.footer.innerHTML = ""; // clear
  }
  inner_refresh();

  graphcanvas.canvas.parentNode.appendChild(panel);
};

LGraphCanvas.prototype.showShowNodePanel = function (node) {
  this.SELECTED_NODE = node;
  this.closePanels();
  let ref_window = this.getCanvasWindow();
  let graphcanvas = this;
  let panel = this.createPanel(node.title || "", {
    closable: true,
    window: ref_window,
    onOpen: function () {
      graphcanvas.NODEPANEL_IS_OPEN = true;
    },
    onClose: function () {
      graphcanvas.NODEPANEL_IS_OPEN = false;
      graphcanvas.node_panel = null;
    }
  });
  graphcanvas.node_panel = panel;
  panel.id = "node-panel";
  panel.node = node;
  panel.classList.add("settings");

  function inner_refresh() {
    panel.content.innerHTML = ""; //clear
    panel.addHTML(
      "<span class='node_type'>" +
        node.type +
        "</span><span class='node_desc'>" +
        (node.constructor.desc || "") +
        "</span><span class='separator'></span>"
    );

    panel.addHTML("<h3>Properties</h3>");

    let fUpdate = function (name, value) {
      graphcanvas.graph.beforeChange(node);
      switch (name) {
        case "Title":
          node.title = value;
          break;
        case "Mode":
          let kV = Object.values(LiteGraph.NODE_MODES).indexOf(value);
          if (kV >= 0 && LiteGraph.NODE_MODES[kV]) {
            node.changeMode(kV);
          } else {
            console.warn("unexpected mode: " + value);
          }
          break;
        case "Color":
          if (LGraphCanvas.node_colors[value]) {
            node.color = LGraphCanvas.node_colors[value].color;
            node.bgcolor = LGraphCanvas.node_colors[value].bgcolor;
          } else {
            console.warn("unexpected color: " + value);
          }
          break;
        default:
          node.setProperty(name, value);
          break;
      }
      graphcanvas.graph.afterChange();
      graphcanvas.dirty_canvas = true;
    };

    panel.addWidget("string", "Title", node.title, {}, fUpdate);

    panel.addWidget("combo", "Mode", LiteGraph.NODE_MODES[node.mode], { values: LiteGraph.NODE_MODES }, fUpdate);

    let nodeCol = "";
    if (node.color !== undefined) {
      nodeCol = Object.keys(LGraphCanvas.node_colors).filter(function (nK) {
        return LGraphCanvas.node_colors[nK].color == node.color;
      });
    }

    panel.addWidget("combo", "Color", nodeCol, { values: Object.keys(LGraphCanvas.node_colors) }, fUpdate);

    for (let pName in node.properties) {
      let value = node.properties[pName];
      let info = node.getPropertyInfo(pName);
      let type = info.type || "string";

      //in case the user wants control over the side panel widget
      if (node.onAddPropertyToPanel && node.onAddPropertyToPanel(pName, panel)) continue;

      panel.addWidget(info.widget || info.type, pName, value, info, fUpdate);
    }

    panel.addSeparator();

    if (node.onShowCustomPanelInfo) node.onShowCustomPanelInfo(panel);

    panel.footer.innerHTML = ""; // clear
    panel
      .addButton("Delete", function () {
        if (node.block_delete) return;
        node.graph.remove(node);
        panel.close();
      })
      .classList.add("delete");
  }

  panel.inner_showCodePad = function (propname) {
    panel.classList.remove("settings");
    panel.classList.add("centered");

    /*if(window.CodeFlask) //disabled for now
        {
            panel.content.innerHTML = "<div class='code'></div>";
            let flask = new CodeFlask( "div.code", { language: 'js' });
            flask.updateCode(node.properties[propname]);
            flask.onUpdate( function(code) {
                node.setProperty(propname, code);
            });
        }
        else
        {*/
    panel.alt_content.innerHTML = "<textarea class='code'></textarea>";
    let textarea = panel.alt_content.querySelector("textarea");
    let fDoneWith = function () {
      panel.toggleAltContent(false); //if(node_prop_div) node_prop_div.style.display = "block"; // panel.close();
      panel.toggleFooterVisibility(true);
      textarea.parentNode.removeChild(textarea);
      panel.classList.add("settings");
      panel.classList.remove("centered");
      inner_refresh();
    };
    textarea.value = node.properties[propname];
    textarea.addEventListener("keydown", function (e) {
      if (e.code == "Enter" && e.ctrlKey) {
        node.setProperty(propname, textarea.value);
        fDoneWith();
      }
    });
    panel.toggleAltContent(true);
    panel.toggleFooterVisibility(false);
    textarea.style.height = "calc(100% - 40px)";
    /*}*/
    let assign = panel.addButton("Assign", function () {
      node.setProperty(propname, textarea.value);
      fDoneWith();
    });
    panel.alt_content.appendChild(assign); //panel.content.appendChild(assign);
    let button = panel.addButton("Close", fDoneWith);
    button.style.float = "right";
    panel.alt_content.appendChild(button); // panel.content.appendChild(button);
  };

  inner_refresh();

  this.canvas.parentNode.appendChild(panel);
};

LGraphCanvas.prototype.showSubgraphPropertiesDialog = function (node) {
  console.log("showing subgraph properties dialog");

  let old_panel = this.canvas.parentNode.querySelector(".subgraph_dialog");
  if (old_panel) old_panel.close();

  let panel = this.createPanel("Subgraph Inputs", { closable: true, width: 500 });
  panel.node = node;
  panel.classList.add("subgraph_dialog");

  function inner_refresh() {
    panel.clear();

    //show currents
    if (node.inputs)
      for (let i = 0; i < node.inputs.length; ++i) {
        let input = node.inputs[i];
        if (input.not_subgraph_input) continue;
        let html =
          "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
        let elem = panel.addHTML(html, "subgraph_property");
        elem.dataset["name"] = input.name;
        elem.dataset["slot"] = i;
        elem.querySelector(".name").innerText = input.name;
        elem.querySelector(".type").innerText = input.type;
        elem.querySelector("button").addEventListener("click", function (e) {
          node.removeInput(Number(this.parentNode.dataset["slot"]));
          inner_refresh();
        });
      }
  }

  //add extra
  let html =
    " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>";
  let elem = panel.addHTML(html, "subgraph_property extra", true);
  elem.querySelector("button").addEventListener("click", function (e) {
    let elem = this.parentNode;
    let name = elem.querySelector(".name").value;
    let type = elem.querySelector(".type").value;
    if (!name || node.findInputSlot(name) != -1) return;
    node.addInput(name, type);
    elem.querySelector(".name").value = "";
    elem.querySelector(".type").value = "";
    inner_refresh();
  });

  inner_refresh();
  this.canvas.parentNode.appendChild(panel);
  return panel;
};
LGraphCanvas.prototype.showSubgraphPropertiesDialogRight = function (node) {
  // console.log("showing subgraph properties dialog");
  let that = this;
  // old_panel if old_panel is exist close it
  let old_panel = this.canvas.parentNode.querySelector(".subgraph_dialog");
  if (old_panel) old_panel.close();
  // new panel
  let panel = this.createPanel("Subgraph Outputs", { closable: true, width: 500 });
  panel.node = node;
  panel.classList.add("subgraph_dialog");

  function inner_refresh() {
    panel.clear();
    //show currents
    if (node.outputs)
      for (let i = 0; i < node.outputs.length; ++i) {
        let input = node.outputs[i];
        if (input.not_subgraph_output) continue;
        let html =
          "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
        let elem = panel.addHTML(html, "subgraph_property");
        elem.dataset["name"] = input.name;
        elem.dataset["slot"] = i;
        elem.querySelector(".name").innerText = input.name;
        elem.querySelector(".type").innerText = input.type;
        elem.querySelector("button").addEventListener("click", function (e) {
          node.removeOutput(Number(this.parentNode.dataset["slot"]));
          inner_refresh();
        });
      }
  }

  //add extra
  let html =
    " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>";
  let elem = panel.addHTML(html, "subgraph_property extra", true);
  elem.querySelector(".name").addEventListener("keydown", function (e) {
    if (e.keyCode == 13) {
      addOutput.apply(this);
    }
  });
  elem.querySelector("button").addEventListener("click", function (e) {
    addOutput.apply(this);
  });
  function addOutput() {
    let elem = this.parentNode;
    let name = elem.querySelector(".name").value;
    let type = elem.querySelector(".type").value;
    if (!name || node.findOutputSlot(name) != -1) return;
    node.addOutput(name, type);
    elem.querySelector(".name").value = "";
    elem.querySelector(".type").value = "";
    inner_refresh();
  }

  inner_refresh();
  this.canvas.parentNode.appendChild(panel);
  return panel;
};
LGraphCanvas.prototype.checkPanels = function () {
  if (!this.canvas) return;
  let panels = this.canvas.parentNode.querySelectorAll(".litegraph.dialog");
  for (let i = 0; i < panels.length; ++i) {
    let panel = panels[i];
    if (!panel.node) continue;
    if (!panel.node.graph || panel.graph != this.graph) panel.close();
  }
};

LGraphCanvas.onMenuNodeCollapse = function (value, options, e, menu, node) {
  node.graph.beforeChange(/*?*/);

  let fApplyMultiNode = function (node) {
    node.collapse();
  };

  let graphcanvas = LGraphCanvas.active_canvas;
  if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
    fApplyMultiNode(node);
  } else {
    for (let i in graphcanvas.selected_nodes) {
      fApplyMultiNode(graphcanvas.selected_nodes[i]);
    }
  }

  node.graph.afterChange(/*?*/);
};

LGraphCanvas.onMenuNodePin = function (value, options, e, menu, node) {
  node.pin();
};

LGraphCanvas.onMenuNodeMode = function (value, options, e, menu, node) {
  new LiteGraph.ContextMenu(LiteGraph.NODE_MODES, { event: e, callback: inner_clicked, parentMenu: menu, node: node });

  function inner_clicked(v) {
    if (!node) {
      return;
    }
    let kV = Object.values(LiteGraph.NODE_MODES).indexOf(v);
    let fApplyMultiNode = function (node) {
      if (kV >= 0 && LiteGraph.NODE_MODES[kV]) node.changeMode(kV);
      else {
        console.warn("unexpected mode: " + v);
        node.changeMode(LiteGraph.ALWAYS);
      }
    };

    let graphcanvas = LGraphCanvas.active_canvas;
    if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
      fApplyMultiNode(node);
    } else {
      for (let i in graphcanvas.selected_nodes) {
        fApplyMultiNode(graphcanvas.selected_nodes[i]);
      }
    }
  }

  return false;
};

LGraphCanvas.onMenuNodeColors = function (value, options, e, menu, node) {
  if (!node) {
    throw "no node for color";
  }

  let values = [];
  values.push({
    value: null,
    content: "<span style='display: block; padding-left: 4px;'>No color</span>"
  });

  for (let i in LGraphCanvas.node_colors) {
    let color = LGraphCanvas.node_colors[i];
    let value = {
      value: i,
      content:
        "<span style='display: block; color: #999; padding-left: 4px; border-left: 8px solid " +
        color.color +
        "; background-color:" +
        color.bgcolor +
        "'>" +
        i +
        "</span>"
    };
    values.push(value);
  }
  new LiteGraph.ContextMenu(values, {
    event: e,
    callback: inner_clicked,
    parentMenu: menu,
    node: node
  });

  function inner_clicked(v) {
    if (!node) {
      return;
    }

    let color = v.value ? LGraphCanvas.node_colors[v.value] : null;

    let fApplyColor = function (node) {
      if (color) {
        if (node.constructor === LiteGraph.LGraphGroup) {
          node.color = color.groupcolor;
        } else {
          node.color = color.color;
          node.bgcolor = color.bgcolor;
        }
      } else {
        delete node.color;
        delete node.bgcolor;
      }
    };

    let graphcanvas = LGraphCanvas.active_canvas;
    if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
      fApplyColor(node);
    } else {
      for (let i in graphcanvas.selected_nodes) {
        fApplyColor(graphcanvas.selected_nodes[i]);
      }
    }
    node.setDirtyCanvas(true, true);
  }

  return false;
};

LGraphCanvas.onMenuNodeShapes = function (value, options, e, menu, node) {
  if (!node) {
    throw "no node passed";
  }

  new LiteGraph.ContextMenu(LiteGraph.VALID_SHAPES, {
    event: e,
    callback: inner_clicked,
    parentMenu: menu,
    node: node
  });

  function inner_clicked(v) {
    if (!node) {
      return;
    }
    node.graph.beforeChange(/*?*/); //node

    let fApplyMultiNode = function (node) {
      node.shape = v;
    };

    let graphcanvas = LGraphCanvas.active_canvas;
    if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
      fApplyMultiNode(node);
    } else {
      for (let i in graphcanvas.selected_nodes) {
        fApplyMultiNode(graphcanvas.selected_nodes[i]);
      }
    }

    node.graph.afterChange(/*?*/); //node
    node.setDirtyCanvas(true);
  }

  return false;
};

LGraphCanvas.onMenuNodeRemove = function (value, options, e, menu, node) {
  if (!node) {
    throw "no node passed";
  }

  let graph = node.graph;
  graph.beforeChange();

  let fApplyMultiNode = function (node) {
    if (node.removable === false) {
      return;
    }
    graph.remove(node);
  };

  let graphcanvas = LGraphCanvas.active_canvas;
  if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
    fApplyMultiNode(node);
  } else {
    for (let i in graphcanvas.selected_nodes) {
      fApplyMultiNode(graphcanvas.selected_nodes[i]);
    }
  }

  graph.afterChange();
  node.setDirtyCanvas(true, true);
};

LGraphCanvas.onMenuNodeToSubgraph = function (value, options, e, menu, node) {
  let graph = node.graph;
  let graphcanvas = LGraphCanvas.active_canvas;
  if (!graphcanvas)
    //??
    return;

  let nodes_list = Object.values(graphcanvas.selected_nodes || {});
  if (!nodes_list.length) nodes_list = [node];

  let subgraph_node = LiteGraph.createNode("graph/subgraph");
  subgraph_node.pos = node.pos.concat();
  graph.add(subgraph_node);

  subgraph_node.buildFromNodes(nodes_list);

  graphcanvas.deselectAllNodes();
  node.setDirtyCanvas(true, true);
};

LGraphCanvas.onMenuNodeClone = function (value, options, e, menu, node) {
  node.graph.beforeChange();

  let newSelected = {};

  let fApplyMultiNode = function (node) {
    if (node.clonable == false) {
      return;
    }
    let newnode = node.clone();
    if (!newnode) {
      return;
    }
    newnode.pos = [node.pos[0] + 5, node.pos[1] + 5];
    node.graph.add(newnode);
    newSelected[newnode.id] = newnode;
  };

  let graphcanvas = LGraphCanvas.active_canvas;
  if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1) {
    fApplyMultiNode(node);
  } else {
    for (let i in graphcanvas.selected_nodes) {
      fApplyMultiNode(graphcanvas.selected_nodes[i]);
    }
  }

  if (Object.keys(newSelected).length) {
    graphcanvas.selectNodes(newSelected);
  }

  node.graph.afterChange();

  node.setDirtyCanvas(true, true);
};

LGraphCanvas.node_colors = {
  red: { color: "#322", bgcolor: "#533", groupcolor: "#A88" },
  brown: { color: "#332922", bgcolor: "#593930", groupcolor: "#b06634" },
  green: { color: "#232", bgcolor: "#353", groupcolor: "#8A8" },
  blue: { color: "#223", bgcolor: "#335", groupcolor: "#88A" },
  pale_blue: {
    color: "#2a363b",
    bgcolor: "#3f5159",
    groupcolor: "#3f789e"
  },
  cyan: { color: "#233", bgcolor: "#355", groupcolor: "#8AA" },
  purple: { color: "#323", bgcolor: "#535", groupcolor: "#a1309b" },
  yellow: { color: "#432", bgcolor: "#653", groupcolor: "#b58b2a" },
  black: { color: "#222", bgcolor: "#000", groupcolor: "#444" }
};

LGraphCanvas.prototype.getCanvasMenuOptions = function () {
  let options = null;
  let that = this;
  if (this.getMenuOptions) {
    options = this.getMenuOptions();
  } else {
    options = [
      {
        content: "Add Node",
        has_submenu: true,
        callback: LGraphCanvas.onMenuAdd
      },
      { content: "Add Group", callback: LGraphCanvas.onGroupAdd }
      //{ content: "Arrange", callback: that.graph.arrange },
      //{content:"Collapse All", callback: LGraphCanvas.onMenuCollapseAll }
    ];
    /*if (LiteGraph.showCanvasOptions){
            options.push({ content: "Options", callback: that.showShowGraphOptionsPanel });
        }*/

    if (this._graph_stack && this._graph_stack.length > 0) {
      options.push(null, {
        content: "Close subgraph",
        callback: this.closeSubgraph.bind(this)
      });
    }
  }

  if (this.getExtraMenuOptions) {
    let extra = this.getExtraMenuOptions(this, options);
    if (extra) {
      options = options.concat(extra);
    }
  }

  return options;
};

//called by processContextMenu to extract the menu list
LGraphCanvas.prototype.getNodeMenuOptions = function (node) {
  let options = null;

  if (node.getMenuOptions) {
    options = node.getMenuOptions(this);
  } else {
    options = [
      {
        content: "Inputs",
        has_submenu: true,
        disabled: true,
        callback: LGraphCanvas.showMenuNodeOptionalInputs
      },
      {
        content: "Outputs",
        has_submenu: true,
        disabled: true,
        callback: LGraphCanvas.showMenuNodeOptionalOutputs
      },
      null,
      {
        content: "Properties",
        has_submenu: true,
        callback: LGraphCanvas.onShowMenuNodeProperties
      },
      null,
      {
        content: "Title",
        callback: LGraphCanvas.onShowPropertyEditor
      },
      {
        content: "Mode",
        has_submenu: true,
        callback: LGraphCanvas.onMenuNodeMode
      }
    ];
    if (node.resizable !== false) {
      options.push({
        content: "Resize",
        callback: LGraphCanvas.onMenuResizeNode
      });
    }
    options.push(
      {
        content: "Collapse",
        callback: LGraphCanvas.onMenuNodeCollapse
      },
      { content: "Pin", callback: LGraphCanvas.onMenuNodePin },
      {
        content: "Colors",
        has_submenu: true,
        callback: LGraphCanvas.onMenuNodeColors
      },
      {
        content: "Shapes",
        has_submenu: true,
        callback: LGraphCanvas.onMenuNodeShapes
      },
      null
    );
  }

  if (node.onGetInputs) {
    let inputs = node.onGetInputs();
    if (inputs && inputs.length) {
      options[0].disabled = false;
    }
  }

  if (node.onGetOutputs) {
    let outputs = node.onGetOutputs();
    if (outputs && outputs.length) {
      options[1].disabled = false;
    }
  }

  if (node.getExtraMenuOptions) {
    let extra = node.getExtraMenuOptions(this, options);
    if (extra) {
      extra.push(null);
      options = extra.concat(options);
    }
  }

  if (node.clonable !== false) {
    options.push({
      content: "Clone",
      callback: LGraphCanvas.onMenuNodeClone
    });
  }

  if (0)
    //TODO
    options.push({
      content: "To Subgraph",
      callback: LGraphCanvas.onMenuNodeToSubgraph
    });

  options.push(null, {
    content: "Remove",
    disabled: !(node.removable !== false && !node.block_delete),
    callback: LGraphCanvas.onMenuNodeRemove
  });

  if (node.graph && node.graph.onGetNodeMenuOptions) {
    node.graph.onGetNodeMenuOptions(options, node);
  }

  return options;
};

LGraphCanvas.prototype.getGroupMenuOptions = function (node) {
  let o = [
    { content: "Title", callback: LGraphCanvas.onShowPropertyEditor },
    {
      content: "Color",
      has_submenu: true,
      callback: LGraphCanvas.onMenuNodeColors
    },
    {
      content: "Font size",
      property: "font_size",
      type: "Number",
      callback: LGraphCanvas.onShowPropertyEditor
    },
    null,
    { content: "Remove", callback: LGraphCanvas.onMenuNodeRemove }
  ];

  return o;
};

LGraphCanvas.prototype.processContextMenu = function (node, event) {
  let that = this;
  let canvas = LGraphCanvas.active_canvas;
  let ref_window = canvas.getCanvasWindow();

  let menu_info = null;
  let options = {
    event: event,
    callback: inner_option_clicked,
    extra: node
  };

  if (node) options.title = node.type;

  //check if mouse is in input
  let slot = null;
  if (node) {
    slot = node.getSlotInPosition(event.canvasX, event.canvasY);
    LGraphCanvas.active_node = node;
  }

  if (slot) {
    //on slot
    menu_info = [];
    if (node.getSlotMenuOptions) {
      menu_info = node.getSlotMenuOptions(slot);
    } else {
      if (slot && slot.output && slot.output.links && slot.output.links.length) {
        menu_info.push({ content: "Disconnect Links", slot: slot });
      }
      let _slot = slot.input || slot.output;
      if (_slot.removable) {
        menu_info.push(_slot.locked ? "Cannot remove" : { content: "Remove Slot", slot: slot });
      }
      if (!_slot.nameLocked) {
        menu_info.push({ content: "Rename Slot", slot: slot });
      }
    }
    options.title = (slot.input ? slot.input.type : slot.output.type) || "*";
    if (slot.input && slot.input.type == LiteGraph.ACTION) {
      options.title = "Action";
    }
    if (slot.output && slot.output.type == LiteGraph.EVENT) {
      options.title = "Event";
    }
  } else {
    if (node) {
      //on node
      menu_info = this.getNodeMenuOptions(node);
    } else {
      menu_info = this.getCanvasMenuOptions();
      let group = this.graph.getGroupOnPos(event.canvasX, event.canvasY);
      if (group) {
        //on group
        menu_info.push(null, {
          content: "Edit Group",
          has_submenu: true,
          submenu: {
            title: "Group",
            extra: group,
            options: this.getGroupMenuOptions(group)
          }
        });
      }
    }
  }

  //show menu
  if (!menu_info) {
    return;
  }

  let menu = new LiteGraph.ContextMenu(menu_info, options, ref_window);

  function inner_option_clicked(v, options, e) {
    if (!v) {
      return;
    }

    if (v.content == "Remove Slot") {
      let info = v.slot;
      node.graph.beforeChange();
      if (info.input) {
        node.removeInput(info.slot);
      } else if (info.output) {
        node.removeOutput(info.slot);
      }
      node.graph.afterChange();
      return;
    } else if (v.content == "Disconnect Links") {
      let info = v.slot;
      node.graph.beforeChange();
      if (info.output) {
        node.disconnectOutput(info.slot);
      } else if (info.input) {
        node.disconnectInput(info.slot);
      }
      node.graph.afterChange();
      return;
    } else if (v.content == "Rename Slot") {
      let info = v.slot;
      let slot_info = info.input ? node.getInputInfo(info.slot) : node.getOutputInfo(info.slot);
      let dialog = that.createDialog(
        "<span class='name'>Name</span><input autofocus type='text'/><button>OK</button>",
        options
      );
      let input = dialog.querySelector("input");
      if (input && slot_info) {
        input.value = slot_info.label || "";
      }
      let inner = function () {
        node.graph.beforeChange();
        if (input.value) {
          if (slot_info) {
            slot_info.label = input.value;
          }
          that.setDirty(true);
        }
        dialog.close();
        node.graph.afterChange();
      };
      dialog.querySelector("button").addEventListener("click", inner);
      input.addEventListener("keydown", function (e) {
        dialog.is_modified = true;
        if (e.keyCode == 27) {
          //ESC
          dialog.close();
        } else if (e.keyCode == 13) {
          inner(); // save
        } else if (e.keyCode != 13 && e.target.localName != "textarea") {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      });
      input.focus();
    }

    //if(v.callback)
    //	return v.callback.call(that, node, options, e, menu, that, event );
  }
};

// monkey patch roundRect
// like rect but rounded corners

if (
  typeof window != "undefined" &&
  window.CanvasRenderingContext2D &&
  !window.CanvasRenderingContext2D.prototype.roundRect
) {
  window.CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radius, radius_low) {
    let top_left_radius = 0;
    let top_right_radius = 0;
    let bottom_left_radius = 0;
    let bottom_right_radius = 0;

    if (radius === 0) {
      this.rect(x, y, w, h);
      return;
    }

    if (radius_low === undefined) radius_low = radius;

    //make it compatible with official one
    if (radius != null && radius.constructor === Array) {
      if (radius.length == 1) top_left_radius = top_right_radius = bottom_left_radius = bottom_right_radius = radius[0];
      else if (radius.length == 2) {
        top_left_radius = bottom_right_radius = radius[0];
        top_right_radius = bottom_left_radius = radius[1];
      } else if (radius.length == 4) {
        top_left_radius = radius[0];
        top_right_radius = radius[1];
        bottom_left_radius = radius[2];
        bottom_right_radius = radius[3];
      } else return;
    } //old using numbers
    else {
      top_left_radius = radius || 0;
      top_right_radius = radius || 0;
      bottom_left_radius = radius_low || 0;
      bottom_right_radius = radius_low || 0;
    }

    //top right
    this.moveTo(x + top_left_radius, y);
    this.lineTo(x + w - top_right_radius, y);
    this.quadraticCurveTo(x + w, y, x + w, y + top_right_radius);

    //bottom right
    this.lineTo(x + w, y + h - bottom_right_radius);
    this.quadraticCurveTo(x + w, y + h, x + w - bottom_right_radius, y + h);

    //bottom left
    this.lineTo(x + bottom_right_radius, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bottom_left_radius);

    //top left
    this.lineTo(x, y + bottom_left_radius);
    this.quadraticCurveTo(x, y, x + top_left_radius, y);
  };
} //if

export default LGraphCanvas;
