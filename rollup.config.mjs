import * as dotenv from "dotenv-flow";
dotenv.config();
import typescript from "@rollup/plugin-typescript";

import css from "rollup-plugin-import-css";
import obfuscator from "rollup-plugin-obfuscator";
import cleanup from "rollup-plugin-cleanup";
import replace from "rollup-plugin-replace";
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
      replace({
        "process.env.PK_URL": JSON.stringify(process.env.PK_URL),
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
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
        "process.env.PK_URL": JSON.stringify(process.env.PK_URL),
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
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
      replace({
        "process.env.PK_URL": JSON.stringify(process.env.PK_URL),
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
      }),
      cleanup(),
      css({ output: "pk.css", minify: false }),
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
        "process.env.PK_URL": JSON.stringify(process.env.PK_URL),
        "process.env.PK_API": JSON.stringify(process.env.PK_API),
      }),
      cleanup(),
    ],
  });
}

export default rollup;
