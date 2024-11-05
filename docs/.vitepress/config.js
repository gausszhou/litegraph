import { defineConfig } from "vitepress";
function nav() {
  return [
    {
      text: "Guide",
      link: "/guide/introduction"
    },
    {
      text: "Demo",
      link: "https://gausszhou.github.io/litegraph/demo/"
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

export default defineConfig({
  base: "/litegraph/docs",
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
      pattern: "https://github.com/gausszhou/litegraph/edit/master/docs/:path",
      text: "Edit this page on GitHub"
    },

    socialLinks: [{ icon: "github", link: "https://github.com/gausszhou/litegraph" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2022-present Gauss Zhou"
    }
  }
});

