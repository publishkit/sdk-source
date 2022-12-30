import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App, options: ObjectAny = {}) {
    super(app);
    this.id = "cdnfonts";
    this.options = options;
  }

  code = async () => {
    const { font = "" } = this.options;
    const f = font.trim().replaceAll(" ", "-").toLowerCase();
    if (!f) return;

    this.utils.d.addStylesheet(`https://fonts.cdnfonts.com/css/${f}`);
    this.utils.d.cssvar("--font-family", `${font}, sans-serif`);
  };
}
