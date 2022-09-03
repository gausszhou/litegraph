import typescript from '@rollup/plugin-typescript';
import { uglify } from "rollup-plugin-uglify";
import postcss from 'rollup-plugin-postcss';

export default [
  {
    input: "src/litegraph/index",
    output: [
      {
        format: "umd",
        file: "lib/bundle.umd.js",
        name: "litegraph"
      },
      {
        format: "esm",
        file: "lib/bundle.esm.js"
      }
    ],
    plugins: [uglify(), typescript(), postcss()]
  }
];