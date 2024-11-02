import { LiteGraph } from "@gausszhou/litegraph";
import { demo } from "./demos"
import Editor from "./Editor"
import configure from "./configure"
import features from "./features/index";
import "@gausszhou/litegraph-core/css/litegraph.css"
import "../css/litegraph-editor.css"
console.log(LiteGraph)
LiteGraph.use(features);

interface OptionElemExt extends HTMLOptionElement {
    callback?: () => void;
}

const isMobile = false;
configure(isMobile);

LiteGraph.debug = false
LiteGraph.node_images_path = "litegraph-ts/nodes_data"

const editor = new Editor("main", { miniwindow: false });
editor.graphCanvas.pause_rendering = false;
(window as any).editor = editor;

window.addEventListener("resize", () => {
    editor.graphCanvas.resize();
});

//window.addEventListener("keydown", editor.graphcanvas.processKey.bind(editor.graphcanvas) );

window.onbeforeunload = () => {
    const data = JSON.stringify(editor.graph.serialize());
    localStorage.setItem("litegraph demo backup", data);
}

//create scene selector
const elem = document.createElement("span") as HTMLSpanElement;
elem.id = "LGEditorTopBarSelector";
elem.className = "selector";
elem.innerHTML = `
Demo
<select>
	<option>Empty</option>
</select>
<button class='btn' id='save'>Save</button>
<button class='btn' id='load'>Load</button>
<button class='btn' id='download'>Download</button>
|
<button class='btn' id='webgl'>WebGL</button>
<button class='btn' id='multiview'>Multiview</button>
`;
editor.tools.appendChild(elem);

const select = elem.querySelector<HTMLSelectElement>("select")!;

select.addEventListener("change", function(_e) {
    var option = this.options[this.selectedIndex] as OptionElemExt;
    var url = option.dataset["url"];

    if (url)
        editor.graph.load(url);
    else if (option.callback)
        option.callback();
    else
        editor.graph.clear();
});

elem.querySelector<HTMLButtonElement>("#save")!.addEventListener("click", () => {
    console.log("saved");
    localStorage.setItem("graphdemo_save", JSON.stringify(editor.graph.serialize()));
});

elem.querySelector<HTMLButtonElement>("#load")!.addEventListener("click", () => {
    var data = localStorage.getItem("graphdemo_save");
    if (data)
        editor.graph.configure(JSON.parse(data));
    console.log("loaded");
});

elem.querySelector<HTMLButtonElement>("#download")!.addEventListener("click", () => {
    var data = JSON.stringify(editor.graph.serialize());
    var file = new Blob([data]);
    var url = URL.createObjectURL(file);
    var element = document.createElement("a");
    element.setAttribute('href', url);
    element.setAttribute('download', "graph.JSON");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => { URL.revokeObjectURL(url); }, 1000 * 60); //wait one minute to revoke url
});

elem.querySelector<HTMLButtonElement>("#webgl")!.addEventListener("click", enableWebGL);
elem.querySelector<HTMLButtonElement>("#multiview")!.addEventListener("click", () => { editor.addMultiview() });

function addDemo(name: string, url: string | (() => void)) {
    var option = document.createElement("option") as OptionElemExt;
    if (typeof url === "string")
        option.dataset["url"] = url;
    else if (typeof url === "function")
        option.callback = url;
    option.innerHTML = name;
    select.appendChild(option);
}

//some examples
addDemo("Features", "examples/features.json");
addDemo("Benchmark", "examples/benchmark.json");
addDemo("Subgraph", "examples/subgraph.json");
addDemo("Audio", "examples/audio.json");
addDemo("Audio Delay", "examples/audio_delay.json");
addDemo("Audio Reverb", "examples/audio_reverb.json");
addDemo("MIDI Generation", "examples/midi_generation.json");
addDemo("autobackup", function() {
    var data = localStorage.getItem("litegraphg demo backup");
    if (!data)
        return;
    var graph_data = JSON.parse(data);
    editor.graph.configure(graph_data);
});

function enableWebGL() {

}

demo(editor.graph);
