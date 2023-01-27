import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  apply = (el: Element) => {
    window.hljs.highlightElement(el);
  };

  bind = async () => {
    const { options, utils } = this;

    if (options.theme) {
      await utils.dom.addScript(
        "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js"
      );
      await utils.dom.addStylesheet(
        `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/${options.theme}.min.css`
      );
      (function wait() {
        if (!window.hljs) {
          setTimeout(wait, 100);
        } else {
          window.hljs.configure({
            ignoreUnescapedHTML: true,
          });

          document.querySelectorAll("pre code").forEach((el) => {
            window.hljs.highlightElement(el);
          });
        }
      })();
    }
  };
}
