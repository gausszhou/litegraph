import litegraph from "../dist/litegraph";
const { LGraph } = litegraph
import LiteGraph from "./LiteGraph";
import LGraphCanvas from "./LGraphCanvas";

//  重写自动重排算法   margin layout hor ver
LGraph.prototype.arrange = function (margin, layout = "hor") {
  // left top  right  right-top
  let dirtyArea = [0, 0, 0, 0];
  if (this._is_subgraph) {
    let canvas_w = this.list_of_graphcanvas[0].bgcanvas.width;
    let subgraph_node = this._subgraph_node;
    let height = LiteGraph.NODE_SLOT_HEIGHT * 1.6;
    let inputs_len = (subgraph_node.inputs && subgraph_node.inputs.length) || 0;
    let outputs_len =
      (subgraph_node.outputs && subgraph_node.outputs.length) || 0;
    dirtyArea = [
      180,
      90 + inputs_len * height,
      canvas_w - 180,
      90 + outputs_len * height
    ];
    // [0]   [0] - [2]  [2]
    // + [1]     0     + [3]
    console.log(dirtyArea);
  }
  margin = margin || 100;

  var nodes = this.computeExecutionOrder(false, true);
  var columns = [];
  for (var i = 0; i < nodes.length; ++i) {
    var node = nodes[i];
    var col = node._level || 1;
    if (!columns[col]) {
      columns[col] = [];
    }
    columns[col].push(node);
  }

  var x = margin;

  for (var i = 0; i < columns.length; ++i) {
    var column = columns[i];
    if (!column) {
      continue;
    }
    var max_size = 100;
    var y = margin + LiteGraph.NODE_TITLE_HEIGHT;
    //  here
    if (x < dirtyArea[0]) {
      y = margin + LiteGraph.NODE_TITLE_HEIGHT + dirtyArea[1];
    }
    if (x + node.size[0] > dirtyArea[2]) {
      y = margin + LiteGraph.NODE_TITLE_HEIGHT + dirtyArea[3];
    }
    for (var j = 0; j < column.length; ++j) {
      var node = column[j];
      node.pos[0] = x;
      node.pos[1] = y;
      if (node.size[0] > max_size) {
        max_size = node.size[0];
      }
      if (x < dirtyArea[0]) {
        y += node.size[1] + margin + LiteGraph.NODE_TITLE_HEIGHT;
      } else {
        y += node.size[1] + margin + LiteGraph.NODE_TITLE_HEIGHT;
      }
    }
    x += max_size + margin;
  }
  //
  this.setDirtyCanvas(true, true);
};

export default LGraph;
