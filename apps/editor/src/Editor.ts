import {
  LGraph,
  LGraphStatus,
  LGraphCanvas,
  LiteGraph,
} from "./lib/litegraph.mjs";
// import {
//   LGraph,
//   LGraphStatus,
//   LGraphCanvas,
//   LiteGraph,
// } from "@gausszhou/litegraph";

import features from "./features/index";
LiteGraph.use(features);
LiteGraph.debug = false;
LiteGraph.node_images_path = "./imgs";

export type EditorOptions = {
  skipLiveMode?: boolean;
  skipMaximize?: boolean;
  miniwindow?: boolean;
};

interface OptionElemExt extends HTMLOptionElement {
  callback?: () => void;
}

export interface EditorPanel extends HTMLDivElement {}

export interface EditorMiniWindowPanel extends HTMLDivElement {
  graphCanvas: LGraphCanvas;
  close: () => void;
}

export interface EditorLoadCounter extends HTMLDivElement {}

export default class Editor {
  containerId: string;
  options: EditorOptions;
  //
  root: EditorPanel;
  toolsLeft: HTMLElement;
  toolsRight: HTMLElement;
  selector: HTMLSelectElement;
  tools: HTMLDivElement;
  content: HTMLDivElement;
  footer: HTMLDivElement;
  canvas: HTMLCanvasElement;
  meter: EditorLoadCounter | null = null;
  //
  graph: LGraph;
  graphCanvas: LGraphCanvas;
  graphCanvas2: LGraphCanvas | null = null;
  miniwindow: EditorMiniWindowPanel | null = null;

  constructor(containerId: string, options: EditorOptions = {}) {
    this.options = options;
    this.root = this.createRoot();
    this.tools = this.root.querySelector(".tools") as HTMLDivElement;
    this.toolsLeft = this.root.querySelector(".tools-left");
    this.toolsRight = this.root.querySelector(".tools-right");
    this.content = this.root.querySelector(".content") as HTMLDivElement;
    this.footer = this.root.querySelector(".footer") as HTMLDivElement;
    this.canvas = this.root.querySelector(".graphCanvas") as HTMLCanvasElement;

    this.addLoadCounter();
    this.selector = this.createSelector();
    this.addButtonsToLeft();
    this.addButtonsToRight(options);

    if (options.miniwindow) {
      this.addMiniWindow(300, 200);
    }

    // append to DOM
    const parent = document.getElementById(containerId);
    if (parent) {
      parent.appendChild(this.root);
    }
    // create graph
    this.graph = new LGraph();
    this.graphCanvas = new LGraphCanvas(this.canvas, this.graph);
    this.graphCanvas.background_image = "./imgs/grid.png";
    this.graph.onAfterExecute = () => {
      this.graphCanvas.draw(true);
    };
    this.graphCanvas.onDropItem = this.onDropItem.bind(this);
    this.graphCanvas.resize();
    this.load()
  }
  createRoot() {
    const root = document.createElement("div") as EditorPanel;
    root.className = "litegraph litegraph-editor";
    root.innerHTML = `
        <div class='header'>
          <div class='tools tools-left'></div>
          <div class='tools tools-right'></div>
        </div>
        <div class='content'>
          <div class='editor-area'>
            <canvas class='graphCanvas'></canvas>
          </div>
        </div>
        `;
    return root;
  }

  addLoadCounter() {
    this.meter = document.createElement("div") as EditorLoadCounter;
    this.meter.className = "headerpanel loadmeter toolbar-widget";

    var html = `
<div class='cpuload'>
  <strong>CPU</strong>
  <div class='bgload'>
    <div class='fgload'></div>
  </div>
</div>
<div class='gpuload'>
  <strong>GFX</strong>
  <div class='bgload'>
    <div class='fgload'></div>
  </div>
</div>
`;

    this.meter.innerHTML = html;
    this.root
      .querySelector<HTMLDivElement>(".header .tools-left")!
      .appendChild(this.meter);
    var self = this;

    setInterval(() => {
      this.meter!.querySelector<HTMLDivElement>(
        ".cpuload .fgload"
      )!.style.width = 2 * self.graph.execution_time * 90 + "px";
      if (self.graph.status == LGraphStatus.STATUS_RUNNING) {
        this.meter!.querySelector<HTMLDivElement>(
          ".gpuload .fgload"
        )!.style.width = self.graphCanvas.render_time * 10 * 90 + "px";
      } else {
        this.meter!.querySelector<HTMLDivElement>(
          ".gpuload .fgload"
        )!.style.width = 4 + "px";
      }
    }, 200);
  }

  addToolsButton(
    id: string,
    name: string,
    icon_url: string,
    callback: EventListener,
    container: string
  ) {
    if (!container) {
      container = ".tools";
    }
    var button = this.createButton(name, icon_url, callback);
    button.id = id;
    this.root.querySelector(container)!.appendChild(button);
  }
  createSelector() {
    const elem = document.createElement("span") as HTMLSpanElement;
    elem.id = "LGEditorTopBarSelector";
    elem.className = "selector";
    elem.innerHTML = `
    <select>
      <option>Empty</option>
    </select>
    `;
    const selector = elem.querySelector<HTMLSelectElement>("select")!;
    selector.addEventListener("change", (_e) => {
      var option = this.selector.options[
        this.selector.selectedIndex
      ] as OptionElemExt;
      var url = option.dataset["url"];

      if (url) {
        this.graph.load(url);
      } else if (option.callback) {
        option.callback();
      } else {
        this.graph.clear();
      }
    });
    this.toolsLeft.appendChild(elem);
    return selector;
  }

  createButton(name: string, icon_url: string, callback?: EventListener) {
    var button = document.createElement("button");
    if (icon_url) {
      button.innerHTML = "<img src='" + icon_url + "'/> ";
    }
    button.classList.add("btn");
    button.innerHTML += name;
    if (callback) button.addEventListener("click", callback);
    return button;
  }

  addButtonsToLeft() {
    this.addToolsButton("save", "Save", "", this.save, ".tools-left");
    this.addToolsButton("load", "Load", "", this.load, ".tools-left");
    this.addToolsButton(
      "download",
      "Download",
      "",
      this.download,
      ".tools-left"
    );
  }
  addButtonsToRight(options) {
    this.addToolsButton(
      "playnode_button",
      "Play",
      "imgs/icon-play.png",
      this.onPlayButton.bind(this),
      ".tools-right"
    );
    this.addToolsButton(
      "playstepnode_button",
      "Step",
      "imgs/icon-playstep.png",
      this.onPlayStepButton.bind(this),
      ".tools-right"
    );

    if (!options.skipLiveMode) {
      this.addToolsButton(
        "livemode_button",
        "Live",
        "imgs/icon-record.png",
        this.onLiveButton.bind(this),
        ".tools-right"
      );
    }
    if (!options.skipMaximize) {
      this.addToolsButton(
        "maximize_button",
        "",
        "imgs/icon-maximize.png",
        this.onFullscreenButton.bind(this),
        ".tools-right"
      );
    }
  }

  save() {
    try {
      localStorage.setItem(
        "graphdemo_save",
        JSON.stringify(this.graph.serialize())
      );
      console.log("saved");
    } catch (error) {
      console.log("save error", error);
    }
  }

  load() {
    const data = localStorage.getItem("graphdemo_save");
    if (data) {
      try {
        this.graph.configure(JSON.parse(data));
        console.log("loaded");
      } catch (error) {
        console.log("load error", error);
      }
    }
  }

  download() {
    var data = JSON.stringify(this.graph.serialize());
    var file = new Blob([data]);
    var url = URL.createObjectURL(file);
    var element = document.createElement("a");
    element.setAttribute("href", url);
    element.setAttribute("download", "graph.json");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000 * 60);
  }

  onPlayButton() {
    var graph = this.graph;
    var button =
      this.root.querySelector<HTMLButtonElement>("#playnode_button")!;

    if (graph.status == LGraphStatus.STATUS_STOPPED) {
      button.innerHTML = "<img src='imgs/icon-stop.png'/> Stop";
      graph.start();
    } else {
      button.innerHTML = "<img src='imgs/icon-play.png'/> Play";
      graph.stop();
    }
  }

  onPlayStepButton() {
    var graph = this.graph;
    graph.runStep(1);
    this.graphCanvas.draw(true, true);
  }

  onLiveButton() {
    var is_live_mode = !this.graphCanvas.live_mode;
    this.graphCanvas.switchLiveMode(true);
    this.graphCanvas.draw();
    var button =
      this.root.querySelector<HTMLButtonElement>("#livemode_button")!;
    button.innerHTML = !is_live_mode
      ? "<img src='imgs/icon-record.png'/> Live"
      : "<img src='imgs/icon-gear.png'/> Edit";
  }

  onDropItem(e: DragEvent) {
    if (!e.dataTransfer) {
      return;
    }

    var that = this;
    for (let i = 0; i < e.dataTransfer.files.length; ++i) {
      let file = e.dataTransfer.files[i];
      let ext = LGraphCanvas.getFileExtension(file.name);
      let reader = new FileReader();
      if (ext == "json") {
        reader.onload = function (_event: Event) {
          var data = JSON.parse(reader.result as string);
          that.graph.configure(data);
        };
        reader.readAsText(file);
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    } else {
      throw "Fullscreen not supported";
    }

    var self = this;
    setTimeout(function () {
      self.graphCanvas.resize();
    }, 100);
  }

  onFullscreenButton() {
    this.toggleFullscreen();
  }

  addMiniWindow(w: number, h: number) {
    if (this.miniwindow) {
      console.warn("Miniwindow already created.");
      this.miniwindow.close();
    }

    this.miniwindow = document.createElement("div") as EditorMiniWindowPanel;
    this.miniwindow.className = "litegraph miniwindow";
    this.miniwindow.innerHTML =
      "<canvas class='graphCanvas' width='" +
      w +
      "' height='" +
      h +
      "' tabindex=10></canvas>";

    var graphCanvas = new LGraphCanvas(this.canvas, this.graph);
    graphCanvas.show_info = false;
    graphCanvas.background_image = "imgs/grid.png";
    graphCanvas.scale = 0.25;
    graphCanvas.allow_dragnodes = false;
    graphCanvas.allow_interaction = false;
    graphCanvas.render_shadows = false;
    graphCanvas.maxZoom = 0.25;
    this.miniwindow.graphCanvas = graphCanvas;
    graphCanvas.onClear = function () {
      graphCanvas.scale = 0.25;
      graphCanvas.allow_dragnodes = false;
      graphCanvas.allow_interaction = false;
    };
    graphCanvas.onRenderBackground = (
      _canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D
    ) => {
      ctx.strokeStyle = "#567";
      var tl = graphCanvas.convertOffsetToCanvas([0, 0]);
      var br = graphCanvas.convertOffsetToCanvas([
        graphCanvas.canvas.width,
        graphCanvas.canvas.height,
      ]);
      tl = graphCanvas.convertCanvasToOffset(tl);
      br = graphCanvas.convertCanvasToOffset(br);
      ctx.lineWidth = 1;
      ctx.strokeRect(
        Math.floor(tl[0]) + 0.5,
        Math.floor(tl[1]) + 0.5,
        Math.floor(br[0] - tl[0]),
        Math.floor(br[1] - tl[1])
      );
    };

    this.miniwindow.style.position = "absolute";
    this.miniwindow.style.top = "4px";
    this.miniwindow.style.right = "4px";

    this.miniwindow.close = () => {
      graphCanvas.setGraph(null);
      this.miniwindow!.parentNode!.removeChild(this.miniwindow!);
    };

    var close_button = document.createElement("div");
    close_button.className = "corner-button";
    close_button.innerHTML = "&#10060;";
    close_button.addEventListener("click", this.miniwindow.close.bind(this));
    this.miniwindow.appendChild(close_button);

    this.root
      .querySelector<HTMLDivElement>(".content")!
      .appendChild(this.miniwindow);
  }

  addMultiview() {
    var canvas = this.canvas;
    this.graphCanvas.ctx.fillStyle = "black";
    this.graphCanvas.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.graphCanvas.viewport = [0, 0, canvas.width * 0.5 - 2, canvas.height];

    var graphCanvas2 = new LGraphCanvas(canvas, this.graph);
    graphCanvas2.background_image = "imgs/grid.png";
    this.graphCanvas2 = graphCanvas2;
    this.graphCanvas2.viewport = [
      canvas.width * 0.5,
      0,
      canvas.width * 0.5,
      canvas.height,
    ];
  }
}
