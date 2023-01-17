import Utils from "./utils/index";
import Plugins from "./plugins";
import Theme from "./theme";
import UI from "./ui";
import { AppCache } from "./def/app";

export default class App {
  utils: typeof Utils;
  cache: AppCache;
  plugins: Plugins;
  theme: Theme;
  ui: UI;

  constructor() {
    this.utils = Utils;
    this.theme = new Theme(this);
    this.plugins = new Plugins(this);
    this.ui = new UI(this);
  }

  cfg = (key: string, fallback: any) => {
    const value = this.utils.o.get(this.cache.config, key);
    if (typeof value == "undefined") return fallback;
    else return value;
  };

  init = async () => {
    const pkrc = window.pkrc || {};
    let pkdb: ObjectAny = {};
    let frontmatter = {};
    let tags: string[] = [];

    try {
      pkdb = JSON.parse(await this.utils.w.getData("pkdb.json"));
    } catch (e) {}
    try {
      frontmatter = JSON.parse($("template#pkrc").html());
    } catch (e) {}

    this.cache = {
      pkrc,
      config: this.utils.o.merge(pkrc, frontmatter),
      frontmatter,
      pkdb,
      tags,
    };

    const ui = await this.ui.create();
    await this.plugins.init();
    await ui.render();
    const run = await this.plugins.run();
  };
}
