import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App, options: ObjectAny) {
    super(app, options);
    this.id = "highlightjs";
    this.deps = [
      "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js",
    ];
    this.css = () =>
      this.options.theme
        ? [
            `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/${this.options.theme}.min.css`,
          ]
        : [];
  }

  code = async () => {
    // themes - https://github.com/highlightjs/highlight.js/tree/main/src/styles
    // demo - https://highlightjs.org/static/demo/
    document.querySelectorAll("pre code").forEach((el) => {
      window.hljs.highlightElement(el);
    });
  };
}
