import Utils from "./utils/index";
import Plugins from "./plugins";
import Theme from "./theme";
import UI from "./ui";

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

  loadDirsConfig = async () => {
    if (!window.pk.dirs) return [];

    const dirs = location.pathname
      .replace(window.pk.base, "")
      .split("/")
      .slice(0, -1)
      .filter(Boolean);

    const paths = dirs.map((dir, i) => {
      if (i == 0) return dir;
      const prev = dirs[i - 1];
      return [prev, dir].join("/");
    });

    const files = await Promise.allSettled(
      paths.map(async (path) => {
        return this.utils.w.getData(`${path}/dirrc.json`, {
          nocache: true,
          json: true,
        });
      })
    );

    // @ts-ignore
    return files.map((r) => r.value).filter(Boolean);
  };

  init = async () => {
    const pkrc = window.pkrc || {};
    let pkdb: ObjectAny = {};
    let frontmatter = {};
    let tags: string[] = [];
    const dirs = await this.loadDirsConfig();

    try {
      pkdb = <ObjectAny>(
        await this.utils.w.getData(`pkdb.json`, { nocache: true, json: true })
      );
    } catch (e) {}
    try {
      frontmatter = JSON.parse($("template#frontmatter").html());
    } catch (e) {}

    this.cache = {
      config: this.utils.o.merge({}, pkrc, ...dirs, frontmatter),
      pkrc,
      dirs,
      frontmatter,
      fly: {},
      pkdb,
      tags,
    };

    const ui = await this.ui.create();
    await this.plugins.init();
    await ui.render();
    await this.plugins.run();
  };
}
