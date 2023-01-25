import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
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

  apply = (el: Element) => {
    window.hljs.highlightElement(el);
  };

  bind = async () => {
    // themes - https://github.com/highlightjs/highlight.js/tree/main/src/styles
    // demo - https://highlightjs.org/static/demo/

    window.hljs.configure({
      ignoreUnescapedHTML: true
    })

    document.querySelectorAll("pre code").forEach((el) => {
      this.apply(el);
    });
  };
}
