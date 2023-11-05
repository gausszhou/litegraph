import LiteGraph from "./LiteGraph";
import LGraph from './LGraph';
import LGraphNode from "./LGraphNode";
import LGraphCanvas from "./LGraphCanvas";

/** 
 * |----------------|
 * | title          |
 * |----------------|
 * | input   output |
 * | input   output |
 * |----------------|
 * | button | button|
 * |----------------|
 */

/**
 * Subgraph: a node that contains a graph
 */

class Subgraph extends LGraphNode {
  static title = "Subgraph";
  static desc = "Graph inside a node";
  static title_color = "#334";


  subgraph: LGraph = new LGraph();
  size = [140, 80];
  properties = { enabled: true };
  enabled = true;
  mode = LiteGraph.ALWAYS

  constructor() {
    super(Subgraph.title);
    //create inner graph
    this.subgraph._subgraph_node = this;
    this.subgraph._is_subgraph = true;
    this.subgraph.onTrigger = this.onSubgraphTrigger.bind(this);

    // nodes input node added inside
    this.subgraph.onInputAdded = this.onSubgraphNewInput.bind(this);
    this.subgraph.onInputRenamed = this.onSubgraphRenamedInput.bind(this);
    this.subgraph.onInputTypeChanged = this.onSubgraphTypeChangeInput.bind(this);
    this.subgraph.onInputRemoved = this.onSubgraphRemovedInput.bind(this);

    this.subgraph.onOutputAdded = this.onSubgraphNewOutput.bind(this);
    this.subgraph.onOutputRenamed = this.onSubgraphRenamedOutput.bind(this);
    this.subgraph.onOutputTypeChanged = this.onSubgraphTypeChangeOutput.bind(this);
    this.subgraph.onOutputRemoved = this.onSubgraphRemovedOutput.bind(this);
  }

  computeSize() {
    const num_inputs = this.inputs ? this.inputs.length : 0;
    const num_outputs = this.outputs ? this.outputs.length : 0;
    return [200, Math.max(num_inputs, num_outputs) * LiteGraph.NODE_SLOT_HEIGHT + LiteGraph.NODE_TITLE_HEIGHT];
  };

  sendEventToAllNodes(eventname, param, mode) {
    if (this.enabled) {
      this.subgraph.sendEventToAllNodes(eventname, param, mode);
    }
  };

  // *****************************************************
  getExtraMenuOptions(graphcanvas) {
    return [
      {
        content: "Open",
        callback: () => {
          graphcanvas.openSubgraph(this.subgraph);
        }
      }
    ];
  };

  serialize() {
    const data = LGraphNode.prototype.serialize.call(this);
    data.subgraph = this.subgraph.serialize();
    return data;
  };

  // no need to define node.configure, the default method detects node.subgraph and passes the object to node.subgraph.configure()
  clone() {
    const node = LiteGraph.createNode(this.type);
    var data = this.serialize();
    data.id = -1;
    data.inputs = [];
    data.outputs = [];
    node.configure(data);
    return node;
  };

  /**
   * TODO
   * 检测输入和输出
   * 将每个连接拆分为两个 data_connection 节点
   * 跟踪内部连接
   * 连接外部连接
   * 克隆子图中的节点并尝试重新连接它们
   * 将边子图节点连接到外部连接节点
   * @param nodes 
   */
  buildFromNodes(nodes: LGraphNode[]) {

    // clear all?
    // TODO
    // nodes that connect data between parent graph and subgraph
    // 连接父图和子图之间数据的节点
    const subgraph_inputs = [];
    const subgraph_outputs = [];

    //mark inner nodes
    const ids: Record<number, LGraphNode> = {};
    let min_x = 0;
    let max_x = 0;
    for (var i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      ids[node.id] = node;
      min_x = Math.min(node.pos[0], min_x);
      max_x = Math.max(node.pos[0], min_x);
    }

    var last_input_y = 0;
    var last_output_y = 0;

    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      //check inputs
      if (node.inputs) {
        for (var j = 0; j < node.inputs.length; ++j) {
          var input = node.inputs[j];
          if (!input || !input.link) continue;
          var link = node.graph!.links[input.link];
          if (!link) continue;
          if (ids[link.origin_id]) continue;
          //this.addInput(input.name,link.type);
          this.subgraph.addInput(input.name, link.type);
          /*
            var input_node = LiteGraph.createNode("graph/input");
            this.subgraph.add( input_node );
            input_node.pos = [min_x - 200, last_input_y ];
            last_input_y += 100;
            */
        }
      }

      // check outputs
      if (node.outputs) {
        for (var j = 0; j < node.outputs.length; ++j) {
          var output = node.outputs[j];
          if (!output || !output.links || !output.links.length) continue;
          var is_external = false;
          for (var k = 0; k < output.links.length; ++k) {
            var link = node.graph!.links[output.links[k]];
            if (!link) continue;
            if (ids[link.target_id]) continue;
            is_external = true;
            break;
          }
          if (!is_external) continue;
          //this.addOutput(output.name,output.type);
          /*
            var output_node = LiteGraph.createNode("graph/output");
            this.subgraph.add( output_node );
            output_node.pos = [max_x + 50, last_output_y ];
            last_output_y += 100;
            */
        }
      }
 
    }


  }
  // Event
  onGetInputs() {
    return [["enabled", "boolean"]];
  };

  onMouseDown(e: MouseEvent, localpos: number[], graphcanvas: LGraphCanvas) {
    if (this.flags.collapsed) {
      return false;
    }
    const bouttonTop = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    const inButtonArea = localpos[1] > bouttonTop;
    const inButtonLeft = localpos[0] < this.size[0] / 2
    if (!inButtonArea) {
      return false;
    }
    if (inButtonLeft) {
      // input
      graphcanvas.showSubgraphPropertiesDialog(this);
    } else {
      // output
      graphcanvas.showSubgraphPropertiesDialogOutput(this);
    }
    return true;
  };

  // on user dbclick subgraph node open 
  onDblClick = function (e: MouseEvent, pos: number[], graphcanvas: LGraphCanvas) {
    setTimeout(() => {
      graphcanvas.openSubgraph(this.subgraph);
    });
  };
  // 接收到 Action 时传递到内层
  onAction(action: string, param: any) {
    this.subgraph.onAction(action, param);
  };



  // 执行时传递参数到内层
  onExecute() {
    this.enabled = this.getInputOrProperty("enabled");
    if (!this.enabled) {
      return;
    }

    // send inputs to subgraph global inputs
    if (this.inputs) {
      for (var i = 0; i < this.inputs.length; i++) {
        var input = this.inputs[i];
        var value = this.getInputData(i);
        this.subgraph.setInputData(input.name, value);
      }
    }

    //execute
    this.subgraph.runStep();

    //send subgraph global outputs to outputs
    if (this.outputs) {
      for (var i = 0; i < this.outputs.length; i++) {
        var output = this.outputs[i];
        var value = this.subgraph.getOutputData(output.name);
        this.setOutputData(i, value);
      }
    }
  };



  /**
   * Draw button to the right of title
   * - | title   button| 
   */
  onDrawTitle(ctx: CanvasRenderingContext2D) {
    if (this.flags.collapsed) {
      return;
    }
    ctx.fillStyle = "#555";
    const w = LiteGraph.NODE_TITLE_HEIGHT; // width = height
    const x = this.size[0] - w; // x go to right
    ctx.fillRect(x, -w, w, w); //
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, -w * 0.6);
    ctx.lineTo(x + w * 0.8, -w * 0.6);
    ctx.lineTo(x + w * 0.5, -w * 0.3);
    ctx.fill();
  };

  onDrawBackground(
    ctx: CanvasRenderingContext2D,
    pos: number[],
    graphcanvas: LGraphCanvas,
    canvas: HTMLCanvasElement,
  ) {
    console.log(graphcanvas);
    console.log(canvas);
    if (this.flags.collapsed) return false;
    const bodyHeight = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    // button
    const over = LiteGraph.isInsideRectangle(
      pos[0],
      pos[1],
      this.pos[0],
      this.pos[1] + bodyHeight,
      this.size[0],
      LiteGraph.NODE_TITLE_HEIGHT
    );
    let overleft = LiteGraph.isInsideRectangle(
      pos[0],
      pos[1],
      this.pos[0],
      this.pos[1] + bodyHeight,
      this.size[0] / 2,
      LiteGraph.NODE_TITLE_HEIGHT
    );
    ctx.fillStyle = over ? "#555" : "#222";
    ctx.beginPath();
    if (this.shape == LiteGraph.BOX_SHAPE) {
      if (overleft) {
        ctx.rect(0, bodyHeight, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT);
      } else {
        ctx.rect(this.size[0] / 2, bodyHeight, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT);
      }
    } else {
      if (overleft) {
        ctx.roundRect(0, bodyHeight, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT, [0, 0, 8, 8]);
      } else {
        ctx.roundRect(this.size[0] / 2, bodyHeight, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT, [0, 0, 8, 8]);
      }
    }
    if (over) {
      ctx.fill();
    } else {
      ctx.fillRect(0, bodyHeight, this.size[0] + 1, LiteGraph.NODE_TITLE_HEIGHT);
    }
    // button
    ctx.textAlign = "center";
    ctx.font = "24px Arial";
    ctx.fillStyle = over ? "#DDD" : "#999";
    ctx.fillText("+", this.size[0] * 0.25, bodyHeight + 24);
    ctx.fillText("+", this.size[0] * 0.75, bodyHeight + 24);
  };


  onResize(size: number[]) {
    size[1] += 20;
  };

  //**** INPUTS ***********************************
  // 当事件触发
  onSubgraphTrigger(event: string, param: any) {
    const slot = this.findOutputSlot(event) as number;
    if (slot != -1) {
      this.triggerSlot(slot, param);
    }
  };


  onSubgraphNewInput(name: string, type: string) {
    var slot = this.findInputSlot(name) as number;
    if (slot == -1) {
      //add input to the node
      this.addInput(name, type);
    }
  };

  onSubgraphRenamedInput(oldname: string, name: string) {
    const slot = this.findInputSlot(oldname) as number;
    if (slot == -1) return false;
    const info = this.getInputInfo(slot)
    if (!info) return false;
    info.name = name;
    return true;
  };

  onSubgraphTypeChangeInput(name: string, type: string) {
    const slot = this.findInputSlot(name) as number;
    if (slot == -1) return false;
    const info = this.getInputInfo(slot);
    if (!info) return false;
    info.type = type;
    return true;
  };

  onSubgraphRemovedInput(name: string) {
    const slot = this.findInputSlot(name) as number;
    if (slot == -1) return false;
    this.removeInput(slot);
    return true;
  };

  //**** OUTPUTS ***********************************
  onSubgraphNewOutput(name: string, type: string) {
    const slot = this.findOutputSlot(name);
    if (slot == -1) {
      this.addOutput(name, type);
    }
  };

  onSubgraphRenamedOutput(oldname: string, name: string) {
    const slot = this.findOutputSlot(oldname) as number;
    if (slot == -1) return false;
    const info = this.getOutputInfo(slot);
    if (!info) return false;
    info.name = name;
    return true;
  };

  onSubgraphTypeChangeOutput(name: string, type: string) {
    const slot = this.findOutputSlot(name) as number;
    if (slot == -1) return false;
    const info = this.getOutputInfo(slot);
    if (!info) return false;
    info.type = type;
    return true;
  };

  onSubgraphRemovedOutput(name: string) {
    const slot = this.findInputSlot(name) as number;
    if (slot == -1) return false;
    this.removeOutput(slot);
    return true;
  };
}

export default Subgraph
