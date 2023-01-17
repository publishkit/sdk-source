import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "pdf";
  }

  code = async () => {
    const pdfs = [...document.querySelectorAll("iframe[src]")].filter(
      (e: HTMLIFrameElement) => e.src.includes(".pdf")
    );

    for (const el of pdfs) {
      const wrapper = $(el).parent();
      if (this.app.cfg("pdf.toolbar") === false) {
        const src = el.getAttribute("src") + "#toolbar=0";
        el.setAttribute("src", "");
        setTimeout(() => el.setAttribute("src", src), 10);
        wrapper.addClass("notoolbar");
      }
      if (this.app.cfg("pdf.width")) {
        wrapper.css("width", this.app.cfg("pdf.width"));
      }
    }
  };
}
