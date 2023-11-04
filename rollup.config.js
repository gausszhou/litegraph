import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { uglify } from "rollup-plugin-uglify";

export default [
  {
    input: "src/litegraph/core",
    output: [
      {
        format: "umd",
        file: "lib/litegraph.core.umd.js",
        name: "litegraph"
      },
      {
        format: "esm",
        file: "lib/litegraph.core.esm.js"
      }
    ],
    plugins: [uglify(), typescript(), postcss()]
  },
  {
    input: "src/litegraph/index",
    output: [
      {
        format: "umd",
        file: "lib/litegraph.full.umd.js",
        name: "litegraph"
      },
      {
        format: "esm",
        file: "lib/litegraph.full.esm.js"
      }
    ],
    plugins: [uglify(), typescript(), postcss()]
  }
];