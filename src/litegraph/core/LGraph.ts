import LiteGraph from './LiteGraph';
import LGraphCanvas from "./LGraphCanvas"
import LGraphNode, { LGraphNodeInfo } from "./LGraphNode";
import LGraphGroup from "./LGraphGroup"
import LLink, { LLinkInfo } from "./LLink";
import Subgraph from './Subgraph';

//*********************************************************************************
// LGraph CLASS
//*********************************************************************************

/**
 * LGraph is the class that contain a full graph. We instantiate one and add nodes to it, and then we can run the execution loop.
 * LGraph 是包含完整图的类。 我们实例化一个并向其添加节点，然后就可以运行执行循环了。
 * supported callbacks:
    + onNodeAdded: when a new node is added to the graph
    + onNodeRemoved: when a node inside this graph is removed
    + onNodeConnectionChange: some connection has changed in the graph (connected or disconnected)
 *
 * @class LGraph
 * @constructor
 * @param {Object} o data from previous serialization [optional]
 */

class LGraph {
  //default supported types
  static supported_types = ["number", "string", "boolean"];
  static STATUS_STOPPED = 1;
  static STATUS_RUNNING = 2;

  // 
  execution_time = 0
  execution_timer_id = -1;

  nodes_executing = [];
  nodes_actioning = [];
  nodes_executedAction = [];

  supported_types = ["number", "string", "boolean"];
  filter: string = "";
  catch_errors: boolean = false;
  config = {
    align_to_grid : false
  };
  extra = {}
  vars = {}

  elapsed_time: number = 0;
  fixedtime: number = 0;
  fixedtime_lapse: number = 0;
  globaltime: number = 0;
  runningtime: number = 0;
  starttime: number = 0;
  last_update_time = 0

  links: Record<number, LLink | null> = {};
  inputs: Record<string, any> = {};
  outputs: Record<string, any> = {};
  list_of_graphcanvas: LGraphCanvas[] = [];

  iteration: number = 0;
  last_link_id = 0;
  last_node_id = 0;

  _version = -1; //used to detect changes
  _input_nodes: LGraphNode[] = [];
  _subgraph_node: LGraphNode | null = null;
  _is_subgraph = false;
  
  status: typeof LGraph.STATUS_RUNNING | typeof LGraph.STATUS_STOPPED = LGraph.STATUS_STOPPED;

  // callback
  

  private _groups: LGraphGroup[] = [];
  _nodes: LGraphNode[] = [];
  private _nodes_in_order: LGraphNode[] = [];
  private _nodes_by_id: Record<number, LGraphNode> = {};
  /** nodes that are executable sorted in execution order */
  private _nodes_executable: LGraphNode[] | null = [];
  private _last_trigger_time = 0;

  constructor(o?: any) {

    if (LiteGraph.debug) {
      console.log("Graph created");
    }
    this.clear();

    if (o) {
      this.configure(o);
    }
  }
  //used to know which types of connections support this graph (some graphs do not allow certain types)
  getSupportedTypes() {
    return this.supported_types || LGraph.supported_types;
  };

  /**
  * Configure a graph from a JSON string
  */
  configure(data: any, keep_old = false) {
    if (!data) {
      return;
    }

    if (!keep_old) {
      this.clear();
    }

    let nodes = data.nodes;
    //decode links info (they are very verbose)
    if (data.links && data.links.constructor === Array) {
      const links: Record<string, LLink> = {};
      data.links.forEach((link_data: LLinkInfo) => {
        if (!link_data) {
          //weird bug
          console.warn("serialized graph link data contains errors, skipping.");
        } else {
          let link = new LLink();
          link.configure(link_data);
          links[link.id] = link;
        }
      })
      this.links = links;
    }

    // TODO 赋值各项属性

    let error = false;

    //create nodes
    this._nodes = [];
    if (nodes) {
      for (let i = 0, l = nodes.length; i < l; ++i) {
        let n_info = nodes[i]; //stored info
        let node = LiteGraph.createNode(n_info.type, n_info.title);
        if (!node) {
          if (LiteGraph.debug) {
            console.log("Node not found or has errors: " + n_info.type);
          }

          //in case of error we create a replacement node to avoid losing info
          node = new LGraphNode();
          node.last_serialization = n_info;
          node.has_errors = true;
          error = true;
          //continue;
        }

        node.id = n_info.id; //id it or it will create a new id
        this.add(node, true); //add before configure, otherwise configure cannot create links
      }

      //configure nodes afterwards so they can reach each other
      for (let i = 0, l = nodes.length; i < l; ++i) {
        let n_info = nodes[i];
        let node = this.getNodeById(n_info.id);
        if (node) {
          node.configure(n_info);
        }
      }
    }

    //groups
    this._groups.length = 0;
    if (data.groups) {
      for (let i = 0; i < data.groups.length; ++i) {
        let group = new LGraphGroup();
        group.configure(data.groups[i]);
        this.add(group, false);
      }
    }

    this.updateExecutionOrder();

    this.extra = data.extra || {};

    if (this.onConfigure) {
      this.onConfigure(data);
    }

    this._version++;
    this.setDirtyCanvas(true, true);
    return error;
  };

  
  
  /**
  * Removes all nodes from this graph
  * @method clear
  */

  clear() {
    this.stop();
    this.status = LGraph.STATUS_STOPPED;

    this.last_node_id = 0;
    this.last_link_id = 0;

    this._version = -1; //used to detect changes

    //safe clear
    if (this._nodes) {
      for (let i = 0; i < this._nodes.length; ++i) {
        let node = this._nodes[i];
        if (node.onRemoved) {
          node.onRemoved();
        }
      }
    }

    //nodes
    this._nodes = [];
    this._nodes_by_id = {};
    this._nodes_in_order = []; //nodes sorted in execution order
    this._nodes_executable = []; //nodes that contain onExecute sorted in execution order

    //other scene stuff
    this._groups = [];

    //links
    this.links = {}; //container with all the links

    //iterations
    this.iteration = 0;

    //custom data
    this.config = {
      align_to_grid: false
    };
    this.vars = {};
    this.extra = {}; //to store custom data

    //timing
    this.globaltime = 0;
    this.runningtime = 0;
    this.fixedtime = 0;
    this.fixedtime_lapse = 0.01;
    this.elapsed_time = 0.01;
    this.last_update_time = 0;
    this.starttime = 0;

    this.catch_errors = true;

    this.nodes_executing = [];
    this.nodes_actioning = [];
    this.nodes_executedAction = [];

    //subgraph_data
    this.inputs = {};
    this.outputs = {};

    //notify canvas to redraw
    this.change();

    this.sendActionToCanvas("clear");
  };

  /**
 
 * @method addGlobalInput
 
 */
  addInput(name: string, type: string, value?: any) {
    let input = this.inputs[name];
    if (input) {
      //already exist
      return;
    }
    this.beforeChange();
    this.inputs[name] = { name: name, type: type, value: value };
    this._version++;
    this.afterChange();

    if (this.onInputAdded) {
      this.onInputAdded(name, type);
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange();
    }
  };

  /**
   * Assign a data to the global graph input
   * @method setGlobalInputData
   * @param {String} name
   * @param {*} data
   */
  setInputData(name: string, data: any) {
    let input = this.inputs[name];
    if (!input) {
      return false;
    }
    input.value = data;
    return true;
  };

  /**
   * Returns the current value of a global graph input
   * @method getInputData
   * @param {String} name
   * @return {*} the data
   */
  getInputData(name:string) {
    let input = this.inputs[name];
    if (!input) {
      return null;
    }
    return input.value;
  };

  /**
   * Changes the name of a global graph input
   * @method renameInput
   * @param {String} old_name
   * @param {String} new_name
   */
  renameInput(old_name: string, name: string) {
    if (name == old_name) {
      return;
    }
    if (!this.inputs[old_name]) {
      return false;
    }

    if (this.inputs[name]) {
      console.error("there is already one input with that name");
      return false;
    }

    this.inputs[name] = this.inputs[old_name];
    delete this.inputs[old_name];
    this._version++;

    if (this.onInputRenamed) {
      this.onInputRenamed(old_name, name);
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange();
    }
    return true;
  };
  

  /**
   * Changes the type of a global graph input
   * @method changeInputType
   * @param {String} name
   * @param {String} type
   */
  changeInputType(name, type) {
    if (!this.inputs[name]) {
      return false;
    }

    if (this.inputs[name].type && String(this.inputs[name].type).toLowerCase() == String(type).toLowerCase()) {
      return;
    }

    this.inputs[name].type = type;
    this._version++;
    if (this.onInputTypeChanged) {
      this.onInputTypeChanged(name, type);
    }
  };


  /**
   * Removes a global graph input
   * @method removeInput
   * @param {String} name
   * @param {String} type
   */
  removeInput(name) {
    if (!this.inputs[name]) {
      return false;
    }

    delete this.inputs[name];
    this._version++;

    if (this.onInputRemoved) {
      this.onInputRemoved(name);
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange();
    }
    return true;
  };

  /**
   * Creates a global graph output
   * @method addOutput
   * @param {String} name
   * @param {String} type
   * @param {*} value
   */
  addOutput(name: string, type: string, value: any = {}) {
    this.outputs[name] = { name: name, type: type, value: value };
    this._version++;

    if (this.onOutputAdded) {
      this.onOutputAdded(name, type);
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange();
    }
  };

  /**
   * Assign a data to the global output
   * @method setOutputData
   * @param {String} name
   * @param {String} value
   */
  setOutputData(name, value) {
    let output = this.outputs[name];
    if (!output) {
      return;
    }
    output.value = value;
  };

  /**
   * Returns the current value of a global graph output
   * @method getOutputData
   * @param {String} name
   * @return {*} the data
   */
  getOutputData(name: string) {
    let output = this.outputs[name];
    if (!output) return null;
    return output.value;
  };

  /**
   * Renames a global graph output
   * @method renameOutput
   * @param {String} old_name
   * @param {String} new_name
   */
  renameOutput(old_name, name) {
    if (!this.outputs[old_name]) {
      return false;
    }

    if (this.outputs[name]) {
      console.error("there is already one output with that name");
      return false;
    }

    this.outputs[name] = this.outputs[old_name];
    delete this.outputs[old_name];
    this._version++;

    if (this.onOutputRenamed) {
      this.onOutputRenamed(old_name, name);
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange();
    }
  };
  

  /**
   * Changes the type of a global graph output
   */
  changeOutputType = function (name: string, type: string) {
    if (!this.outputs[name]) {
      return false;
    }

    if (this.outputs[name].type && String(this.outputs[name].type).toLowerCase() == String(type).toLowerCase()) {
      return;
    }

    this.outputs[name].type = type;
    this._version++;
    if (this.onOutputTypeChanged) {
      this.onOutputTypeChanged(name, type);
    }
  };

  /**
   * Removes a global graph output
   */
  removeOutput(name: string) {
    if (!this.outputs[name]) {
      return false;
    }
    delete this.outputs[name];
    this._version++;

    if (this.onOutputRemoved) {
      this.onOutputRemoved(name);
    }

    if (this.onInputsOutputsChange) {
      this.onInputsOutputsChange();
    }
    return true;
  };

  /**
 * Returns a node by its id.
 * @method getNodeById
 * @param {Number} id
 */

  getNodeById(id: number) {
    if (id == null) {
      return null;
    }
    return this._nodes_by_id[id];
  };

  sendActionToCanvas(action: string, params: any = {}) {
    if (!this.list_of_graphcanvas) {
      return false;
    }
    this.list_of_graphcanvas.forEach(canvas => {
      if (canvas[action as keyof typeof canvas]) {
        (canvas[action as keyof typeof canvas] as Function).apply(canvas, params);
      }
    })
    return true;
  };

  connectionChange(node: LGraphNode) {
    this.updateExecutionOrder();
    if (this.onConnectionChange) {
      this.onConnectionChange(node);
    }
    this._version++;
    this.sendActionToCanvas("onConnectionChange");
  };

  /**
 * Attach Canvas to this graph
 * @method attachCanvas
 * @param { LGraphCanvas} graph_canvas
 */

  attachCanvas(graphcanvas: LGraphCanvas) {
    if (graphcanvas.constructor != LGraphCanvas) {
      throw "attachCanvas expects a LGraphCanvas instance";
    }
    if (graphcanvas.graph && graphcanvas.graph != this) {
      graphcanvas.graph.detachCanvas(graphcanvas);
    }
    graphcanvas.graph = this;

    if (!this.list_of_graphcanvas) {
      this.list_of_graphcanvas = [];
    }
    this.list_of_graphcanvas.push(graphcanvas);
  };

  /**
   * Detach Canvas from this graph
   * @method detachCanvas
   * @param {GraphCanvas} graph_canvas
   */
  detachCanvas(graphcanvas: LGraphCanvas) {
    if (!this.list_of_graphcanvas) {
      return;
    }

    let pos = this.list_of_graphcanvas.indexOf(graphcanvas);
    if (pos == -1) {
      return;
    }
    graphcanvas.graph = null;
    this.list_of_graphcanvas.splice(pos, 1);
  };

  /**
 * Starts running this graph every interval milliseconds.
 * @method start
 * @param {number} interval amount of milliseconds between executions, if 0 then it renders to the monitor refresh rate
 */

  start(interval) {
    if (this.status == LGraph.STATUS_RUNNING) {
      return;
    }
    this.status = LGraph.STATUS_RUNNING;

    if (this.onPlayEvent) {
      this.onPlayEvent();
    }

    this.sendEventToAllNodes("onStart");

    //launch
    this.starttime = LiteGraph.getTime();
    this.last_update_time = this.starttime;
    interval = interval || 0;
    let that = this;

    //execute once per frame
    if (interval == 0 && typeof window != "undefined" && window.requestAnimationFrame) {
      const on_frame = () => {
        if (this.execution_timer_id != -1) {
          return;
        }
        window.requestAnimationFrame(on_frame);
        if (this.onBeforeStep) that.onBeforeStep();
        that.runStep(1, !that.catch_errors);
        if (this.onAfterStep) that.onAfterStep();
      }
      this.execution_timer_id = -1;
      on_frame();
    } else {
      //execute every 'interval' ms
      this.execution_timer_id = setInterval(function () {
        //execute
        if (that.onBeforeStep) that.onBeforeStep();
        that.runStep(1, !that.catch_errors);
        if (that.onAfterStep) that.onAfterStep();
      }, interval);
    }
  };


  /**
   * Stops the execution loop of the graph
   * @method stop execution
   */

  stop() {
    if (this.status == LGraph.STATUS_STOPPED) {
      return;
    }

    this.status = LGraph.STATUS_STOPPED;

    if (this.onStopEvent) {
      this.onStopEvent();
    }

    if (this.execution_timer_id != null) {
      if (this.execution_timer_id != -1) {
        clearInterval(this.execution_timer_id);
      }
      this.execution_timer_id = null;
    }

    this.sendEventToAllNodes("onStop");
  };


  /**
   * Run N steps (cycles) of the graph
   * @method runStep
   * @param {number} num number of steps to run, default is 1
   * @param {Boolean} do_not_catch_errors [optional] if you want to try/catch errors
   * @param {number} limit max number of nodes to execute (used to execute from start to a node)
   */

  runStep(num: number = 1, do_not_catch_errors = false, limit = 0) {
  
    let start = LiteGraph.getTime();
    this.globaltime = 0.001 * (start - this.starttime);

    let nodes = this._nodes_executable ? this._nodes_executable : this._nodes;
    if (!nodes) {
      return;
    }

    limit = limit || nodes.length;

    if (do_not_catch_errors) {
      //iterations
      for (let i = 0; i < num; i++) {
        for (let j = 0; j < limit; ++j) {
          let node = nodes[j];
          if (node.mode == LiteGraph.ALWAYS && node.onExecute) {
            //wrap node.onExecute();
            node.doExecute();
          }
        }

        this.fixedtime += this.fixedtime_lapse;
        if (this.onExecuteStep) {
          this.onExecuteStep();
        }
      }

      if (this.onAfterExecute) {
        this.onAfterExecute();
      }
    } else {
      try {
        //iterations
        for (let i = 0; i < num; i++) {
          for (let j = 0; j < limit; ++j) {
            let node = nodes[j];
            if (node.mode == LiteGraph.ALWAYS && node.onExecute) {
              node.onExecute();
            }
          }

          this.fixedtime += this.fixedtime_lapse;
          if (this.onExecuteStep) {
            this.onExecuteStep();
          }
        }

        if (this.onAfterExecute) {
          this.onAfterExecute();
        }
        // this.errors_in_execution = false;
      } catch (err) {
        // this.errors_in_execution = true;
        if (LiteGraph.throw_errors) {
          throw err;
        }
        if (LiteGraph.debug) {
          console.log("Error during execution: " + err);
        }
        this.stop();
      }
    }

    let now = LiteGraph.getTime();
    let elapsed = now - start;
    if (elapsed == 0) {
      elapsed = 1;
    }
    this.execution_time = 0.001 * elapsed;
    this.globaltime += 0.001 * elapsed;
    this.iteration += 1;
    this.elapsed_time = (now - this.last_update_time) * 0.001;
    this.last_update_time = now;
    this.nodes_executing = [];
    this.nodes_actioning = [];
    this.nodes_executedAction = [];
  };
  /**
   * Updates the graph execution order according to relevance of the nodes (nodes with only outputs have more relevance than
   * nodes with only inputs.
   * @method updateExecutionOrder
   */
  updateExecutionOrder() {
    this._nodes_in_order = this.computeExecutionOrder(false);
    this._nodes_executable = [];
    for (let i = 0; i < this._nodes_in_order.length; ++i) {
      if (this._nodes_in_order[i].onExecute) {
        this._nodes_executable.push(this._nodes_in_order[i]);
      }
    }
  };


  //This is more internal, it computes the executable nodes in order and returns it
  computeExecutionOrder(only_onExecute, set_level = false) {
    let L = [];
    let S = [];
    let M = {};
    let visited_links = {}; //to avoid repeating links
    let remaining_links = {}; //to a

    //search for the nodes without inputs (starting nodes)
    for (let i = 0, l = this._nodes.length; i < l; ++i) {
      let node = this._nodes[i];
      if (only_onExecute && !node.onExecute) {
        continue;
      }

      M[node.id] = node; //add to pending nodes

      let num = 0; //num of input connections
      if (node.inputs) {
        for (let j = 0, l2 = node.inputs.length; j < l2; j++) {
          if (node.inputs[j] && node.inputs[j].link != null) {
            num += 1;
          }
        }
      }

      if (num == 0) {
        //is a starting node
        S.push(node);
        if (set_level) {
          node._level = 1;
        }
      } //num of input links
      else {
        if (set_level) {
          node._level = 0;
        }
        remaining_links[node.id] = num;
      }
    }

    while (true) {
      if (S.length == 0) {
        break;
      }

      //get an starting node
      let node = S.shift();
      L.push(node); //add to ordered list
      delete M[node.id]; //remove from the pending nodes

      if (!node.outputs) {
        continue;
      }

      //for every output
      for (let i = 0; i < node.outputs.length; i++) {
        let output = node.outputs[i];
        //not connected
        if (output == null || output.links == null || output.links.length == 0) {
          continue;
        }

        //for every connection
        for (let j = 0; j < output.links.length; j++) {
          let link_id = output.links[j];
          let link = this.links[link_id];
          if (!link) {
            continue;
          }

          //already visited link (ignore it)
          if (visited_links[link.id]) {
            continue;
          }

          let target_node = this.getNodeById(link.target_id);
          if (target_node == null) {
            visited_links[link.id] = true;
            continue;
          }

          if (set_level && (!target_node._level || target_node._level <= node._level)) {
            target_node._level = node._level + 1;
          }

          visited_links[link.id] = true; //mark as visited
          remaining_links[target_node.id] -= 1; //reduce the number of links remaining
          if (remaining_links[target_node.id] == 0) {
            S.push(target_node);
          } //if no more links, then add to starters array
        }
      }
    }

    //the remaining ones (loops)
    for (let i in M) {
      L.push(M[i]);
    }

    if (L.length != this._nodes.length && LiteGraph.debug) {
      console.warn("something went wrong, nodes missing");
    }

    let l = L.length;

    //save order number in the node
    for (let i = 0; i < l; ++i) {
      L[i].order = i;
    }

    //sort now by priority
    L = L.sort(function (A, B) {
      let Ap = A.constructor.priority || A.priority || 0;
      let Bp = B.constructor.priority || B.priority || 0;
      if (Ap == Bp) {
        //if same priority, sort by order
        return A.order - B.order;
      }
      return Ap - Bp; //sort by priority
    });

    //save order number in the node, again...
    for (let i = 0; i < l; ++i) {
      L[i].order = i;
    }

    return L;
  };

  /**
   * Returns all the nodes that could affect this one (ancestors) by crawling all the inputs recursively.
   * It doesn't include the node itself
   * @method getAncestors
   * @return {Array} an array with all the LGraphNodes that affect this node, in order of execution
   */
  getAncestors(node: LGraphNode) {
    let ancestors = [];
    let pending = [node];
    let visited: Record<number, boolean> = {};

    while (pending.length) {
      let current = pending.shift();
      if (!current.inputs) {
        continue;
      }
      if (!visited[current.id] && current != node) {
        visited[current.id] = true;
        ancestors.push(current);
      }

      for (let i = 0; i < current.inputs.length; ++i) {
        let input = current.getInputNode(i);
        if (input && ancestors.indexOf(input) == -1) {
          pending.push(input);
        }
      }
    }

    ancestors.sort(function (a, b) {
      return a.order - b.order;
    });

    return ancestors;
  };


  /**
 * Positions every node in a more readable manner
 * @method arrange
 */
  arrange(margin, layout) {
    margin = margin || 100;

    let nodes = this.computeExecutionOrder(false, true);
    let columns = [];
    for (let i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      let col = node._level || 1;
      if (!columns[col]) {
        columns[col] = [];
      }
      columns[col].push(node);
    }

    let x = margin;

    for (let i = 0; i < columns.length; ++i) {
      let column = columns[i];
      if (!column) {
        continue;
      }
      let max_size = 100;
      let y = margin + LiteGraph.NODE_TITLE_HEIGHT;
      for (let j = 0; j < column.length; ++j) {
        const node = column[j];
        node.pos[0] = layout == LiteGraph.VERTICAL_LAYOUT ? y : x;
        node.pos[1] = layout == LiteGraph.VERTICAL_LAYOUT ? x : y;
        const max_size_index = layout == LiteGraph.VERTICAL_LAYOUT ? 1 : 0;
        if (node.size[max_size_index] > max_size) {
          max_size = node.size[max_size_index];
        }
        const node_size_index = layout == LiteGraph.VERTICAL_LAYOUT ? 0 : 1;
        y += node.size[node_size_index] + margin + LiteGraph.NODE_TITLE_HEIGHT;
      }
      x += max_size + margin;
    }

    this.setDirtyCanvas(true, true);
  };

  /**
   * Returns the amount of time the graph has been running in milliseconds
   * @method getTime
   * @return {number} number of milliseconds the graph has been running
   */
  getTime() {
    return this.globaltime;
  };

  /**
   * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
   * @method getFixedTime
   * @return {number} number of milliseconds the graph has been running
   */

  getFixedTime() {
    return this.fixedtime;
  };
  /**
   * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
   * if the nodes are using graphical actions
   * @method getElapsedTime
   * @return {number} number of milliseconds it took the last cycle
   */

  getElapsedTime() {
    return this.elapsed_time;
  };


  /**
   * Sends an event to all the nodes, useful to trigger stuff
   * @method sendEventToAllNodes
   * @param {String} event_name the name of the event (function to be called)
   * @param {Array} params parameters in array format
   */
  sendEventToAllNodes(event_name: string, params = [], mode = LiteGraph.ALWAYS) {

    let nodes = this._nodes_in_order ? this._nodes_in_order : this._nodes;
    if (!nodes) {
      return;
    }

    for (let j = 0, l = nodes.length; j < l; ++j) {
      let node = nodes[j];

      if ( node instanceof Subgraph && event_name != "onExecute") {
        if (node.mode == mode) {
          node.sendEventToAllNodes(event_name, params, mode);
        }
        continue;
      }

      if (!node[event_name] || node.mode != mode) {
        continue;
      }
      if (params === undefined) {
        node[event_name]();
      } else if (params && params.constructor === Array) {
        node[event_name].apply(node, params);
      } else {
        node[event_name](params);
      }
    }
  };


  /**
   * Adds a new node instance to this graph
   * @method add
   * @param {LGraphNode} node the instance of the node
   */

  add(node, skip_compute_order) {
    if (!node) {
      return;
    }

    //groups
    if (node.constructor === LGraphGroup) {
      this._groups.push(node);
      this.setDirtyCanvas(true, false);
      this.change();
      node.graph = this;
      this._version++;
      return;
    }

    //nodes
    if (node.id != -1 && this._nodes_by_id[node.id] != null) {
      console.warn("LiteGraph: there is already a node with this ID, changing it");
      node.id = ++this.last_node_id;
    }

    if (this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES) {
      throw "LiteGraph: max number of nodes in a graph reached";
    }

    //give him an id
    if (node.id == null || node.id == -1) {
      node.id = ++this.last_node_id;
    } else if (this.last_node_id < node.id) {
      this.last_node_id = node.id;
    }

    node.graph = this;
    this._version++;

    this._nodes.push(node);
    this._nodes_by_id[node.id] = node;

    if (node.onAdded) {
      node.onAdded(this);
    }

    if (this.config.align_to_grid) {
      node.alignToGrid();
    }

    if (!skip_compute_order) {
      this.updateExecutionOrder();
    }

    if (this.onNodeAdded) {
      this.onNodeAdded(node);
    }

    this.setDirtyCanvas(true);
    this.change();

    return node; //to chain actions
  };

  /**
 * Removes a node from the graph
 * @method remove
 * @param {LGraphNode} node the instance of the node
 */

  remove(node: LGraphNode | LGraphGroup) {
    if (node instanceof LGraphGroup) {
      let index = this._groups.indexOf(node);
      if (index != -1) {
        this._groups.splice(index, 1);
      }
      node.graph = null;
      this._version++;
      this.setDirtyCanvas(true, true);
      this.change();
      return false;
    }

    if (this._nodes_by_id[node.id] == null) {
      return false;
    } //not found

    if (node.ignore_remove) {
      return false;
    } //cannot be removed

    this.beforeChange(); //sure? - almost sure is wrong

    //disconnect inputs
    if ( node instanceof LGraphNode && node.inputs) {
      for (let i = 0; i < node.inputs.length; i++) {
        let slot = node.inputs[i];
        if (slot.link != null) {
          node.disconnectInput(i);
        }
      }
    }

    //disconnect outputs
    if (node instanceof LGraphNode && node.outputs) {
      for (let i = 0; i < node.outputs.length; i++) {
        let slot = node.outputs[i];
        if (slot.links != null && slot.links.length) {
          node.disconnectOutput(i);
        }
      }
    }

    //node.id = -1; //why?

    //callback
    if (node instanceof LGraphNode && node.onRemoved) {
      node.onRemoved();
    }

    node.graph = null;
    this._version++;

    //remove from canvas render
    if (this.list_of_graphcanvas) {
      for (let i = 0; i < this.list_of_graphcanvas.length; ++i) {
        let canvas = this.list_of_graphcanvas[i];
        if (canvas.selected_nodes[node.id]) {
          delete canvas.selected_nodes[node.id];
        }
        if (canvas.node_dragged == node) {
          canvas.node_dragged = null;
        }
      }
    }

    //remove from containers
    let pos = this._nodes.indexOf(node);
    if (pos != -1) {
      this._nodes.splice(pos, 1);
    }
    delete this._nodes_by_id[node.id];

    if (this.onNodeRemoved) {
      this.onNodeRemoved(node);
    }

    //close panels
    this.sendActionToCanvas("checkPanels");

    this.setDirtyCanvas(true, true);
    this.afterChange(); //sure? - almost sure is wrong
    this.change();

    this.updateExecutionOrder();
    return true;
  };




  /**
   * Returns a list of nodes that matches a class
   * @method findNodesByClass
   * @param {Class} classObject the class itself (not an string)
   * @return {Array} a list with all the nodes of this type
   */
  findNodesByClass(classObject, result) {
    result = result || [];
    result.length = 0;
    for (let i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].constructor === classObject) {
        result.push(this._nodes[i]);
      }
    }
    return result;
  };

  /**
   * Returns a list of nodes that matches a type
   * @method findNodesByType
   * @param {String} type the name of the node type
   * @return {Array} a list with all the nodes of this type
   */
  findNodesByType(type, result) {
    type = type.toLowerCase();
    result = result || [];
    result.length = 0;
    for (let i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].type.toLowerCase() == type) {
        result.push(this._nodes[i]);
      }
    }
    return result;
  };

  /**
   * Returns the first node that matches a name in its title
   * @method findNodeByTitle
   * @param {String} name the name of the node to search
   * @return {Node} the node or null
   */
  findNodeByTitle(title) {
    for (let i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].title == title) {
        return this._nodes[i];
      }
    }
    return null;
  };

  /**
   * Returns a list of nodes that matches a name
   * @method findNodesByTitle
   * @param {String} name the name of the node to search
   * @return {Array} a list with all the nodes with this name
   */
  findNodesByTitle(title: string) {
    let result = [];
    for (let i = 0, l = this._nodes.length; i < l; ++i) {
      if (this._nodes[i].title == title) {
        result.push(this._nodes[i]);
      }
    }
    return result;
  };


  /**
   * Returns the top-most node in this position of the canvas
   * @method getNodeOnPos
   * @param {number} x the x coordinate in canvas space
   * @param {number} y the y coordinate in canvas space
   * @param {Array} nodes_list a list with all the nodes to search from, by default is all the nodes in the graph
   * @return {LGraphNode} the node at this position or null
   */
  getNodeOnPos(x, y, nodes_list, margin) {
    nodes_list = nodes_list || this._nodes;
    let nRet = null;
    for (let i = nodes_list.length - 1; i >= 0; i--) {
      let n = nodes_list[i];
      if (n.isPointInside(x, y, margin)) {
        // check for lesser interest nodes (TODO check for overlapping, use the top)
        /*if (typeof n == "LGraphGroup"){
                    nRet = n;
                }else{*/
        return n;
        /*}*/
      }
    }
    return nRet;
  };



  /**
   * Returns the top-most group in that position
   * @method getGroupOnPos
   * @param {number} x the x coordinate in canvas space
   * @param {number} y the y coordinate in canvas space
   * @return {LGraphGroup} the group or null
   */
  getGroupOnPos(x, y) {
    for (let i = this._groups.length - 1; i >= 0; i--) {
      let g = this._groups[i];
      if (g.isPointInside(x, y, 2, true)) {
        return g;
      }
    }
    return null;
  };




  /**
   * Checks that the node type matches the node type registered, used when replacing a nodetype by a newer version during execution
   * this replaces the ones using the old version with the new version
   * @method checkNodeTypes
   */
  checkNodeTypes() {
    let changes = false;
    for (let i = 0; i < this._nodes.length; i++) {
      let node = this._nodes[i];
      let ctor = LiteGraph.registered_node_types[node.type];
      if (node.constructor == ctor) {
        continue;
      }
      console.log("node being replaced by newer version: " + node.type);
      let newnode = LiteGraph.createNode(node.type);
      changes = true;
      this._nodes[i] = newnode;
      newnode.configure(node.serialize());
      newnode.graph = this;
      this._nodes_by_id[newnode.id] = newnode;
      if (node.inputs) {
        newnode.inputs = node.inputs.concat();
      }
      if (node.outputs) {
        newnode.outputs = node.outputs.concat();
      }
    }
    this.updateExecutionOrder();
  };


  // ********** GLOBALS *****************

  

  trigger(action, param) {
    if (this.onTrigger) {
      this.onTrigger(action, param);
    }
  };



  triggerInput(name, value) {
    let nodes = this.findNodesByTitle(name);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].onTrigger(value);
    }
  };

  setCallback(name, func) {
    let nodes = this.findNodesByTitle(name);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].setTrigger(func);
    }
  };

  //used for undo, called before any change is made to the graph
  beforeChange(info = {}) {
    if (this.onBeforeChange) {
      this.onBeforeChange(this, info);
    }
    this.sendActionToCanvas("onBeforeChange", this);
  };
  
  //used to resend actions, called after any change is made to the graph
  afterChange(info = {}) {
    if (this.onAfterChange) {
      this.onAfterChange(this, info);
    }
    this.sendActionToCanvas("onAfterChange", this);
  };

  /**
   * returns if the graph is in live mode
   * @method isLive
   */

  isLive() {
    if (!this.list_of_graphcanvas) {
      return false;
    }

    for (let i = 0; i < this.list_of_graphcanvas.length; ++i) {
      let canvas = this.list_of_graphcanvas[i];
      if (canvas.live_mode) {
        return true;
      }
    }
    return false;
  };

  /**
   * clears the triggered slot animation in all links (stop visual animation)
   * @method clearTriggeredSlots
   */
  clearTriggeredSlots() {
    for (let i in this.links) {
      let link_info = this.links[i];
      if (!link_info) {
        continue;
      }
      if (link_info._last_time) {
        link_info._last_time = 0;
      }
    }
  };


  /* Called when something visually changed (not the graph!) */
  change() {
    if (LiteGraph.debug) {
      console.log("Graph changed");
    }
    this.sendActionToCanvas("setDirty", [true, true]);
    if (this.onChange) {
      this.onChange(this);
    }
  };

  /**
  * Destroys a link
  * @method removeLink
  * @param {Number} link_id
  */
  removeLink(link_id: number) {
    const link = this.links[link_id];
    if (!link) return false;
    const targetNode = this.getNodeById(link.target_id);
    if (!targetNode) return false;
    targetNode.disconnectInput(link.target_slot);
  };

  setDirtyCanvas(fg: boolean = false, bg: boolean = false) {
    this.sendActionToCanvas("setDirty", [fg, bg]);
  };

  //save and recover app state ***************************************
  /**
   * Creates a Object containing all the info about this graph, it can be serialized
   * @method serialize
   * @return {Object} value of the node
   */

  serialize() {
    let node_info_list: LGraphNodeInfo[] = [];
    for (let i = 0, l = this._nodes.length; i < l; ++i) {
      node_info_list.push(this._nodes[i].serialize());
    }
    //pack link info into a non-verbose format
    let links = [];
    for (let i in this.links) {
      // links is an OBJECT
      let link = this.links[i];
      if (link !== null) {
        links.push(link.serialize());
      }
    }
    let groups_info = [];
    for (let i = 0; i < this._groups.length; ++i) {
      groups_info.push(this._groups[i].serialize());
    }

    let data = {
      last_node_id: this.last_node_id,
      last_link_id: this.last_link_id,
      nodes: node_info_list,
      links: links,
      groups: groups_info,
      config: this.config,
      extra: this.extra,
      version: LiteGraph.VERSION
    };

    if (this.onSerialize) {
      this.onSerialize(data);
    }

    return data;
  };

  load(url: string | File, callback: Function) {
    // from file
    if (url.constructor === File || url.constructor === Blob) {
      let reader = new FileReader();
      reader.addEventListener("load", (event) => {
        let data = JSON.parse(event.target!.result as string);
        this.configure(data);
        if (callback) callback();
      });
      reader.readAsText(url);
      return true;
    }
    if (typeof url !== 'string') return false;
    //is a string, then an URL
    let req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.send(null);
    req.onload = () => {
      if (req.status !== 200) {
        console.error("Error loading graph:", req.status, req.response);
        return false;
      }
      try {
        const data = JSON.parse(req.response as string);
        this.configure(data);
      } catch (error) {
        console.error("Error loading graph:", error);
      }
      if (callback) callback();
      return true;
    };
    req.onerror = function (error) {
      console.error("Error loading graph:", error);
    };
    return true;
  };

  onAction(action: string, param = {}, options = {}) {
    this._input_nodes = this.findNodesByClass(LiteGraph.GraphInput, this._input_nodes);
    for (let i = 0; i < this._input_nodes.length; ++i) {
      let node = this._input_nodes[i];
      if (node.properties.name != action) {
        continue;
      }
      //wrap node.onAction(action, param);
      node.actionDo(action, param, options);
      break;
    }
  };

  onPlayEvent()  { };

  onInputAdded (name: string, type: string)  { };
  onInputRemoved (name: string)  { };
  onOutputAdded (name: string, type:string)  { };
  onOutputRemoved (name: string)  { };

  onInputsOutputsChange ()  { };

  onConnectionChange (node: LGraphNode)  { };
  onNodeAdded (node: LGraphNode)  { };
  onNodeRemoved (node: LGraphNode)  { };
  onNodeConnectionChange ()  { };

  onConfigure(data:any){}
  onBeforeStep(){}
  onAfterStep(){}
  onInputRenamed(old_name: string , new_name: string){}
  onInputTypeChanged(name: string ,type: string){}
  onOutputRenamed(old_name: string, new_name: string){}
  onStopEvent(){}
  onExecuteStep(){}
  onAfterExecute(){}
  onChange(graph: LGraph) { }
  onTrigger(action: string, param: any){}
  onSerialize(data: any) { }
  onOutputTypeChanged(){}
  onBeforeChange(graph: LGraph, info = {}){}
  onAfterChange(graph: LGraph, info = {}){}
  onNodeTrace(node: LGraphNode, msg: string, color: string = "#409eff") {}
}

export default LGraph;
