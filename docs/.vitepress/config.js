import { defineConfig } from "vitepress";
export default defineConfig({
  base: "/docs",
  outDir: "../dist/docs",
  title: "LiteGraph",
  description: "",
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    nav: nav(),

    sidebar: {
      "/guide/": sidebarGuide()
    },

    editLink: {
      pattern: "https://github.com/gausszhou/litegraph/docs/:path",
      text: "Edit this page on GitHub"
    },

    socialLinks: [{ icon: "github", link: "https://github.com/gausszhou/litegraph" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2022-present Gauss Zhou"
    }
  }
});

function nav() {
  return [
    {
      text: "指南",
      link: "/guide/"
    }
  ];
}
function sidebarGuide() {
  return [
    {
      text: "Introduction",
      collapsible: true,
      items: [
        { text: "What is LiteGraph?", link: "/guide/introduction" },
        { text: "Getting Started", link: "/guide/getting-started" },
        { text: "Class", link: "/guide/class" },
        { text: "Node", link: "/guide/node" }
      ]
    }
  ];
}
