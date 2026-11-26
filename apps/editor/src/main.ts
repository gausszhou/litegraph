import "@gausszhou/litegraph-core/style.css";

import {
  audio1,
  audio2,
  audio3,
  basic1,
  basic2,
  basic3,
  circuit1,
  events,
  widgets,
} from "./demos";
import Editor from "./Editor";

interface OptionElemExt extends HTMLOptionElement {
  callback?: () => void;
}

const BACKUP_KEY = "litegraph demo backup";

const editor = new Editor("main", { miniwindow: false });
editor.graphCanvas.pause_rendering = false;

window.addEventListener("resize", () => {
  editor.graphCanvas.resize();
});

window.onbeforeunload = () => {
  // 空图没有恢复价值，避免覆盖掉上一次有内容的备份
  if (!editor.graph._nodes.length) {
    return;
  }
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(editor.graph.serialize()));
  } catch (error) {
    console.warn("[demo] 无法写入本地备份", error);
  }
};

function addDemo(name: string, description: string, source: string | (() => void)): OptionElemExt {
  const option = document.createElement("option") as OptionElemExt;
  option.value = name;
  option.title = description;
  if (typeof source === "string") {
    option.dataset["url"] = source;
  } else {
    option.callback = source;
  }
  option.textContent = name;
  editor.selector.appendChild(option);
  return option;
}

function readBackup(): unknown | null {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("[demo] 本地备份已损坏，已清除", error);
    localStorage.removeItem(BACKUP_KEY);
    return null;
  }
}

function loadBackup(data: unknown): boolean {
  try {
    // configure() 返回 true 表示有节点类型未注册
    return !editor.graph.configure(data as never);
  } catch (error) {
    console.warn("[demo] 无法恢复本地备份", error);
    return false;
  }
}

// Editor 构造时会尝试载入工具栏 Save 保存的图
const savedGraphLoaded = editor.graph._nodes.length > 0;
if (savedGraphLoaded) {
  const savedOption = addDemo("上次保存的图", "工具栏 Save 保存在 localStorage 的图", () => {
    editor.load();
  });
  editor.selector.value = savedOption.value;
}

// 函数式 demo：顺序即下拉框顺序，Basic1 是默认示例
addDemo("Basic1", "一个常量接到 watch", () => basic1(editor.graph));
addDemo("Basic2", "两个常量分别接到 watch", () => basic2(editor.graph));
addDemo("Basic3", "两个常量求和并监视", () => basic3(editor.graph));
addDemo("Widgets", "旋钮、进度条、开关与按钮", () => widgets(editor.graph));
addDemo("Events", "定时器触发计数器与日志", () => events(editor.graph));
addDemo("Audio1", "播放 audio.wav", () => audio1(editor.graph));
addDemo("Audio2", "音源 + 旋钮 + 分析器可视化", () => audio2(editor.graph));
addDemo("Audio3", "音源 + 分析器 + 示波器", () => audio3(editor.graph));
addDemo("Circuit1", "振荡器点亮 LED", () => circuit1(editor.graph));

// JSON 示例：由 graph.load() 异步加载，加载完成后自动缩放到整张图
addDemo("Features", "插槽、控件与自定义形状", "examples/features.json");
addDemo("Benchmark", "大量节点与连线的渲染基准", "examples/benchmark.json");
addDemo("Subgraph", "子图与 graph/input、graph/output", "examples/subgraph.json");
addDemo("Audio", "完整音频处理链", "examples/audio.json");
addDemo("Audio Delay", "延迟节点示例", "examples/audio_delay.json");
addDemo("Audio Reverb", "混响节点示例", "examples/audio_reverb.json");
addDemo("MIDI Generation", "MIDI 生成、量化与播放", "examples/midi_generation.json");

// 页面关闭时自动备份；存在时默认恢复，并保留一个手动入口
const backup = readBackup();
let backupOption: OptionElemExt | null = null;
if (backup) {
  backupOption = addDemo("上次编辑（自动备份）", "离开页面时自动保存的图", () => {
    if (!loadBackup(backup)) {
      basic1(editor.graph);
      editor.selector.value = "Basic1";
    }
  });
}

if (!savedGraphLoaded) {
  if (backup && loadBackup(backup) && backupOption) {
    editor.selector.value = backupOption.value;
  } else {
    basic1(editor.graph);
    editor.selector.value = "Basic1";
  }
}

editor.fitToView();
