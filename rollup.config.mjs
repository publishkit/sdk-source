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
const dist = "../kit";

if (NODE_ENV == "prod") {
  // KIT
  rollup.push({
    input: "src/kit.ts",
    output: { file: `${dist}/kit.js`, format: "iife" },
    plugins: [
      typescript(),
      less({ output: `${dist}/kit.css`, sourcemap: false, minify: true }),
      replace({
        "process.env.KIT_API": JSON.stringify(process.env.KIT_API),
        "process.env.KIT_URL": JSON.stringify(process.env.KIT_URL),
      }),
      cleanup(),
      obfuscator.default(),
    ],
  });

  // INIT
  rollup.push({
    input: "src/init.ts",
    output: { file: `${dist}/init.js`, format: "iife" },
    plugins: [
      typescript(),
      replace({
        "process.env.KIT_API": JSON.stringify(process.env.KIT_API),
        "process.env.KIT_URL": JSON.stringify(process.env.KIT_URL),
      }),
      cleanup(),
      obfuscator.default(),
    ],
  });
}

if (NODE_ENV == "dev") {
  // KIT
  rollup.push({
    input: "src/kit.ts",
    output: { file: `dev/kit.js`, format: "iife" },
    plugins: [
      typescript(),
      less({ output: "dev/kit.css", sourcemap: true, minify: false }),
      replace({
        "process.env.KIT_API": JSON.stringify(process.env.KIT_API),
        "process.env.KIT_URL": JSON.stringify(process.env.KIT_URL),
      }),
      cleanup(),
    ],
  });

  // INIT
  rollup.push({
    input: "src/init.ts",
    output: { file: `dev/init.js`, format: "iife" },
    plugins: [
      typescript({
        include: [
          "src/init.ts",
          "src/class/kit.ts",
          "src/utils/crypto.ts",
          "src/**/global.d.ts",
        ],
      }),
      replace({
        "process.env.KIT_API": JSON.stringify(process.env.KIT_API),
        "process.env.KIT_URL": JSON.stringify(process.env.KIT_URL),
      }),
      cleanup(),
    ],
  });
}

export default rollup;
