import LED from "./LED";
import Oscillator from "./Oscillator";

const install = (LiteGraph) => {
  const registerList = [Oscillator,  LED];
  registerList.forEach(node => {
    LiteGraph.registerNodeType({
      type: node.registerType,
      class: node,
      title: node.title,
      name: node.title,
      desc: node.desc
    });
  });
}
export default { install };