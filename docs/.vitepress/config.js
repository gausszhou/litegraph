import { defineConfig } from "vitepress";

const repository = "https://github.com/gausszhou/litegraph";

function guideSidebar(lang) {
  const zh = lang === "zh";
  return [
    {
      text: zh ? "指南" : "Guide",
      items: [
        { text: zh ? "LiteGraph 是什么" : "What is LiteGraph", link: `${lang === "zh" ? "" : "/en"}/guide/introduction` },
        { text: zh ? "快速开始" : "Getting Started", link: `${lang === "zh" ? "" : "/en"}/guide/getting-started` },
        { text: zh ? "包与导入方式" : "Packages & Imports", link: `${lang === "zh" ? "" : "/en"}/guide/packages` },
        { text: zh ? "示例应用" : "Example Apps", link: `${lang === "zh" ? "" : "/en"}/guide/examples` },
        { text: zh ? "贡献指南" : "Contributing", link: `${lang === "zh" ? "" : "/en"}/guide/contributing` }
      ]
    },
    {
      text: zh ? "参考" : "Reference",
      items: [
        { text: zh ? "节点目录" : "Node Catalog", link: `${lang === "zh" ? "" : "/en"}/nodes/` },
        { text: "API", link: "/api/" },
        { text: zh ? "路线图" : "Roadmap", link: `${repository}/blob/master/ROADMAP.md` }
      ]
    }
  ];
}

function nodesSidebar(lang) {
  const zh = lang === "zh";
  const prefix = zh ? "" : "/en";
  const packs = [
    ["", zh ? "概览" : "Overview"],
    ["core", zh ? "核心内建（graph/*）" : "Core built-ins (graph/*)"],
    ["basic", "basic"],
    ["math", "math"],
    ["logic", "logic"],
    ["strings", "strings"],
    ["events", "events"],
    ["input", "input"],
    ["widget", "widget"],
    ["graphics", "graphics"],
    ["audio", "audio"],
    ["midi", "midi"]
  ];
  return [
    {
      text: zh ? "节点目录" : "Node Catalog",
      items: packs.map(([slug, label]) => ({ text: label, link: `${prefix}/nodes/${slug}` }))
    }
  ];
}

function apiSidebar(prefix = "") {
  return [
    {
      text: "API",
      items: [
        { text: "Overview", link: `${prefix}/api/` },
        { text: "LiteGraph (registry)", link: `${prefix}/api/classes/LiteGraph` },
        { text: "LGraph (graph)", link: `${prefix}/api/classes/LGraph` },
        { text: "LGraphNode (node)", link: `${prefix}/api/classes/LGraphNode` },
        { text: "LGraphCanvas (canvas)", link: `${prefix}/api/classes/LGraphCanvas` },
        { text: "LLink (link)", link: `${prefix}/api/classes/LLink` },
        { text: "Subgraph", link: `${prefix}/api/classes/Subgraph` }
      ]
    }
  ];
}

export default defineConfig({
  base: process.env.DOCS_BASE || "/litegraph/docs",
  outDir: "../dist/docs",
  title: "LiteGraph",
  description: "TypeScript 节点图引擎：Canvas2D 编辑器、可执行图与可插拔节点包",
  lang: "zh-CN",
  lastUpdated: true,
  ignoreDeadLinks: true,
  cleanUrls: false,

  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      themeConfig: {
        nav: [
          { text: "指南", link: "/guide/introduction", activeMatch: "/guide/" },
          { text: "节点目录", link: "/nodes/", activeMatch: "/nodes/" },
          { text: "API", link: "/api/", activeMatch: "/api/" },
          { text: "Demo", link: "https://gausszhou.github.io/litegraph/demo/" }
        ],
        sidebar: {
          "/guide/": guideSidebar("zh"),
          "/nodes/": nodesSidebar("zh"),
          "/api/": apiSidebar()
        },
        outline: { level: [2, 3], label: "本页目录" },
        docFooter: { prev: "上一篇", next: "下一篇" },
        darkModeSwitchLabel: "主题",
        sidebarMenuLabel: "菜单",
        returnToTopLabel: "回到顶部",
        langMenuLabel: "切换语言",
        editLink: {
          pattern: `${repository}/edit/master/docs/:path`,
          text: "在 GitHub 上编辑此页"
        },
        search: {
          provider: "local",
          options: {
            translations: {
              button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
              modal: {
                noResultsText: "没有找到结果",
                resetButtonTitle: "清空",
                footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" }
              }
            }
          }
        },
        footer: {
          message: "Released under the MIT License.",
          copyright: "Copyright © 2022-present Gauss Zhou"
        }
      }
    },

    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      title: "LiteGraph",
      description: "A TypeScript node-graph engine: Canvas2D editor, executable graphs and pluggable node packs",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/en/guide/introduction", activeMatch: "/en/guide/" },
          { text: "Node Catalog", link: "/en/nodes/", activeMatch: "/en/nodes/" },
          { text: "API", link: "/en/api/", activeMatch: "/en/api/" },
          { text: "Demo", link: "https://gausszhou.github.io/litegraph/demo/" }
        ],
        sidebar: {
          "/en/guide/": guideSidebar("en"),
          "/en/nodes/": nodesSidebar("en"),
          "/en/api/": apiSidebar("/en")
        },
        outline: { level: [2, 3], label: "On this page" },
        docFooter: { prev: "Previous", next: "Next" },
        darkModeSwitchLabel: "Appearance",
        sidebarMenuLabel: "Menu",
        returnToTopLabel: "Return to top",
        langMenuLabel: "Change language",
        search: {
          provider: "local",
          options: {
            translations: {
              button: { buttonText: "Search docs", buttonAriaLabel: "Search docs" },
              modal: {
                noResultsText: "No results found",
                resetButtonTitle: "Clear",
                footer: { selectText: "Select", navigateText: "Switch", closeText: "Close" }
              }
            }
          }
        },
        footer: {
          message: "Released under the MIT License.",
          copyright: "Copyright © 2022-present Gauss Zhou"
        }
      }
    }
  },

  themeConfig: {
    editLink: {
      pattern: `${repository}/edit/master/docs/:path`,
      text: "Edit this page on GitHub"
    },
    socialLinks: [{ icon: "github", link: repository }]
  }
});
