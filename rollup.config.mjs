import * as dotenv from "dotenv-flow";
dotenv.config();
import typescript from "@rollup/plugin-typescript";

import css from "rollup-plugin-import-css";
import obfuscator from "rollup-plugin-obfuscator";
import cleanup from "rollup-plugin-cleanup";
import replace from "rollup-plugin-replace";
import less from "./plugins/rollup-less.mjs";

import pkg from "./package.json" assert { type: "json" };

const { NODE_ENV = "dev" } = process.env;
const { version, author } = pkg;
const rollup = [];
const dist = "../pk-sdk-dist";

if (NODE_ENV == "prod") {
  rollup.push({
    input: "src/index.ts",
    output: { file: `${dist}/pk.js`, format: "iife" },
    plugins: [
      typescript(),
      less({ output: `${dist}/pk.css`, sourcemap: false, minify: true }),
      replace({
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
        "process.env.PK_SDK": JSON.stringify(process.env.PK_SDK),
      }),
      cleanup(),
      css({ output: "pk.css", minify: true }),
      obfuscator.default(),
    ],
  });

  // SDK
  rollup.push({
    input: "src/sdk.ts",
    output: { file: `${dist}/sdk.js`, format: "iife" },
    plugins: [
      typescript(),
      replace({
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
        "process.env.PK_SDK": JSON.stringify(process.env.PK_SDK),
      }),
      cleanup(),
      obfuscator.default(),
    ],
  });
}

if (NODE_ENV == "dev") {
  // APP
  rollup.push({
    input: "src/index.ts",
    output: { file: `dev/pk.js`, format: "iife" },
    plugins: [
      typescript(),
      less({ output: "dev/pk.css", sourcemap: true, minify: false }),
      replace({
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
        "process.env.PK_SDK": JSON.stringify(process.env.PK_SDK),
      }),
      cleanup(),
      // css({ output: "pk.css", minify: false }),
    ],
  });

  // SDK
  rollup.push({
    input: "src/sdk.ts",
    output: { file: `dev/sdk.js`, format: "iife" },
    plugins: [
      typescript({
        include: ["src/sdk.ts", "src/pk.ts", "src/utils/crypto.ts", "src/**/global.d.ts"],
      }),
      replace({
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
        "process.env.PK_SDK": JSON.stringify(process.env.PK_SDK),
      }),
      cleanup(),
    ],
  });
}

export default rollup;
