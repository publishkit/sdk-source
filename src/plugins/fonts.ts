import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  bind = async () => {
    const { options, utils } = this;
    const { font, headings } = options;

    const f = font?.trim().replaceAll(" ", "-").toLowerCase();
    const h = headings?.trim().replaceAll(" ", "-").toLowerCase();

    if (f) {
      utils.dom.addStylesheet(`https://fonts.cdnfonts.com/css/${f}`);
      utils.dom.cssvar("--font-family", `${font}, sans-serif`);
    }

    if (h) {
      if (h != f)
        utils.dom.addStylesheet(`https://fonts.cdnfonts.com/css/${h}`);
      utils.dom.cssvar("--heading-font-family", `${headings}, sans-serif`);
    }
  };
}
