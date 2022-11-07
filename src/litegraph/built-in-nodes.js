import config from "./nodes/config";
import Audio from "./nodes/Audio";
import Base from "./nodes/Base";
import Events from "./nodes/Events";
import GamepadInput from "./nodes/GamepadInput";
import Logic from "./nodes/Logic";
import Math from "./nodes/Math";
import Math3d from "./nodes/Math3d";
import MIDI from "./nodes/MIDI";
import network from "./nodes/Network";
import StringToTable from "./nodes/StringToTable";
import Widgets from "./nodes/Widgets";
import GLFX from "./nodes/GLFX";
import GLShaders from "./nodes/GLShaders";
import GLTextures from "./nodes/GLTextures";
import Graphics from "./nodes/Graphics";

const List = [
  Audio,
  Base,
  config,
  Events,
  GamepadInput,
  Logic,
  Math,
  Math3d,
  MIDI,
  network,
  StringToTable,
  GLFX,
  GLShaders,
  GLTextures,
  Graphics,
  Widgets
];

const install = LiteGraph =>{
  List.forEach(item => {
    LiteGraph.use(item);
  });  
}

export default {install}