import { audio1, audio2, demo1, demo2, demo3 } from "./demos";
import Editor from "./Editor";

interface OptionElemExt extends HTMLOptionElement {
  callback?: () => void;
}

const editor = new Editor("main", { miniwindow: false });
editor.graphCanvas.pause_rendering = false;

window.addEventListener("resize", () => {
  editor.graphCanvas.resize();
});

window.onbeforeunload = () => {
  const data = JSON.stringify(editor.graph.serialize());
  localStorage.setItem("litegraph demo backup", data);
};

function addDemo(name: string, url: string | (() => void)) {
  var option = document.createElement("option") as OptionElemExt;
  if (typeof url === "string") {
    option.dataset["url"] = url;
  } else if (typeof url === "function") {
    option.callback = url;
  }
  option.innerHTML = name;
  editor.selector.appendChild(option);
}

addDemo("Demo1", () => demo1(editor.graph));
addDemo("Demo2", () => demo2(editor.graph));
addDemo("Demo3", () => demo3(editor.graph));

addDemo("Audio1", () => audio1(editor.graph));
addDemo("Audio2", () => audio2(editor.graph));

addDemo("Features", "examples/features.json");
addDemo("Benchmark", "examples/benchmark.json");
addDemo("Subgraph", "examples/subgraph.json");

addDemo("Audio", "examples/audio.json");
addDemo("Audio Delay", "examples/audio_delay.json");
addDemo("Audio Reverb", "examples/audio_reverb.json");
addDemo("MIDI Generation", "examples/midi_generation.json");
