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

  cfg = (key: string, fallback: any) =>
    this.utils.o.get(this.cache.config, key) || fallback;

  init = async () => {
    const pkrc = (window.pkrc || {});
    let frontmatter = {};
    let searchdb: ObjectAny[] = [];
    let tags = [];

    try {
      searchdb = Object.values(
        JSON.parse(await this.utils.w.getData("/searchdb.json"))
      );
    } catch (e) {}
    try {
      frontmatter = JSON.parse(
        unescape($("meta[name=frontmatter]").prop("content"))
      );
    } catch (e) {}
    try {
      tags = JSON.parse(unescape($("meta[name=tags]").prop("content")));
    } catch (e) {}

    this.cache = {
        pkrc,
        config: this.utils.o.merge(pkrc, frontmatter),
        frontmatter,
        searchdb,
        tags
    }


    const ui = await this.ui.create();
    await this.plugins.init();
    await ui.render();
    const run = await this.plugins.run();
  };
}
