import "./litegraph-editor/index.scss";
import "./main.scss";
import LiteGraph from "./litegraph";
import Features from "./features";
import Editor from "./litegraph-editor/index";

(async () => {
  const Nodes = await (await import("./litegraph/built-in-nodes.js")).default;
  LiteGraph.use(Nodes);
  LiteGraph.use(Features);
  LiteGraph.Editor = Editor;

  //enable scripting
  LiteGraph.allow_scripts = true;
  LiteGraph.node_images_path = "./imgs/";

  let webgl_canvas = null;
  const editor = new LiteGraph.Editor("main", { miniwindow: false });

  // window
  window.LiteGraph = LiteGraph;
  window.graphcanvas = editor.graphcanvas;
  window.graph = editor.graph;

  window.addEventListener("resize", function () {
    editor.graphcanvas.resize();
  });

  // store data
  window.onbeforeunload = function () {
    var data = JSON.stringify(editor.graph.serialize());
    localStorage.setItem("litegraphg demo backup", data);
  };

  // create scene selector
  var leftTools = document.createElement("span");
  leftTools.id = "LGEditorTopBarLeftTools";
  leftTools.className = "selector";
  leftTools.innerHTML = `
Scene 
<select>
  <option>Empty</option>
</select>
<button class='btn' id='save'>Save</button>
<button class='btn' id='load'>Load</button>
<button class='btn' id='download'>Download</button>
`;
// | 
// <button class='btn' id='webgl'>WebGL</button>
{/* <button class='btn' id='multiview'>Multiview</button> */}

  editor.tools.appendChild(leftTools);

  const select = leftTools.querySelector("select");

  // some examples
  addDemo("Features", "examples/features.json");
  addDemo("Benchmark", "examples/benchmark.json");
  addDemo("Subgraph", "examples/subgraph.json");
  addDemo("Audio", "examples/audio.json");
  addDemo("Audio Delay", "examples/audio_delay.json");
  addDemo("Audio Reverb", "examples/audio_reverb.json");
  addDemo("MIDI Generation", "examples/midi_generation.json");

  function addDemo(name, url) {
    const option = document.createElement("option");
    if (url.constructor === String) option.dataset["url"] = url;
    else option.callback = url;
    option.innerHTML = name;
    select.appendChild(option);
  }

  select.addEventListener("change", function () {
    var option = this.options[this.selectedIndex];
    var url = option.dataset["url"];
    if (url) editor.graph.load(url);
    else if (option.callback) option.callback();
    else editor.graph.clear();
  });

  // other button
  leftTools.querySelector("#save").addEventListener("click", function () {
    console.log("saved");
    localStorage.setItem("graphdemo_save", JSON.stringify(editor.graph.serialize()));
  });

  leftTools.querySelector("#load").addEventListener("click", function () {
    var data = localStorage.getItem("graphdemo_save");
    if (data) editor.graph.configure(JSON.parse(data));
    console.log("loaded");
  });

  leftTools.querySelector("#download").addEventListener("click", function () {
    const data = JSON.stringify(editor.graph.serialize());
    const file = new Blob([data]);
    const url = URL.createObjectURL(file);
    var element = document.createElement("a");
    element.setAttribute("href", url);
    element.setAttribute("download", "graph.json");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    //wait one minute to revoke url
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000 * 60);
  });

  // leftTools.querySelector("#webgl").addEventListener("click", () => {
  //   enableWebGL();
  // });

  // leftTools.querySelector("#multiview").addEventListener("click", () => {
  //   editor.toggleMultiview();
  // });

  //allows to use the WebGL nodes like textures
  function enableWebGL() {
    if (webgl_canvas) {
      webgl_canvas.style.display = webgl_canvas.style.display == "none" ? "block" : "none";
      return;
    }
    on_ready();
    function on_ready() {
      if (!window.GL) return;
      webgl_canvas = document.createElement("canvas");
      webgl_canvas.width = 400;
      webgl_canvas.height = 300;
      webgl_canvas.style.position = "absolute";
      webgl_canvas.style.top = "0px";
      webgl_canvas.style.right = "0px";
      webgl_canvas.style.border = "1px solid #AAA";

      webgl_canvas.addEventListener("click", function () {
        var rect = webgl_canvas.parentNode.getBoundingClientRect();
        if (webgl_canvas.width != rect.width) {
          webgl_canvas.width = rect.width;
          webgl_canvas.height = rect.height;
        } else {
          webgl_canvas.width = 400;
          webgl_canvas.height = 300;
        }
      });

      var parent = document.querySelector(".editor-area");
      parent.appendChild(webgl_canvas);
      var gl = GL.create({ canvas: webgl_canvas });
      if (!gl) return;

      editor.graph.onBeforeStep = ondraw;

      console.log("webgl ready");

      function ondraw() {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      }
    }
  }
})();
