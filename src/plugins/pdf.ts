import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  bind = async () => {
    const { options } = this;

    const pdfs = [...document.querySelectorAll("iframe[src]")].filter(
      (e: HTMLIFrameElement) => e.src.includes(".pdf")
    );

    for (const el of pdfs) {
      const wrapper = $(el).parent();
      if (options.toolbar === false) {
        const src = el.getAttribute("src") + "#toolbar=0";
        el.setAttribute("src", "");
        setTimeout(() => el.setAttribute("src", src), 10);
        wrapper.addClass("notoolbar");
      }
      if (options.width) {
        wrapper.css("width", options.width);
      }
    }
  };
}
