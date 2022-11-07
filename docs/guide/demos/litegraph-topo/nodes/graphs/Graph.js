import LGraphCanvas from "../../litegraph/LGraphCanvas";

function Graph() {}
// 禁止克隆
Graph.prototype.clonable = false;

Graph.prototype.getMenuOptions = function () {
  let options = [
    {
      content: "Title",
      callback: LGraphCanvas.onShowPropertyEditor
    },
    {
      content: "Colors",
      has_submenu: true,
      callback: LGraphCanvas.onMenuNodeColors
    }
  ];
  return options;
};
export default Graph;
