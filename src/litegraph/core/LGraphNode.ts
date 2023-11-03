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

import LLink from './LLink';
import LiteGraph from ".";
import LGraph from "./LGraph";


// *************************************************************
//   Node CLASS                                          *******
// *************************************************************

/*
  title: string
  pos: [x,y]
  size: [x,y]

  input|output: every connection
    +  { name:string, type:string, pos: [x,y]=Optional, direction: "input"|"output", links: Array });

general properties:
    + clip_area: if you render outside the node, it will be clipped
    + unsafe_execution: not allowed for safe execution
    + skip_repeated_outputs: when adding new outputs, it wont show if there is one already connected
    + resizable: if set to false it wont be resizable with the mouse
    + horizontal: slots are distributed horizontally
    + widgets_start_y: widgets start at y distance from the top of the node
	
flags object:
    + collapsed: if it is collapsed

supported callbacks:
    + onAdded: when added to graph (warning: this is called BEFORE the node is configured when loading)
    + onRemoved: when removed from graph
    + onStart:	when the graph starts playing
    + onStop:	when the graph stops playing
    + onDrawForeground: render the inside widgets inside the node
    + onDrawBackground: render the background area inside the node (only in edit mode)
    + onMouseDown
    + onMouseMove
    + onMouseUp
    + onMouseEnter
    + onMouseLeave
    + onExecute: execute the node
    + onPropertyChanged: when a property is changed in the panel (return true to skip default behaviour)
    + onGetInputs: returns an array of possible inputs
    + onGetOutputs: returns an array of possible outputs
    + onBounding: in case this node has a bigger bounding than the node itself (the callback receives the bounding as [x,y,w,h])
    + onDblClick: double clicked in the node
    + onInputDblClick: input slot double clicked (can be used to automatically create a node connected)
    + onOutputDblClick: output slot double clicked (can be used to automatically create a node connected)
    + onConfigure: called after the node has been configured
    + onSerialize: to add extra info when serializing (the callback receives the object that should be filled with the data)
    + onSelected
    + onDeselected
    + onDropItem : DOM item dropped over the node
    + onDropFile : file dropped over the node
    + onConnectInput : if returns false the incoming connection will be canceled
    + onConnectionsChange : a connection changed (new one or removed) (LiteGraph.INPUT or LiteGraph.OUTPUT, slot, true if connected, link_info, input_info )
    + onAction: action slot triggered
    + getExtraMenuOptions: to add option to context menu
*/

// Widget

interface Widget {
  name: string;
  type: string;
  value: any;
  callback: Function;
  options: any;
}

// Port
interface LGraphNodePortInfo {
  name: string;
  type: string;
  extra_info: any;
}

interface LGraphNodePort {
  name: string;
  type: string ;
  _data: any;
  [key: string]: any;
}

export interface LGraphNodePortInput extends LGraphNodePort {
  link: number | null;
}

export interface LGraphNodePortOutput extends LGraphNodePort {
  links: number[]
}


// Connection

interface LGraphConnection {
  name: string;
  type: string;
  pos: number[];
  links: number[] | null;
  direction: 'input' | 'output';

}

interface LGraphNodeOption {
  id?: number;
  title: string;
  type: string | null;
  pos: Float32Array;
  size: number[];
  order: string;
  mode: string;
  color: string;
  bgcolor: string;
  boxcolor: string;
  shape: string;
  subgraph: LGraph | null;
  flags: any[];
  inputs: LGraphNodePortInput[];
  outputs: LGraphNodePortOutput[];
  properties: Record<string, any>;
  widgets_values: any[];
}

function computeTextWidth(text: string, fontSize: number) {
  if (!text) {
    return 0;
  }
  return fontSize * text.length * 0.6;
}

function createPortInput(info: LGraphNodePortInfo): LGraphNodePortInput {
  const input: LGraphNodePortInput = { name: info.name, type: info.type, link: null, _data: {} };
  if (info.extra_info) {
    for (let key in info.extra_info) {
      input[key] = info.extra_info[key];
    }
  }
  return input
}

function createPortOutput(info: LGraphNodePortInfo): LGraphNodePortOutput {
  let output: LGraphNodePortOutput = { name: info.name, type: info.type, links: [], _data: {} };
  if (info.extra_info) {
    for (let key in info.extra_info) {
      output[key] = info.extra_info[key];
    }
  }
  return output;
}


/**
 * Base Class for all the node type classes
 * @class LGraphNode
 * @param {String} name a name for the node
 */
class LGraphNode {
  static title: string = "Unnamed";
  static type = null;
  static collapsable = true;
  static size = [LiteGraph.NODE_WIDTH, 60];
  static slot_start_y = 5;
  static widgets_start_y = 10;
  static min_height = 50;
  static widgets_info: Record<string, any> = {}
  static MAX_CONSOLE = 100;
  horizontal = false;
  title: string = "Unnamed";
  size: number[] = [LiteGraph.NODE_WIDTH, 60];
  graph!: LGraph | null = null;
  id = -1; //not know till not added
  type: string | null = null;
  color = ""
  bgcolor = ""
  boxcolor = "";
  shape = LiteGraph.BOX_SHAPE;
  
  ready = false;
  //inputs available: array of inputs
  widgets: Widget[] = [];
  inputs: LGraphNodePortInput[] = [];
  outputs: LGraphNodePortOutput[] = [];
  connections: LGraphConnection[] = [];
  console: string[] = [];
  //local data
  properties: any = {};  //for the values
  properties_info: any[] = []; //for the info
  flags = {
    collapsed: false
  };
  order = "";
  mode = "";
  serialize_widgets = true;
  last_serialization = {};

  pos: Float32Array = new Float32Array([10, 10]);

  private _pos: Float32Array = new Float32Array([10, 10]);
  private _last_trigger_time = 0;
  private _collapsed_width = 120;

  constructor(title: string) {
    this.title = title || "Unnamed";
    Object.defineProperty(this, "pos", {
      set: function (v) {
        if (!v || v.length < 2) {
          return;
        }
        this._pos[0] = v[0];
        this._pos[1] = v[1];
      },
      get: function () {
        return this._pos;
      },
      enumerable: true
    });
  }

  /**
   * serialize the content
   * @method serialize
   */

  serialize(): LGraphNodeOption {
    // create serialization object
    const o: LGraphNodeOption = {
      id: this.id,
      title: "",
      type: this.type,
      color: "",
      bgcolor: "",
      boxcolor: "",
      shape: "",
      order: this.order,
      mode: this.mode,
      pos: this.pos,
      size: this.size,
      flags: (LiteGraph as any).cloneObject(this.flags),
      inputs: [],
      outputs: [],
      properties: {},
      widgets_values: [],
    };

    //special case for when there were errors
    if (this.constructor === LGraphNode && this.last_serialization) {
      return this.last_serialization;
    }

    if (this.inputs) {
      o.inputs = this.inputs;
    }

    if (this.outputs) {
      // clear outputs last data (because data in connections is never serialized but stored inside the outputs info)
      for (let i = 0; i < this.outputs.length; i++) {
        delete this.outputs[i]._data;
      }
      o.outputs = this.outputs;
    }

    if (this.title && this.title != LGraphNode.title) {
      o.title = this.title;
    }

    if (this.properties) {
      o.properties = (LiteGraph as any).cloneObject(this.properties);
    }

    if (this.widgets && this.serialize_widgets) {
      for (let i = 0; i < this.widgets.length; ++i) {
        if (this.widgets[i]) {
          o.widgets_values[i] = this.widgets[i].value;
        } else {
          o.widgets_values[i] = null;
        }
      }
    }

    if (!o.type) {
      o.type = LGraphNode.type;
    }

    if (this.color) {
      o.color = this.color;
    }
    if (this.bgcolor) {
      o.bgcolor = this.bgcolor;
    }
    if (this.boxcolor) {
      o.boxcolor = this.boxcolor;
    }
    if (this.shape) {
      o.shape = this.shape;
    }

    if (this.onSerialize) {
      if (this.onSerialize(o)) {
        console.warn(
          "node onSerialize shouldnt return anything, data should be stored in the object pass in the first parameter"
        );
      }
    }

    return o;
  };

  /**
   * configure a node from an object containing the serialized info
   */
  configure(info: LGraphNodeOption) {
    if (this.graph) {
      this.graph._version++;
    }

    // i don't want to clone properties, I want to reuse the old container
    if (info.properties) {
      for (let k in info.properties) {
        this.properties[k] = info.properties[k];
        if (this.onPropertyChanged) {
          this.onPropertyChanged(k, info.properties[k]);
        }
      }
    }

    for (let j in info) {
      if (info[j] == null) {
        continue;
      } else if (typeof info[j] == "object") {
        //object
        if (this[j] && this[j].configure) {
          this[j].configure(info[j]);
        } else {
          this[j] = LiteGraph.cloneObject(info[j], this[j]);
        }
      } //value
      else {
        this[j] = info[j];
      }
    }

    if (!info.title) {
      this.title = LGraphNode.title;
    }

    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; ++i) {
        let input = this.inputs[i];
        let link_info = this.graph?.links[input!.link] || null;
        if (this.onConnectionsChange) {
          this.onConnectionsChange(LiteGraph.INPUT, i, true, link_info, input); //link_info has been created now, so its updated
        }

        if (this.onInputAdded) {
          this.onInputAdded(input);
        }
      }
    }

    if (this.outputs) {
      for (let i = 0; i < this.outputs.length; ++i) {
        let output = this.outputs[i];
        if (!output.links) {
          continue;
        }
        for (let j = 0; j < output.links.length; ++j) {
          let link_info = this.graph ? this.graph.links[output.links[j]] : null;
          if (this.onConnectionsChange) this.onConnectionsChange(LiteGraph.OUTPUT, i, true, link_info, output); //link_info has been created now, so its updated
        }

        if (this.onOutputAdded) this.onOutputAdded(output);
      }
    }

    if (this.widgets) {
      for (let i = 0; i < this.widgets.length; ++i) {
        let w = this.widgets[i];
        if (!w) continue;
        if (w.options && w.options.property && this.properties[w.options.property])
          w.value = JSON.parse(JSON.stringify(this.properties[w.options.property]));
      }
      if (info.widgets_values) {
        for (let i = 0; i < info.widgets_values.length; ++i) {
          if (this.widgets[i]) {
            this.widgets[i].value = info.widgets_values[i];
          }
        }
      }
    }

    if (this.onConfigure) {
      this.onConfigure(info);
    }
  };

  /**
 * add a new input slot to use in this node
 * @method addInput
 * @param {string} name
 * @param {string} type string defining the input type ("vec3","number",...), it its a generic one use 0
 * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
 */
  addInput(name: string, type: string , extra_info?: any) {
    const input = createPortInput({ name, type, extra_info })

    if (!this.inputs) {
      this.inputs = [];
    }
    this.inputs.push(input);

    this.setSize(this.computeSize());

    if (this.onInputAdded) {
      this.onInputAdded(input);
    }

    LiteGraph.prototype.registerNodeAndSlotType(this, type);

    this.setDirtyCanvas(true, true);
    return input;
  };

  /**
   * add several new input slots in this node
   */
  addInputs(infoList: LGraphNodePortInfo[]) {
    infoList.forEach(info => {
      const input = createPortInput(info)
      if (!this.inputs) {
        this.inputs = [];
      }

      this.inputs.push(input);
      if (this.onInputAdded) {
        this.onInputAdded(input);
      }
      LiteGraph.prototype.registerNodeAndSlotType(this, info.type);
    })
    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
  };

  /**
   * remove an existing input slot
   * @method removeInput
   * @param {number} slot
   */
  removeInput  (slot: number) {
    this.disconnectInput(slot);
    let slot_info = this.inputs.splice(slot, 1);
    for (let i = slot; i < this.inputs.length; ++i) {
      if (!this.inputs[i]) {
        continue;
      }
      let link = this.graph.links[this.inputs[i].link];
      if (!link) {
        continue;
      }
      link.target_slot -= 1;
    }
    this.setSize(this.computeSize());
    if (this.onInputRemoved) {
      this.onInputRemoved(slot, slot_info[0]);
    }
    this.setDirtyCanvas(true, true);
  };


  /**
   * add a new output slot to use in this node
   * @method addOutput
   * @param {string} name
   * @param {string} type string defining the output type ("vec3","number",...)
   * @param {Object} extra_info this can be used to have special properties of an output (label, special color, position, etc)
   */
  addOutput(name: string, type: string, extra_info?: any) {
    const output: LGraphNodePortOutput = createPortOutput({ name, type, extra_info });
    if (!this.outputs) {
      this.outputs = [];
    }
    this.outputs.push(output);
    // 
    if (this.onOutputAdded) {
      this.onOutputAdded(output);
    }
    if (LiteGraph.prototype.auto_load_slot_types) {
      LiteGraph.prototype.registerNodeAndSlotType(this, type, true);
    }
    // 
    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
    return output;
  };

  /**
   * add a new output slot to use in this node
   * @method addOutputs
   * @param {Array} infoList of triplets like [[name,type,extra_info],[...]]
   */
  addOutputs(infoList: LGraphNodePortInfo[]) {
    infoList.forEach(info => {
      let output = createPortOutput(info)
      if (!this.outputs) {
        this.outputs = [];
      }
      this.outputs.push(output);

      if (this.onOutputAdded) {
        this.onOutputAdded(output);
      }
      if (LiteGraph.prototype.auto_load_slot_types) {
        LiteGraph.prototype.registerNodeAndSlotType(this, info.type, true);
      }
    })
    // 
    this.setSize(this.computeSize());
    this.setDirtyCanvas(true, true);
  };

  /**
   * remove an existing output slot
   * @method removeOutput
   * @param {number} slot
   */
  removeOutput  (slot: number) {
    this.disconnectOutput(slot);
    this.outputs.splice(slot, 1);
    for (let i = slot; i < this.outputs.length; ++i) {
      if (!this.outputs[i] || !this.outputs[i].links) {
        continue;
      }
      let links = this.outputs[i].links;
      for (let j = 0; j < links.length; ++j) {
        let link = this.graph.links[links[j]];
        if (!link) {
          continue;
        }
        link.origin_slot -= 1;
      }
    }

    this.setSize(this.computeSize());
    if (this.onOutputRemoved) {
      this.onOutputRemoved(slot);
    }
    this.setDirtyCanvas(true, true);
  };


  /**
   * serialize and stringify
   */
  toString() {
    return JSON.stringify(this.serialize());
  };

  /**
   * get the title string
   * @method getTitle
   */

  getTitle() {
    return this.title || LGraphNode.title;
  };

  /**
  * sets the value of a property
  * @method setProperty
  * @param {String} name
  * @param {*} value
  */
  setProperty(name: string, value: any) {
    if (!this.properties) {
      this.properties = {};
    }
    if (value === this.properties[name]) {
      // the same
      return;
    }
    const prev_value = this.properties[name];
    this.properties[name] = value;

    if (this.onPropertyChanged) {
      if (this.onPropertyChanged(name, value, prev_value) === false) {
        // abort change
        this.properties[name] = prev_value;
      }
    }
    // 把属性设置到 widget 上
    this.widgets?.forEach(widget => {
      if (widget.options.property == name) {
        widget.value = value;
      }
    })
  };


  //====== connections ======
  /**
   * add an special connection to this node (used for special kinds of graphs)
   * @method addConnection
   * @param {string} name
   * @param {string} type string defining the input type ("vec3","number",...)
   * @param {[x,y]} pos position of the connection inside the node
   * @param {string} direction if is input or output
   */
  addConnection(name: string, type: string, pos: number[], direction: 'input' | 'output') {
    const connection: LGraphConnection = {
      name: name,
      type: type,
      pos: pos,
      direction: direction,
      links: []
    };
    this.connections.push(connection);
    return connection;
  };

  /**
* Retrieves the input data (data traveling through the connection) from one slot
* @method getInputData
* @param {number} slot
* @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
* @return {*} data or if it is not connected returns undefined
*/
  getInputData(slot: number, force_update: boolean = false) {
    if (!this.inputs) {
      return false;
    } //undefined;

    if (slot < 0 || slot >= this.inputs.length) {
      return false;
    }

    const link_id = this.inputs[slot].link;
    if (link_id === null) {
      return false;
    }

    const link = this.graph!.links[link_id];
    if (!link) {
      // bug: weird case but it happens sometimes
      return false;
    }

    if (!force_update) {
      return link.getData();
    }

    // special case: used to extract data from the incoming connection before the graph has been executed
    const node = this.graph!.getNodeById(link.origin_id);
    if (!node) {
      return link.getData();
    }

    if (node.updateOutputData) {
      node.updateOutputData(link.origin_slot);
    } else if (node.onExecute) {
      node.onExecute();
    }
    return link.getData();
  };

  /**
   * Retrieves the input data type (in case this supports multiple input types)
   * @param {number} slot
   * @return {String} datatype in string format
   */
  getInputDataType(slot: number) {
    if (!this.inputs) {
      return null;
    }
    if (slot < 0 || slot >= this.inputs.length) {
      return false;
    }
    let link_id = this.inputs[slot].link;
    if (link_id === null) {
      return false;
    }
    let link = this.graph!.links[link_id];
    if (!link) {
      //bug: weird case but it happens sometimes
      return null;
    }
    let node = this.graph!.getNodeById(link.origin_id);
    if (!node) {
      return link.type;
    }
    let output_info = node.outputs[link.origin_slot];
    if (output_info) {
      return output_info.type;
    }
    return null;
  };

  /**
   * Retrieves the input data from one slot using its name instead of slot number
   * @method getInputDataByName
   * @param {String} slot_name
   * @param {boolean} force_update if set to true it will force the connected node of this slot to output data into this link
   * @return {*} data or if it is not connected returns null
   */
  getInputDataByName = function (slot_name: string, force_update: boolean = false;) {
    let slot = this.findInputSlot(slot_name);
    if (slot == -1) {
      return null;
    }
    return this.getInputData(slot, force_update);
  };

  /* Creates a clone of this node */
  clone(): LGraphNode | null {
    if (this.type === null) {
      return null;
    }
    const node = LiteGraph.prototype.createNode(this.type);
    if (!node) {
      return null;
    }
    //we clone it because serialize returns shared containers
    const data: LGraphNodeOption = LiteGraph.cloneObject(this.serialize());
    // remove links
    data.inputs?.forEach((input: LGraphNodePortInput) => {
      input.link = null;
    })
    data.outputs?.forEach((output: LGraphNodePortOutput) => {
      output.links = [];
    })
    // remove id
    data.id = undefined;
    // configure
    node.configure(data);
    return node;
  };


  // Execution *************************
  /**
   * sets the output data
   * @method setOutputData
   * @param { number } slotIndex
   * @param { * } data
   */
  setOutputData(slotIndex: number, data: any) {
    if (!this.outputs) {
      return false;
    }
    // this maybe slow and a niche case
    // if(slot && slot.constructor === String)
    // slot = this.findOutputSlot(slot);
    if (slotIndex < 0 || slotIndex >= this.outputs.length) {
      return false;
    }

    let output_info = this.outputs[slotIndex];
    if (!output_info) {
      return false;
    }

    // store data in the output itself in case we want to debug
    output_info._data = data;

    // if there are connections, pass the data to the connections
    output_info.links.forEach(link_id => {
      let link = this.graph!.links[link_id];
      if (link) link.data = data;
    })
  };

  /**
   * 设置输出数据类型，当您希望能够覆盖数据类型时很有用
   * @method setOutputDataType
   * @param { number } slot
   * @param { string } datatype
   */
  setOutputDataType(slot: number, type: string) {
    if (!this.outputs) {
      return false;
    }
    if (slot < 0 || slot >= this.outputs.length) {
      return false;
    }
    let output_info = this.outputs[slot];
    if (!output_info) {
      return;
    }
    //store data in the output itself in case we want to debug
    output_info.type = type;

    //if there are connections, pass the data to the connections
    if (this.outputs[slot].links) {
      for (let i = 0; i < this.outputs[slot].links.length; i++) {
        let link_id = this.outputs[slot].links[i];
        this.graph.links[link_id].type = type;
      }
    }
  };

  /**
   * 判断一个输入槽中是否有连接
   * @method isInputConnected
   * @param {number} slot
   * @return {boolean}
   */
  isInputConnected(slot: number) {
    if (!this.inputs) {
      return false;
    }
    if (slot < 0 || slot >= this.inputs.length) {
      return false;
    }
    return this.inputs[slot].link != null
  };

  /**
   * tells you info about an input connection (which node, type, etc)
   */
  getInputInfo(slotIndex: number) {
    if (!this.inputs) {
      return null;
    }
    if (slotIndex < 0 || slotIndex >= this.inputs.length) {
      return null;
    }
    return this.inputs[slotIndex];
  };

  /**
   * Returns the link info in the connection of an input slot
   */
  getInputLink(slotIndex: number) {
    if (!this.inputs) {
      return null;
    }
    if (slotIndex < 0 || slotIndex >= this.inputs.length) {
      return null;
    }
    let slot_info = this.inputs[slotIndex];
    if (slot_info.link === null) {
      return null;
    }
    return this.graph!.links[slot_info.link];
  };

  /**
   * returns the node connected in the input slot
   * @method getInputNode
   * @param {number} slotIndex
   * @return {LGraphNode} node or null
   */
  getInputNode(slotIndex: number) {
    if (!this.inputs) {
      return null;
    }
    if (slotIndex < 0 || slotIndex >= this.inputs.length) {
      return null;
    }
    const input = this.inputs[slotIndex];
    if (!input || input.link === null) {
      return null;
    }
    let link_info = this.graph!.links[input.link];
    if (!link_info) {
      return null;
    }
    return this.graph!.getNodeById(link_info.origin_id);
  };

  /**
   * returns the value of an input with this name, otherwise checks if there is a property with that name
   */
  getInputOrProperty(name: string) {
    if (!this.inputs || !this.inputs.length) {
      return this.properties ? this.properties[name] : null;
    }
    for (let i = 0; i < this.inputs.length; ++i) {
      let input_info = this.inputs[i];
      if (name == input_info.name && input_info.link != null) {
        let link = this.graph!.links[input_info.link];
        if (link) {
          return link.data;
        }
      }
    }
    return this.properties[name];
  };
  /**
 * tells you the last output data that went in that slot
 * @method getOutputData
 * @param {number} slot
 * @return {Object}  object or null
 */
  getOutputData(slot: number): object | null {
    const output = this.getOutputInfo(slot);
    return output!._data || null;
  };

  /**
 * tells you info about an output connection (which node, type, etc)
 * @method getOutputInfo
 * @param {number} slot
 * @return {Object}  object or null { name: string, type: string, links: [ ids of links in number ] }
 */
  getOutputInfo(slot: number) {
    if (!this.outputs) {
      return null;
    }
    if (slot < 0 || slot >= this.outputs.length) {
      return null;
    }
    return this.outputs[slot];
  };

  /**
   * tells you if there is a connection in one output slot
   */
  isOutputConnected(slot: number) {
    if (!this.outputs) {
      return false;
    }
    if (slot < 0 || slot >= this.outputs.length) {
      return false;
    }
    return this.outputs[slot].links && this.outputs[slot].links.length > 0;
  };

  /**
 * tells you if there is any connection in the output slots
 */
  isAnyOutputConnected() {
    if (!this.outputs) {
      return false;
    }
    return this.outputs.some(output => {
      return output.links.length > 0
    })
  };

  /**
   * retrieves all the nodes connected to this output slot
   * @method getOutputNodes
   * @param {number} slot
   * @return {array}
   */
  getOutputNodes(slot: number) {
    if (!this.outputs || this.outputs.length == 0) {
      return [];
    }
    if (slot >= this.outputs.length) {
      return [];
    }
    const output = this.outputs[slot];
    if (!output.links || output.links.length == 0) {
      return [];
    }
    const result: LGraphNode[] = [];
    output.links.forEach(link_id => {
      let link = this.graph.links[link_id];
      if (link) {
        let target_node: LGraphNode = this.graph.getNodeById(link.target_id);
        if (target_node) {
          result.push(target_node);
        }
      }
    })

    return result;
  };


  addOnTriggerInput() {
    let trigS = this.findInputSlot("onTrigger");
    if (trigS == -1) {
      //!trigS ||
      let input = this.addInput("onTrigger", LiteGraph.EVENT, { optional: true, nameLocked: true });
      return this.findInputSlot("onTrigger");
    }
    return trigS;
  };

  addOnExecutedOutput(): number {
    let trigS = this.findOutputSlot("onExecuted", false) as number;
    if (trigS == -1) {
      this.addOutput("onExecuted", LiteGraph.ACTION, { optional: true, nameLocked: true });
      return this.findOutputSlot("onExecuted", false) as number;
    }
    return trigS;
  };

  onAfterExecuteNode(param, options) {
    let trigS = this.findOutputSlot("onExecuted");
    if (trigS != -1) {
      //console.debug(this.id+":"+this.order+" triggering slot onAfterExecute");
      //console.debug(param);
      //console.debug(options);
      this.triggerSlot(trigS, param, null, options);
    }
  };

  changeMode(modeTo) {
    switch (modeTo) {
      case LiteGraph.ON_EVENT:
        // this.addOnExecutedOutput();
        break;

      case LiteGraph.ON_TRIGGER:
        this.addOnTriggerInput();
        this.addOnExecutedOutput();
        break;

      case LiteGraph.NEVER:
        break;

      case LiteGraph.ALWAYS:
        break;

      case LiteGraph.ON_REQUEST:
        break;

      default:
        return false;
        break;
    }
    this.mode = modeTo;
    return true;
  };


  /**
   * Defines a widget inside the node, it will be rendered on top of the node, you can control lots of properties
   *
   * @method addWidget
   * @param {String} type the widget type (could be "number","string","combo"
   * @param {String} name the text to show on the widget
   * @param {String} value the default value
   * @param {Function|String} callback function to call when it changes (optionally, it can be the name of the property to modify)
   * @param {Object} options the object that contains special properties of this widget
   * @return {Object} the created widget object
   */
  addWidget(type: string, name: string, value: number | string, callback: Function | null, options: any = {}) {
    if (!this.widgets) {
      this.widgets = [];
    }

    if (!options && callback && callback.constructor === Object) {
      options = callback;
      callback = null;
    }

    if (options && options.constructor === String) {
      // options can be the property name
      options = { property: options };
    }

    if (callback && callback.constructor === String) {
      //callback can be the property name
      if (!options) options = {};
      options.property = callback;
      callback = null;
    }

    if (callback && callback.constructor !== Function) {
      console.warn("addWidget: callback must be a function");
      callback = null;
    }

    const widget = {
      type: type.toLowerCase(),
      name: name,
      value: value,
      callback: callback,
      options: options || {},
      y: ''
    };

    if (widget.options.y !== undefined) {
      widget.y = widget.options.y;
    }

    if (!callback && !widget.options.callback && !widget.options.property) {
      console.warn("LiteGraph addWidget(...) without a callback or property assigned");
    }
    if (type == "combo" && !widget.options.values) {
      throw "LiteGraph addWidget('combo',...) requires to pass values in options: { values:['red','blue'] }";
    }
    this.widgets.push(widget);
    this.setSize(this.computeSize());
    return widget;
  };

  addCustomWidget(custom_widget: any) {
    if (!this.widgets) {
      this.widgets = [];
    }
    this.widgets.push(custom_widget);
    return custom_widget;
  };

  /**
   * returns the input slot with a given name (used for dynamic slots), -1 if not found
   * @method findInputSlot
   * @param {string} name the name of the slot
   * @param {boolean} returnPort if the obj itself wantedd)
   */
  findInputSlot(name: string, returnPort: boolean = false): number | LGraphNodePortInput {
    if (!this.inputs) {
      return -1;
    }
    for (let i = 0, l = this.inputs.length; i < l; ++i) {
      if (name == this.inputs[i].name) {
        return returnPort ? this.inputs[i] : i;
      }
    }
    return -1;
  };


  /**
   * Collapse the node to make it smaller on the canvas
   *  - 折叠节点以使其在画布上变小
   **/
  collapse(force: boolean = false) {
    this.graph!._version++;
    if (LGraphNode.collapsable === false && !force) {
      return false;
    }
    this.flags.collapsed = !this.flags.collapsed;
    this.setDirtyCanvas(true, true);
    return true;
  };

  /**
   * Forces the node to do not move or realign on Z
   * @method pin
   **/
  pin(v: boolean) {
    this.graph!._version++;
    if (v === undefined) {
      this.flags.pinned = !this.flags.pinned;
    } else {
      this.flags.pinned = v;
    }
  };

  /**
   * 输入相对节点左上角的坐标，返回在画布中的坐标
   * @param x 
   * @param y 
   * @param graphcanvas 
   * @returns 
   */
  localToScreen(x, y, graphcanvas) {
    return [
      (x + this.pos[0]) * graphcanvas.scale + graphcanvas.offset[0],
      (y + this.pos[1]) * graphcanvas.scale + graphcanvas.offset[1]
    ];
  };

  /**
   * 触发节点代码执行，放置一个布尔值/计数器来标记节点正在执行
   */
  doExecute(param: any, options: any = {}) {
    options = options || {};
    if (this.onExecute) {
      // enable this to give the event an ID
      if (!options.action_call) {
        options.action_call = this.id + "_exec_" + Math.floor(Math.random() * 9999);
      }

      this.graph.nodes_executing[this.id] = true; //.push();
      this.onExecute(param, options);
      this.graph.nodes_executing[this.id] = false; //.pop();

      // save execution/action ref
      this.exec_version = this.graph.iteration;
      if (options && options.action_call) {
        this.action_call = options.action_call; // if (param)
        this.graph.nodes_executedAction[this.id] = options.action_call;
      }
    }
    this.execute_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
    if (this.onAfterExecuteNode) {
      this.onAfterExecuteNode(param, options); // callback
    }
  };

  /**
  * Triggers an action, wrapped by logics to control execution flow
  * @method actionDo
  * @param {String} action name
  * @param {*} param
  */
  actionDo(action: string, param: any, options: any = {}) {
    options = options || {};
    if (this.onAction) {
      // enable this to give the event an ID
      if (!options.action_call) {
        options.action_call = this.id + "_" + (action ? action : "action") + "_" + Math.floor(Math.random() * 9999);
      }

      this.graph.nodes_actioning[this.id] = action ? action : "actioning"; //.push(this.id);
      this.onAction(action, param, options);
      this.graph.nodes_actioning[this.id] = false; //.pop();

      // save execution/action ref
      if (options && options.action_call) {
        this.action_call = options.action_call; // if (param)
        this.graph.nodes_executedAction[this.id] = options.action_call;
      }
    }
    this.action_triggered = 2; // the nFrames it will be used (-- each step), means "how old" is the event
    if (this.onAfterExecuteNode) this.onAfterExecuteNode(param, options);
  };
  /**
   * Triggers an event in this node, this will trigger any output with the same name
   * 触发该节点中的事件，这将触发任何同名的输出
   * @method trigger
   * @param {String} event name ( "on_play", ... ) if action is equivalent to false then the event is send to all
   * @param {*} param
   */
  trigger(action: string, param, options) {
    if (!this.outputs || !this.outputs.length) {
      return false;
    }

    if (this.graph) {
      this.graph._last_trigger_time = LiteGraph.getTime();
    }

    for (let i = 0; i < this.outputs.length; ++i) {
      let output = this.outputs[i];
      if (!output || output.type !== LiteGraph.EVENT || (action && output.name != action)) continue;
      this.triggerSlot(i, param, null, options);
    }
  };

  /**
   * Triggers a slot event in this node: cycle output slots and launch execute/action on connected nodes
   * 在此节点中触发槽事件：循环输出槽并在连接的节点上启动执行/操作
   * @method triggerSlot
   * @param {Number} slot the index of the output slot
   * @param {*} param
   * @param {Number} link_id [optional] in case you want to trigger and specific output link in a slot
   */
  triggerSlot(slot: number, param: any, link_id?: number, options: any = {}) {

    if (!this.outputs) {
      return false;
    }
    let output = this.outputs[slot];
    if (!output) {
      return false;
    }

    let links = output.links;
    if (!links || !links.length) {
      return false;
    }

    if (this.graph) {
      this.graph._last_trigger_time = LiteGraph.getTime();
    }

    //for every link attached here
    for (let k = 0; k < links.length; ++k) {
      let id = links[k];
      if (link_id != null && link_id != id) {
        //to skip links
        continue;
      }
      let link_info = this.graph!.links[links[k]];

      if (!link_info) {
        //not connected
        continue;
      }

      link_info._last_time = LiteGraph.getTime();
      let node = this.graph.getNodeById(link_info.target_id);
      if (!node) {
        //node not found?
        continue;
      }

      //used to mark events in graph
      let target_connection = node.inputs[link_info.target_slot];

      if (node.mode === LiteGraph.ON_TRIGGER) {
        // generate unique trigger ID if not present
        if (!options.action_call) options.action_call = this.id + "_trigg_" + Math.floor(Math.random() * 9999);
        if (node.onExecute) {
          // -- wrapping node.onExecute(param); --
          node.doExecute(param, options);
        }
      } else if (node.onAction) {
        // generate unique action ID if not present
        if (!options.action_call) options.action_call = this.id + "_act_" + Math.floor(Math.random() * 9999);
        //pass the action name
        let target_connection = node.inputs[link_info.target_slot];
        // wrap node.onAction(target_connection.name, param);
        node.actionDo(target_connection.name, param, options);
      }
    }
  };
  /**
   * 清除触发槽动画
   * @param { number } slot 输出端口的下标
   * @param { number } link_id [可选]如果您想在插槽中触发特定输出链接
   */
  clearTriggeredSlot(slot: number, link_id: number) {
    if (!this.outputs) {
      return false;
    }
    let output = this.outputs[slot];
    if (!output) {
      return false;
    }

    let links = output.links;
    if (!links || !links.length) {
      return false;
    }

    // for every link attached here
    for (let k = 0; k < links.length; ++k) {
      let id = links[k];
      if (link_id != null && link_id != id) {
        //to skip links
        continue;
      }
      let link_info = this.graph.links[links[k]];
      if (!link_info) {
        //not connected
        continue;
      }
      link_info._last_time = 0;
    }
    return true;
  };

  /**
 * 修改节点的大小
 * @method setSize
 * @param {vec2} size
 */
  setSize(size: number[]) {
    this.size = size;
    if (this.onResize) {
      this.onResize(this.size);
    }
  };

  /**
 * 给这个节点添加一个属性
 * @method addProperty
 * @param {string} name 属性的名称
 * @param {*} default_value 属性的值
 * @param {string} type 属性的输出端口类型 比如 ("string","number",...)
 * @param {Object} extra_info 属性的额外信息
 */
  addProperty(name: string, default_value: any, type: string, extra_info: object) {
    const o = { name: name, type: type, default_value: default_value };
    if (extra_info) {
      for (let i in extra_info) {
        o[i] = extra_info[i];
      }
    }
    if (!this.properties_info) {
      this.properties_info = [];
    }
    this.properties_info.push(o);
    if (!this.properties) {
      this.properties = {};
    }
    this.properties[name] = default_value;
    return o;
  };

  /**
   * 根据节点的输入槽和输出槽的数量计算节点的最小大小
   */
  computeSize(minSize: number[] = LGraphNode.size): number[] {
    if (LGraphNode.size) {
      return LGraphNode.size.concat();
    }
    const margin = 6;
    const rows = Math.max(this.inputs.length || 1, this.outputs.length || 1);
    const size = minSize && new Float32Array(minSize) || new Float32Array([0, 0]);
    const fontSize = LiteGraph.NODE_TEXT_SIZE; //although it should be graphcanvas.inner_text_font size
    const titleWidth = computeTextWidth(this.title, fontSize);

    let inputWidth = 0;
    let outputWidth = 0;

    if (this.inputs) {
      for (let i = 0, l = this.inputs.length; i < l; ++i) {
        const input = this.inputs[i];
        let text = input.label || input.name || "";
        let textWidth = computeTextWidth(text, fontSize);
        if (inputWidth < textWidth) {
          inputWidth = textWidth;
        }
      }
    }

    if (this.outputs) {
      for (let i = 0, l = this.outputs.length; i < l; ++i) {
        let output = this.outputs[i];
        let text = output.label || output.name || "";
        let textWidth = computeTextWidth(text, fontSize);
        if (outputWidth < textWidth) {
          outputWidth = textWidth;
        }
      }
    }
    // calc width
    size[0] = Math.max(inputWidth + outputWidth + 10, titleWidth);
    if (this.widgets && this.widgets.length) {
      size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH * 1.5);
    } else {
      size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH);
    }
    // calc height
    size[1] = (LGraphNode.slot_start_y || 0) + rows * LiteGraph.NODE_SLOT_HEIGHT;

    let widgetsTotalHeight = 0;
    if (this.widgets && this.widgets.length) {
      for (let i = 0, l = this.widgets.length; i < l; ++i) {
        if (this.widgets[i].computeSize) {
          widgetsTotalHeight += this.widgets[i].computeSize(size[0])[1] + 4;
        } else {
          widgetsTotalHeight += LiteGraph.NODE_WIDGET_HEIGHT + 4;
        }
      }
      widgetsTotalHeight += 8;
    }

    // compute height using widgets height
    if (this.widgets_up) {
      size[1] = Math.max(size[1], widgetsTotalHeight);
    } else if (this.widgets_start_y != null) {
      size[1] = Math.max(size[1], widgetsTotalHeight + this.widgets_start_y);
    } else {
      size[1] += widgetsTotalHeight;
    }

    if (LGraphNode.min_height && size[1] < LGraphNode.min_height) {
      size[1] = LGraphNode.min_height;
    }

    size[1] += margin;

    return size;
  };
  /**
   * 返回有关此节点属性的所有可用信息。
   */
  getPropertyInfo(property: string): any | null {
    let info = null;
    // there are several ways to define info about a property
    // legacy mode get info from properties_info
    if (this.properties_info) {
      for (let i = 0; i < this.properties_info.length; ++i) {
        if (this.properties_info[i].name == property) {
          info = this.properties_info[i];
          break;
        }
      }
    }
    // litescene mode using the constructor
    if (this.constructor["@" + property]) {
      info = this.constructor["@" + property];
    }

    // get info from widgets
    if (LGraphNode.widgets_info && LGraphNode.widgets_info[property]) {
      info = LGraphNode.widgets_info[property];
    }

    // litescene mode using the constructor
    if (!info && this.onGetPropertyInfo) {
      info = this.onGetPropertyInfo(property);
    }

    if (!info) info = {};
    if (!info.type) info.type = typeof this.properties[property];
    if (info.widget == "combo") info.type = "enum";

    return info;
  };


  /**
   * returns the bounding of the object, used for rendering purposes
   * 返回可渲染的边界范围
   * bounding is: [left, top, width, height]
   * @method getBounding
   * @return {Float32Array[4]} the total size
   */
  getBounding(): Float32Array {
    const out = new Float32Array(4);
    const [x, y] = this.pos;
    const [width, height] = this.size;
    out[0] = x - 4; // left
    out[1] = y - LiteGraph.NODE_TITLE_HEIGHT; // top
    out[2] = width + 4; // width
    out[3] = this.flags.collapsed ? LiteGraph.NODE_TITLE_HEIGHT : height + LiteGraph.NODE_TITLE_HEIGHT; // height

    if (this.onBounding) {
      this.onBounding(out);
    }
    return out;
  };

  /**
   * checks if a point is inside the shape of a node
   * @method isPointInside
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  isPointInside(x: number, y: number, margin = 0, skip_title: boolean) {

    let margin_top = this.graph && this.graph.isLive() ? 0 : LiteGraph.NODE_TITLE_HEIGHT;
    if (skip_title) {
      margin_top = 0;
    }
    if (this.flags && this.flags.collapsed) {
      //if ( distance([x,y], [this.pos[0] + this.size[0]*0.5, this.pos[1] + this.size[1]*0.5]) < LiteGraph.NODE_COLLAPSED_RADIUS)
      if (
        isInsideRectangle(
          x,
          y,
          this.pos[0] - margin,
          this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT - margin,
          (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH) + 2 * margin,
          LiteGraph.NODE_TITLE_HEIGHT + 2 * margin
        )
      ) {
        return true;
      }
    } else if (
      this.pos[0] - 4 - margin < x &&
      this.pos[0] + this.size[0] + 4 + margin > x &&
      this.pos[1] - margin_top - margin < y &&
      this.pos[1] + this.size[1] + margin > y
    ) {
      return true;
    }
    return false;
  };


  /**
  * checks if a point is inside a node slot, and returns info about which slot
  */
  getSlotInPosition(x: number, y: number): {
    input: LGraphNodePortInput,
    slot: number;
    link_pos: Float32Array;
  } | {
    output: LGraphNodePortOutput;
    slot: number;
    link_pos: Float32Array;
  } | null {
    //search for inputs
    let link_pos = new Float32Array(2);
    if (this.inputs) {
      for (let i = 0, l = this.inputs.length; i < l; ++i) {
        let input = this.inputs[i];
        this.getConnectionPos(true, i, link_pos);
        if (isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
          return { input: input, slot: i, link_pos: link_pos };
        }
      }
    }

    if (this.outputs) {
      for (let i = 0, l = this.outputs.length; i < l; ++i) {
        let output = this.outputs[i];
        this.getConnectionPos(false, i, link_pos);
        if (isInsideRectangle(x, y, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
          return { output: output, slot: i, link_pos: link_pos };
        }
      }
    }

    return null;
  };

  /**
 * returns the center of a connection point in canvas coords
 * @method getConnectionPos
 * @param {boolean} is_input true if if a input slot, false if it is an output
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @param {vec2} out [optional] a place to store the output, to free garbage
 * @return {[x,y]} the position
 **/
  getConnectionPos(is_input: boolean, slot_number: number, out: Float32Array = new Float32Array(2)): Float32Array {

    let num_slots = 0;
    if (is_input && this.inputs) {
      num_slots = this.inputs.length;
    }
    if (!is_input && this.outputs) {
      num_slots = this.outputs.length;
    }

    let offset = LiteGraph.NODE_SLOT_HEIGHT * 0.5;

    if (this.flags.collapsed) {
      let w = this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH;
      if (this.horizontal) {
        out[0] = this.pos[0] + w * 0.5;
        if (is_input) {
          out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
        } else {
          out[1] = this.pos[1];
        }
      } else {
        if (is_input) {
          out[0] = this.pos[0];
        } else {
          out[0] = this.pos[0] + w;
        }
        out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      }
      return out;
    }

    //weird feature that never got finished
    if (is_input && slot_number == -1) {
      out[0] = this.pos[0] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      out[1] = this.pos[1] + LiteGraph.NODE_TITLE_HEIGHT * 0.5;
      return out;
    }

    //hard-coded pos
    if (is_input && num_slots > slot_number && this.inputs[slot_number].pos) {
      out[0] = this.pos[0] + this.inputs[slot_number].pos[0];
      out[1] = this.pos[1] + this.inputs[slot_number].pos[1];
      return out;
    } else if (!is_input && num_slots > slot_number && this.outputs[slot_number].pos) {
      out[0] = this.pos[0] + this.outputs[slot_number].pos[0];
      out[1] = this.pos[1] + this.outputs[slot_number].pos[1];
      return out;
    }
    // horizontal distributed slots
    if (this.horizontal) {
      out[0] = this.pos[0] + (slot_number + 0.5) * (this.size[0] / num_slots);
      if (is_input) {
        out[1] = this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT;
      } else {
        out[1] = this.pos[1] + this.size[1];
      }
      return out;
    }

    //default vertical slots
    if (is_input) {
      out[0] = this.pos[0] + offset;
    } else {
      out[0] = this.pos[0] + this.size[0] + 1 - offset;
    }
    out[1] = this.pos[1] + (slot_number + 0.7) * LiteGraph.NODE_SLOT_HEIGHT + (this.constructor.slot_start_y || 0);
    return out;
  };


  /**
 * returns the output slot with a given name (used for dynamic slots), -1 if not found
 * @method findOutputSlot
 * @param {string} name the name of the slot
 * @param {boolean} returnObj if the obj itself wanted
 * @return {number_or_object} the slot (-1 if not found)
 */
  findOutputSlot(name: string, returnObj: boolean = false): number | LGraphNodePort {
    returnObj = returnObj || false;
    if (!this.outputs) {
      return -1;
    }
    for (let i = 0, l = this.outputs.length; i < l; ++i) {
      if (name == this.outputs[i].name) {
        return !returnObj ? i : this.outputs[i];
      }
    }
    return -1;
  };


  // TODO refactor: USE SINGLE findInput/findOutput functions! :: merge options

  /**
   * 返回第一个没有连接的输入插槽
   */
  findInputSlotFree(option: {
    returnObject?: boolean;
    typesNotAccepted?: string[]
  } = {}) {
    const optsDefault = {
      returnObject: false,
      typesNotAccepted: []
    };
    const opts = Object.assign(optsDefault, option);
    if (!this.inputs || this.inputs.length === 0) {
      return -1;
    }
    for (let i = 0, l = this.inputs.length; i < l; ++i) {
      if (this.inputs[i].link && this.inputs[i].link != null) {
        continue;
      }
      if (
        opts.typesNotAccepted &&
        opts.typesNotAccepted.includes &&
        opts.typesNotAccepted.includes(this.inputs[i].type as string)
      ) {
        continue;
      }
      return opts.returnObject ? this.inputs[i] : i;
    }
    return -1;
  };

  /**
   * returns the first output slot free
   */
  findOutputSlotFree(option: {
    returnObject?: boolean;
    typesNotAccepted?: string[]
  } = {}) {
    const optsDefault = {
      returnObject: false,
      typesNotAccepted: []
    };
    const opts = Object.assign(optsDefault, option);

    if (!this.outputs || this.outputs.length === 0) {
      return -1;
    }
    for (let i = 0, l = this.outputs.length; i < l; ++i) {
      if (this.outputs[i].links && this.outputs[i].links != null) {
        continue;
      }
      if (
        opts.typesNotAccepted &&
        opts.typesNotAccepted.includes &&
        opts.typesNotAccepted.includes(this.outputs[i].type as string)
      ) {
        continue;
      }
      return opts.returnObject ? this.outputs[i] : i;
    }
    return -1;
  };

  /**
   * findSlotByType for INPUTS
   */
  findInputSlotByType(type: string | number, returnObject: boolean, preferFreeSlot: boolean, doNotUseOccupied: boolean = false) {
    return this.findSlotByType(true, type, returnObject, preferFreeSlot, doNotUseOccupied);
  };

  /**
   * findSlotByType for OUTPUTS
   */
  findOutputSlotByType(type: string | number, returnObject: boolean, preferFreeSlot: boolean = false, doNotUseOccupied: boolean = false) {
    return this.findSlotByType(false, type, returnObject, preferFreeSlot, doNotUseOccupied);
  };
  /**
 * returns the output (or input) slot with a given type, -1 if not found
 * @method findSlotByType
 * @param {boolean} input uise inputs instead of outputs
 * @param {string} type the type of the slot
 * @param {boolean} returnObject if the obj itself wanted
 * @param {boolean} preferFreeSlot if we want a free slot (if not found, will return the first of the type anyway)
 * @return {number_or_object} the slot (-1 if not found)
 */
  findSlotByType(
    input: boolean = false,
    type: string| number,
    returnObject: boolean = false,
    preferFreeSlot: boolean = false,
    doNotUseOccupied: boolean = false
  ) {
    let aSlots = input ? this.inputs : this.outputs;
    if (!aSlots) {
      return -1;
    }
    // !! empty string type is considered 0, * !!
    if (type == "" || type == "*") type = 0;
    for (let i = 0, l = aSlots.length; i < l; ++i) {
      let tFound = false;
      let aSource = (type + "").toLowerCase().split(",");
      let aDest = aSlots[i].type == "0" || aSlots[i].type == "*" ? "0" : aSlots[i].type;
      aDest = (aDest + "").toLowerCase().split(",");
      for (let sI = 0; sI < aSource.length; sI++) {
        for (let dI = 0; dI < aDest.length; dI++) {
          if (aSource[sI] == "_event_") aSource[sI] = LiteGraph.EVENT;
          if (aDest[sI] == "_event_") aDest[sI] = LiteGraph.EVENT;
          if (aSource[sI] == "*") aSource[sI] = 0;
          if (aDest[sI] == "*") aDest[sI] = 0;
          if (aSource[sI] == aDest[dI]) {
            if (preferFreeSlot && aSlots[i].links && aSlots[i].links !== null) continue;
            return !returnObject ? i : aSlots[i];
          }
        }
      }
    }
    // if didnt find some, stop checking for free slots
    if (preferFreeSlot && !doNotUseOccupied) {
      for (let i = 0, l = aSlots.length; i < l; ++i) {
        let tFound = false;
        let aSource = (type + "").toLowerCase().split(",");
        let aDest = aSlots[i].type == "0" || aSlots[i].type == "*" ? "0" : aSlots[i].type;
        aDest = (aDest + "").toLowerCase().split(",");
        for (let sI = 0; sI < aSource.length; sI++) {
          for (dI = 0; dI < aDest.length; dI++) {
            if (aSource[sI] == "*") aSource[sI] = 0;
            if (aDest[sI] == "*") aDest[sI] = 0;
            if (aSource[sI] == aDest[dI]) {
              return !returnObject ? i : aSlots[i];
            }
          }
        }
      }
    }
    return -1;
  };

  /**
 * connect this node output to the input of another node BY TYPE
 * 按类型将此节点输出连接到另一个节点的输入
 * @method connectByType
 * @param {number | string} slot (could be the number of the slot or the string with the name of the slot)
 * @param {LGraphNode} target_node the target node
 * @param {number | string} target_slotType the input slot type of the target node
 * @return {Object} the link_info is created, otherwise null
 */
  connectByType(slot: number, target_node: number | LGraphNode, target_slotType: string, optsIn = {}) {
    let optsDef = {
      createEventInCase: true,
      firstFreeIfOutputGeneralInCase: true,
      generalTypeInCase: true
    };
    let opts = Object.assign(optsDef, optsIn);
    if (typeof target_node === 'number') {
      target_node = this.graph!.getNodeById(target_node) as LGraphNode;
    }
    const target_slot = target_node.findInputSlotByType(target_slotType, false, true) as number;
    if (target_slot >= 0 && target_slot !== null) {
      //console.debug("CONNbyTYPE type "+target_slotType+" for "+target_slot)
      return this.connect(slot, target_node, target_slot);
    } else {
      if (opts.createEventInCase && target_slotType == LiteGraph.EVENT) {
        // WILL CREATE THE onTrigger IN SLOT
        //console.debug("connect WILL CREATE THE onTrigger "+target_slotType+" to "+target_node);
        return this.connect(slot, target_node, -1);
      }
      // connect to the first general output slot if not found a specific type and
      if (opts.generalTypeInCase) {
        const target_slot = target_node.findInputSlotByType(0, false, true, true) as number;
        //console.debug("connect TO a general type (*, 0), if not found the specific type ",target_slotType," to ",target_node,"RES_SLOT:",target_slot);
        if (target_slot >= 0) {
          return this.connect(slot, target_node, target_slot);
        }
      }
      // connect to the first free input slot if not found a specific type and this output is general
      if (
        opts.firstFreeIfOutputGeneralInCase &&
        (target_slotType == 0 || target_slotType == "*" || target_slotType == "")
      ) {
        let target_slot = target_node.findInputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] }) as number;
        //console.debug("connect TO TheFirstFREE ",target_slotType," to ",target_node,"RES_SLOT:",target_slot);
        if (target_slot >= 0) {
          return this.connect(slot, target_node, target_slot);
        }
      }

      console.debug("no way to connect type: ", target_slotType, " to targetNODE ", target_node);
      //TODO filter

      return null;
    }
  };

  /**
   * connect this node output to the input of another node
   * @method connect
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot, or -1 to connect a trigger)
   * @return {Object} the link_info is created, otherwise null
   */
  connect(slot: number, target_node: LGraphNode, target_slot: number | number = 0) {
    target_slot = target_slot || 0;

    if (!this.graph) {
      //could be connected before adding it to a graph
      console.log(
        "Connect: Error, node doesn't belong to any graph. Nodes must be added first to a graph before connecting them."
      ); //due to link ids being associated with graphs
      return null;
    }

    //seek for the output slot
    if (slot.constructor === String) {
      slot = this.findOutputSlot(slot);
      if (slot == -1) {
        if (LiteGraph.debug) {
          console.log("Connect: Error, no slot of name " + slot);
        }
        return null;
      }
    } else if (!this.outputs || slot >= this.outputs.length) {
      if (LiteGraph.debug) {
        console.log("Connect: Error, slot number not found");
      }
      return null;
    }

    if (target_node && target_node.constructor === Number) {
      target_node = this.graph.getNodeById(target_node) as LGraphNode;
    }
    if (!target_node) {
      throw "target node is null";
    }

    //avoid loopback
    if (target_node == this) {
      return null;
    }

    //you can specify the slot by name
    if (target_slot.constructor === String) {
      target_slot = target_node.findInputSlot(target_slot) as number;
      if (target_slot == -1) {
        if (LiteGraph.debug) {
          console.log("Connect: Error, no slot of name " + target_slot);
        }
        return null;
      }
    } else if (target_slot === LiteGraph.EVENT) {
      if (LiteGraph.do_add_triggers_slots) {
        // search for first slot with event? :: NO this is done outside
        // console.log("Connect: Creating triggerEvent");
        // force mode
        target_node.changeMode(LiteGraph.ON_TRIGGER);
        target_slot = target_node.findInputSlot("onTrigger");
      } else {
        return null; // -- break --
      }
    } else if (!target_node.inputs || target_slot >= target_node.inputs.length) {
      if (LiteGraph.debug) {
        console.log("Connect: Error, slot number not found");
      }
      return null;
    }

    let changed = false;

    let input = target_node.inputs[target_slot];
    let link_info = null;
    let output = this.outputs[slot];

    if (!this.outputs[slot]) {
      /*console.debug("Invalid slot passed: "+slot);
        console.debug(this.outputs);*/
      return null;
    }

    // allow target node to change slot
    if (target_node.onBeforeConnectInput) {
      // This way node can choose another slot (or make a new one?)
      target_slot = target_node.onBeforeConnectInput(target_slot); //callback
    }

    //check target_slot and check connection types
    if (target_slot === false || target_slot === null || !LiteGraph.isValidConnection(output.type, input.type)) {
      this.setDirtyCanvas(false, true);
      if (changed) this.graph.connectionChange(this, link_info);
      return null;
    } else {
      //console.debug("valid connection",output.type, input.type);
    }

    //allows nodes to block connection, callback
    if (target_node.onConnectInput) {
      if (target_node.onConnectInput(target_slot, output.type, output, this, slot) === false) {
        return null;
      }
    }
    if (this.onConnectOutput) {
      // callback
      if (this.onConnectOutput(slot, input.type, input, target_node, target_slot) === false) {
        return null;
      }
    }

    //if there is something already plugged there, disconnect
    if (target_node.inputs[target_slot] && target_node.inputs[target_slot].link != null) {
      this.graph.beforeChange();
      target_node.disconnectInput(target_slot, { doProcessChange: false });
      changed = true;
    }
    if (output.links !== null && output.links.length) {
      switch (output.type) {
        case LiteGraph.EVENT:
          if (!LiteGraph.allow_multi_output_for_events) {
            this.graph.beforeChange();
            this.disconnectOutput(slot, false, { doProcessChange: false }); // Input(target_slot, {doProcessChange: false});
            changed = true;
          }
          break;
        default:
          break;
      }
    }

    //create link class
    link_info = new LLink(
      ++this.graph.last_link_id,
      input.type || output.type,
      this.id,
      slot,
      target_node.id,
      target_slot
    );

    //add to graph links list
    this.graph.links[link_info.id] = link_info;

    //connect in output
    if (output.links == null) {
      output.links = [];
    }
    output.links.push(link_info.id);
    //connect in input
    target_node.inputs[target_slot].link = link_info.id;
    if (this.graph) {
      this.graph._version++;
    }
    if (this.onConnectionsChange) {
      this.onConnectionsChange(LiteGraph.OUTPUT, slot, true, link_info, output);
    } //link_info has been created now, so its updated
    if (target_node.onConnectionsChange) {
      target_node.onConnectionsChange(LiteGraph.INPUT, target_slot, true, link_info, input);
    }
    if (this.graph && this.graph.onNodeConnectionChange) {
      this.graph.onNodeConnectionChange(LiteGraph.INPUT, target_node, target_slot, this, slot);
      this.graph.onNodeConnectionChange(LiteGraph.OUTPUT, this, slot, target_node, target_slot);
    }

    this.setDirtyCanvas(false, true);
    this.graph.afterChange();
    this.graph.connectionChange(this, link_info);

    return link_info;
  };



  /**
   * disconnect one output to an specific node
   * @method disconnectOutput
   * @param {number} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
   * @return {boolean} if it was disconnected successfully
   */
  disconnectOutput(slot: number, target_node?: LGraphNode | number) {
    if (slot.constructor === String) {
      slot = this.findOutputSlot(slot);
      if (slot == -1) {
        if (LiteGraph.debug) {
          console.log("Connect: Error, no slot of name " + slot);
        }
        return false;
      }
    } else if (!this.outputs || slot >= this.outputs.length) {
      if (LiteGraph.debug) {
        console.log("Connect: Error, slot number not found");
      }
      return false;
    }

    //get output slot
    let output = this.outputs[slot];
    if (!output || !output.links || output.links.length == 0) {
      return false;
    }

    //one of the output links in this slot
    if (target_node) {
      if (typeof target_node === 'number') {
        target_node = this.graph!.getNodeById(target_node) as LGraphNode;
      }
      if (!target_node) {
        throw "Target Node not found";
      }

      for (let i = 0, l = output.links.length; i < l; i++) {
        let link_id = output.links[i];
        let link_info = this.graph.links[link_id];

        //is the link we are searching for...
        if (link_info.target_id == target_node.id) {
          output.links.splice(i, 1); //remove here
          let input = target_node.inputs[link_info.target_slot];
          input.link = null; //remove there
          delete this.graph.links[link_id]; //remove the link from the links pool
          if (this.graph) {
            this.graph._version++;
          }
          if (target_node.onConnectionsChange) {
            target_node.onConnectionsChange(LiteGraph.INPUT, link_info.target_slot, false, link_info, input);
          } //link_info hasn't been modified so its ok
          if (this.onConnectionsChange) {
            this.onConnectionsChange(LiteGraph.OUTPUT, slot, false, link_info, output);
          }
          if (this.graph && this.graph.onNodeConnectionChange) {
            this.graph.onNodeConnectionChange(LiteGraph.OUTPUT, this, slot);
          }
          if (this.graph && this.graph.onNodeConnectionChange) {
            this.graph.onNodeConnectionChange(LiteGraph.OUTPUT, this, slot);
            this.graph.onNodeConnectionChange(LiteGraph.INPUT, target_node, link_info.target_slot);
          }
          break;
        }
      }
    } //all the links in this output slot
    else {
      for (let i = 0, l = output.links.length; i < l; i++) {
        let link_id = output.links[i];
        let link_info = this.graph.links[link_id];
        if (!link_info) {
          //bug: it happens sometimes
          continue;
        }

        let target_node = this.graph.getNodeById(link_info.target_id);
        let input = null;
        if (this.graph) {
          this.graph._version++;
        }
        if (target_node) {
          input = target_node.inputs[link_info.target_slot];
          input.link = null; //remove other side link
          if (target_node.onConnectionsChange) {
            target_node.onConnectionsChange(LiteGraph.INPUT, link_info.target_slot, false, link_info, input);
          } //link_info hasn't been modified so its ok
          if (this.graph && this.graph.onNodeConnectionChange) {
            this.graph.onNodeConnectionChange(LiteGraph.INPUT, target_node, link_info.target_slot);
          }
        }
        delete this.graph.links[link_id]; //remove the link from the links pool
        if (this.onConnectionsChange) {
          this.onConnectionsChange(LiteGraph.OUTPUT, slot, false, link_info, output);
        }
        if (this.graph && this.graph.onNodeConnectionChange) {
          this.graph.onNodeConnectionChange(LiteGraph.OUTPUT, this, slot);
          this.graph.onNodeConnectionChange(LiteGraph.INPUT, target_node, link_info.target_slot);
        }
      }
      output.links = null;
    }

    this.setDirtyCanvas(false, true);
    this.graph.connectionChange(this);
    return true;
  };

  /**
   * disconnect one input
   * @method disconnectInput
   * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
   * @return {boolean} if it was disconnected successfully
   */
  disconnectInput(slot: number | string) {
    // seek for the output slot
    if (typeof slot === 'string') {
      slot = this.findInputSlot(slot) as number; // number
      if (slot === -1) {
        if (LiteGraph.debug) {
          console.log("Connect: Error, no slot of name " + slot);
        }
        return false;
      }
    }
    // number > length
    if (!this.inputs || slot >= this.inputs.length) {
      if (LiteGraph.debug) {
        console.log("Connect: Error, slot number not found");
      }
      return false;
    }
    // normal slot number

    let input = this.inputs[slot];
    if (!input) return false;

    let link_id = this.inputs[slot].link;

    if (link_id != null) {
      this.inputs[slot].link = null;

      // remove other side
      let link_info = this.graph!.links[link_id];

      if (link_info) {
        let origin_node = this.graph!.getNodeById(link_info.origin_id);
        if (!origin_node) return false;

        let output = origin_node.outputs[link_info.origin_slot];
        if (!output || !output.links || output.links.length == 0) return false;

        // search in the inputs list for this link and remove this link
        // stroe link number
        let origin_node_output_link = -1;
        for (let i = 0, l = output.links.length; i < l; i++) {
          if (output.links[i] == link_id) {
            origin_node_output_link = i;
            output.links.splice(i, 1);
            break;
          }
        }

        
        // remove link from the pool
        if(this.graph) {
          this.graph.links[link_id] = null;
        }

        // update version
        if (this.graph) {
          this.graph._version++;
        }

        // callback

        if (this.onConnectionsChange) {
          this.onConnectionsChange(LiteGraph.INPUT, slot, false, link_info, input);
        }

        if (origin_node.onConnectionsChange) {
          origin_node.onConnectionsChange(LiteGraph.OUTPUT, origin_node_output_link, false, link_info, output);
        }

        if (this.graph && this.graph.onNodeConnectionChange) {
          this.graph.onNodeConnectionChange(LiteGraph.OUTPUT, target_node, origin_node_output_link);
          this.graph.onNodeConnectionChange(LiteGraph.INPUT, this, slot);
        }
      }
    }

    //link != null
    this.setDirtyCanvas(false, true);
    if (this.graph) {
      this.graph.connectionChange(this);
    }
    return true;
  };

  /**
   * connect this node input to the output of another node BY TYPE
   * @method connectByType
   * @param {number} slot (could be the number of the slot or the string with the name of the slot)
   * @param {LGraphNode} node the target node
   * @param {string} target_type the output slot type of the target node
   * @return {Object} the link_info is created, otherwise null
   */
  connectByTypeOutput(slot: number , source_node: LGraphNode, source_slotType: string , optsIn = {}) {
    optsIn = optsIn || {};
    let optsDef = {
      createEventInCase: true,
      firstFreeIfInputGeneralInCase: true,
      generalTypeInCase: true
    };
    let opts = Object.assign(optsDef, optsIn);
    if (typeof source_node === "number") {
      source_node = this.graph!.getNodeById(source_node) as LGraphNode;
    }
    const source_slot = source_node.findOutputSlotByType(source_slotType, false, true) as number;
    if (source_slot >= 0 && source_slot !== null) {
      //console.debug("CONNbyTYPE OUT! type "+source_slotType+" for "+source_slot)
      return source_node.connect(source_slot, this, slot);
    } else {
      // connect to the first general output slot if not found a specific type and
      if (opts.generalTypeInCase) {
        let source_slot = source_node.findOutputSlotByType(0, false, true, true) as number;
        if (source_slot >= 0) {
          return source_node.connect(source_slot, this, slot);
        }
      }

      if (opts.createEventInCase && source_slotType == LiteGraph.EVENT) {
        // WILL CREATE THE onExecuted OUT SLOT
        if (LiteGraph.do_add_triggers_slots) {
          let source_slot = source_node.addOnExecutedOutput();
          return source_node.connect(source_slot, this, slot);
        }
      }
      // connect to the first free output slot if not found a specific type and this input is general
      if (
        opts.firstFreeIfInputGeneralInCase &&
        (source_slotType == "*" || source_slotType == "")
      ) {
        let source_slot = source_node.findOutputSlotFree({ typesNotAccepted: [LiteGraph.EVENT] }) as number;
        if (source_slot >= 0) {
          return source_node.connect(source_slot, this, slot);
        }
      }

      console.debug("no way to connect byOUT type: ", source_slotType, " to sourceNODE ", source_node);
      //TODO filter

      //console.log("type OUT! "+source_slotType+" not found or not free?")
      return null;
    }
  };


  /* Force align to grid */
  alignToGrid() {
    this.pos[0] = LiteGraph.CANVAS_GRID_SIZE * Math.round(this.pos[0] / LiteGraph.CANVAS_GRID_SIZE);
    this.pos[1] = LiteGraph.CANVAS_GRID_SIZE * Math.round(this.pos[1] / LiteGraph.CANVAS_GRID_SIZE);
  };

  /* Console output */
  trace(msg: string) {
    if (!this.console) {
      this.console = [];
    }

    this.console.push(msg);

    if (this.console.length > LGraphNode.MAX_CONSOLE) {
      this.console.shift();
    }

    if (this.graph && this.graph.onNodeTrace) {
      this.graph.onNodeTrace(this, msg);
    }
  };

  /**
   * Forces to redraw or the main canvas (LGraphNode) or the bg canvas (links)
   * @param dirty_foreground 
   * @param dirty_background 
   * @returns 
   */
  setDirtyCanvas(dirty_foreground = false, dirty_background = false) {
    if (!this.graph) {
      return false;
    }
    this.graph.sendActionToCanvas("setDirty", [dirty_foreground, dirty_background]);
    return true;
  };

  loadImage(url: string) {
    const img = new Image();
    img.src = LiteGraph.node_images_path + url;
    this.ready = false;
    
    img.onload =  () => {
      this.ready = true;
      this.setDirtyCanvas(true, false);
    };
    return img;
  };



  /* Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus
  * 即使鼠标失去焦点也允许获取 onMouseMove 和 onMouseUp 事件
  */
  captureInput(v:boolean) {
    if (!this.graph || !this.graph.list_of_graphcanvas) {
      return;
    }

    let list = this.graph.list_of_graphcanvas;

    for (let i = 0; i < list.length; ++i) {
      let c = list[i];
      //releasing somebody elses capture?!
      if (!v && c.node_capturing_input != this) {
        continue;
      }

      //change
      c.node_capturing_input = v ? this : null;
    }
  };


  /**
   * unsafe LGraphNode action execution
   * @param action 
   * @returns 
   */
  // executeActionUnsafe(action: string) {
  //   if (action == "") return false;

  //   if (action.indexOf(";") != -1 || action.indexOf("}") != -1) {
  //     this.trace("Error: Action contains unsafe characters");
  //     return false;
  //   }

  //   let tokens = action.split("(");
  //   let func_name = tokens[0];
  //   if (typeof (this[func_name]) != "function") {
  //     this.trace("Error: Action not found on node: " + func_name);
  //     return false;
  //   }

  //   let code = action;

  //   try {
  //     let _foo = eval;
  //     eval = null;
  //     (new Function("with(this) { " + code + "}")).call(this);
  //     eval = _foo;
  //   }
  //   catch (err) {
  //     this.trace("Error executing action {" + action + "} :" + err);
  //     return false;
  //   }

  //   return true;
  // }
  static install(LiteGraph: LiteGraph) {
    LiteGraph.LGraphNode = LGraphNode;
  };

  // can be rewrite
  onSerialize() { };
  onInputAdded(input: LGraphNodePortInput) { };
  onOutputAdded(output: LGraphNodePortOutput) { };
  onPropertyChanged(name: string ,value: any) { };
  onConnectionsChange() { };
  onConfigure(o:any) { };
  onResize(size: number[]) { };
  onGetPropertyInfo() { };
  onBounding() { };
  onBeforeConnectInput() { };
}


export default LGraphNode;
