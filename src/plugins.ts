import { App } from "./def/app";
import CorePlugins from "./plugins/index";

const CoreKeys = Object.keys(CorePlugins);
const requiredPlugins = ["global", "cssvars", "hotkeys", "modal"];
const lastPlugins = ["header"];

export default class Plugins {
  app;
  utils;

  cache: ObjectAny = {};
  options: ObjectAny = {};
  active: string[] = [];
  inactive: string[] = [];
  failed: any[] = [];

  constructor(app: App) {
    this.app = app;
    this.utils = app.utils;
  }

  log = (key: string, ...args: any[]) => {
    const cond = ["p=" + key, "plugins", "p*"];
    cond.some((value) => window.pk.debug.includes(value)) &&
      console.log(`plugins ➔`, ...args);
  };

  register = (id: string, Plugin: IPlugin) => {
    const plugin = new Plugin(this.app, this.options[id]);
    if (!id || !plugin.id) throw new Error(`plugin is missing an id`);
    if (id != plugin.id)
      throw new Error(
        `registering plugin '${id}', but provided id '${plugin.id}'`
      );
    if (this.cache[id]) throw new Error(`plugin id '${id}' already exist`);
    this.cache[id] = plugin;
  };

  registerExternal = async (id: string, url: string) => {
    const script = await this.utils.w.getData(url);
    if (!script) throw new Error(`external file not found: ${url}`);
    const fn = new Function(script);
    const plugin = await fn();
    this.log(id, "external", url);
    return this.register(id, plugin);
  };

  has = (key: string) => {
    return !!this.cache[key];
  };

  getPluginsIndex = () => {
    const { pkrc } = this.app.cache;
    const fly = this.utils.w.urlParams.getAll("p").filter(Boolean);

    fly.forEach((value) => {
      const p = this.utils.m.parseValue(value, "js");
      if (!p.key) return;
      const currentOptions = pkrc[p.key] || {};
      const options = this.utils.o.merge(currentOptions, p.options);
      this.utils.o.put(pkrc, `plugins.${p.key}`, p.url);
      this.utils.o.put(pkrc, p.key, options);
    });

    return pkrc.plugins;
  };

  init = async () => {
    const { pkrc } = this.app.cache;
    const plugins = this.getPluginsIndex();
    const unsortedKeys = this.utils.a.clean([
      ...CoreKeys,
      ...Object.keys(plugins),
    ]);
    const sorted = unsortedKeys.reduce(
      (acc, key) => {
        if (lastPlugins.includes(key)) acc.last.push(key);
        else acc.list.push(key);
        return acc;
      },
      { list: [], last: [] }
    );
    const keys = [...sorted.list, ...sorted.last];

    // https://www.stackfive.io/work/javascript/using-async-await-with-the-array-reduce-method
    // async reduce
    const load = await keys.reduce(async (prev, key: string) => {
      const acc = await prev;
      const pluginValue = plugins[key];
      // const pluginOptions = pkrc[key] = {}
      const isActive = requiredPlugins.includes(key) || pluginValue;

      if (!isActive) return this.inactive.push(key) && acc;

      try {
        this.options[key] = this.app.cfg(key) || {};

        if (CoreKeys.includes(key)) this.register(key, CorePlugins[key]);
        else await this.registerExternal(key, plugins[key]);

        const p: IPlugin = this.cache[key];

        if (p.init) {
          const init = await p.init();
          if (init) {
            // append to plugin instance & options cache
            p.options = p.options || {};
            p.options._init = init;
            this.options[key]._init = init;
          } else return this.inactive.push(key) && acc;
        }
        if (p.deps)
          acc.deps.push(typeof p.deps == "function" ? p.deps() : p.deps);
        if (p.css) acc.css.push(typeof p.css == "function" ? p.css() : p.css);
        if (p.ui) acc.ui.push([p.ui, p.options]);

        this.active.push(key);
        return acc;
      } catch (e) {
        this.log(key, `💥 ${key}`, { err: e.message });
        this.failed.push([key, e.message]);
        return acc;
      }
    }, Promise.resolve({ init: [], deps: [], css: [], ui: [] }));

    // append css
    this.utils.a
      .clean(load.css)
      .map((css) =>
        window.document.querySelector("head")!.append(this.utils.d.cssEl(css))
      );
    // append deps
    await this.utils.d.loadScript(this.utils.a.clean(load.deps));
    // apply ui
    // for now running in parallel is acceptable because few plugins
    // but because we push to ui arrays, ui will behave at random if not applied in sequence
    // @ts-ignore
    await Promise.all(load.ui.map(([fn, options]) => fn(options)));

    return load;
  };

  get = (key: string | void) => {
    if (key) return this.cache[key];
    else return this.active.map((k) => this.cache[k]).filter(Boolean);
  };

  run = async () => {
    const plugins = this.get();
    const codes = plugins
      .map((p: IPlugin) => {
        this.log(
          p.id,
          `✅ ${p.id}`,
          Object.keys(this.options[p.id]).length ? this.options[p.id] : ""
        );
        p.code && p.code();
      })
      .filter(Boolean);

    return Promise.all(codes);
  };
}
