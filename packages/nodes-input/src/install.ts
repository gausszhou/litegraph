import GamepadInput from './Gamepad';
export const install = (LiteGraph: any) => {
  LiteGraph.registerNodeType({
    class: GamepadInput,
    type: "input/gamepad", 
  });
};
