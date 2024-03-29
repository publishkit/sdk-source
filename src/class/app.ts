import Utils from "../utils/index";
import Plugins from "../plugins";
import UI from "../ui";
// @ts-ignore
import EventEmitter from "../lib/ee.js";

export default class App {
  utils: typeof Utils;
  cache: AppCache;
  plugins: Plugins;
  ui: UI;
  ee: EventEmitter;

  constructor() {
    this.utils = window.utils = window.$utils = Utils;
    this.plugins = window.$plugins = new Plugins(this);
    this.ui = window.$ui = new UI(this);
    this.ee = window.$ee = new EventEmitter();
    window.$cfg = this.cfg;
  }

  cfg = (key: string, fallback: any) => {
    const value = this.utils.o.get(this.cache.config, key);
    if (typeof value == "undefined") return fallback;
    else return value;
  };

  loadDirsConfig = async () => {
    if (!window.kit.dirs) return [];

    const dirs = location.pathname
      .replace(window.kit.base, "")
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
    const { plugins } = this;
    const kitrc = window.kitrc || {};

    let kitdb: ObjectAny = {};
    let frontmatter = {};
    let tags: string[] = [];
    const dirs = await this.loadDirsConfig();

    try {
      kitdb = <ObjectAny>(
        await this.utils.w.getData(`kitdb.json`, { nocache: true, json: true })
      );
    } catch (e) {}
    try {
      frontmatter = JSON.parse($("template#frontmatter").html());
    } catch (e) {}

    this.cache = {
      config: this.utils.o.merge({}, kitrc, ...dirs, frontmatter),
      kitrc,
      dirs,
      frontmatter,
      fly: {},
      kitdb,
      tags,
    };

    window.$kitrc = window.kitrc = kitrc;
    window.$kitdb = window.kitdb = kitdb;
    window.$dirs = window.dirs = dirs;

    const ui = await this.ui.create();
    await plugins.init();
    await plugins.deps();
    await plugins.render();
    await ui.render();
    await plugins.transform();
    await plugins.style();
    await ui.draw();
    await plugins.bind();
    plugins.summary();
  };

  goto = (relativePath: string) => {
    // @ts-ignore
    window.location = `${window.$kit.base}${relativePath}`;
  };
}
