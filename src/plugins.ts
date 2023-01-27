import CorePlugins from "./plugins/index";
import BasePlugin from "./plugins/basePlugin";

const CoreKeys = Object.keys(CorePlugins);
const requiredPlugins = ["global", "hotkeys"];
const lastPlugins = ["header", "theme"];

export default class Plugins {
  app: App;
  utils;

  cache: PluginCache = {};
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

  register = (id: string, Plugin: any): BasePlugin => {
    const plugin: BasePlugin = new Plugin(id, this.options[id]);
    if (!id || !plugin.id) throw new Error(`plugin is missing an id`);
    if (id != plugin.id)
      throw new Error(
        `registering plugin '${id}', but provided id '${plugin.id}'`
      );
    if (this.cache[id]) throw new Error(`plugin id '${id}' already exist`);
    this.cache[id] = plugin;
    return plugin;
  };

  registerExternal = async (
    id: string,
    url: string | boolean,
    type?: PluginType
  ) => {
    if (id == "theme") {
      if (url === true) url = "@default";
      if (url === false) return;
      type = "theme";
    } else {
      if (typeof url == "boolean") return;
    }

    const p = this.utils.m.parseFlyPlugin(url);
    url = this.utils.m.resolvePluginUrl(type, p);
    const script = url && (await this.utils.w.getData(url, { nocache: true }));
    if (!script) throw new Error(`external file not found: ${url}`);
    const fn = new Function(script as string);
    const plugin = await fn();
    // this.log(id, "external", url);
    return this.register(id, plugin);
  };

  has = (key: string) => {
    return !!this.cache[key];
  };

  parseInjectedPlugins = (urlParams: string[] = []): PluginObject[] => {
    const plugins = urlParams.filter(Boolean);
    return plugins.map(this.utils.m.parseFlyPlugin);
  };

  injectPlugins = (index: ObjectAny = {}) => {
    const { utils } = this;
    const plugins = this.parseInjectedPlugins(utils.w.urlParams.getAll("p"));
    let themes: PluginObject | PluginObject[] = this.parseInjectedPlugins(
      utils.w.urlParams.getAll("theme")
    );

    themes = themes.map((theme) => {
      theme.url = utils.m.resolvePluginUrl("theme", theme);
      theme.id = "theme";
      return theme;
    });

    const fly = [...plugins, ...themes].filter(Boolean);

    fly.forEach((p: PluginObject) => {
      if (!p.id) return;
      if (CoreKeys.includes(p.id)) p.value = true;
      utils.o.put(index, `plugins.${p.id}`, p.value);
      if (Object.keys(p.options).length) utils.o.put(index, p.id, p.options);
    });

    return index;
  };

  init = async () => {
    // expose BasePlugin for external plugins
    window.BasePlugin = window.BaseTheme = BasePlugin;

    const { app, utils } = this;
    const { cache } = app;
    cache.fly = this.injectPlugins();
    cache.config = utils.o.merge(cache.config, cache.fly);
    const { plugins = {} } = cache.config;

    const unsortedKeys = utils.a.clean([...CoreKeys, ...Object.keys(plugins)]);
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
      const isActive = requiredPlugins.includes(key) || !!pluginValue;

      if (!isActive) return this.inactive.push(key) && acc;

      try {
        this.options[key] = this.app.cfg(key) || {};

        if (CoreKeys.includes(key)) this.register(key, CorePlugins[key]);
        else
          await this.registerExternal(
            key,
            pluginValue,
            (key == "theme" && "theme") || undefined
          );

        const p = this.cache[key];
        if (!p) return acc;

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
        if (p.render) acc.render.push([p.id, p.render, p.options]);
        if (p.style) acc.styles.push([p.id, p.style]);

        this.active.push(key);
        return acc;
      } catch (e) {
        this.log(key, `💥 ${key}`, { err: e.message });
        this.failed.push([key, "load()", e.message]);
        return acc;
      }
    }, Promise.resolve({ init: [], deps: [], css: [], render: [], styles: [] }));

    const addStyle = (id: string, css: string) => {
      const style = document.createElement("style");
      style.id = `style.${id}`;
      style.textContent = css;
      document.head.append(style);
    };

    // append css
    utils.a
      .clean(load.css)
      .map((css) =>
        window.document.querySelector("head")!.append(utils.dom.cssEl(css))
      );
    // append deps (parralel)
    await utils.dom.loadScript(utils.a.clean(load.deps));

    // apply render (sequence)
    // @ts-ignore
    await utils.a.sequence(
      load.render,
      async ([id, fn, options]: [string, Function, ObjectAny]) => {
        try {
          if (this.active.indexOf(id) >= 0) await fn(options);
        } catch (e) {
          this.active.splice(this.active.indexOf(id), 1);
          this.failed.push([id, "render()", e]);
        }
      }
    );

    // append styles (parralel)
    // @ts-ignore
    await Promise.all(
      load.styles.map(async ([id, css]: [string, string]) => {
        try {
          // @ts-ignore
          css = await css();
          if (typeof css != "string" || !css.trim()) return;
          const style = window.less ? (await window.less.render(css)).css : css;
          addStyle(id, style);
        } catch (e) {
          this.active.splice(this.active.indexOf(id), 1);
          this.failed.push([id, "style()", `invalid css`]);
        }
      })
    );

    return load;
  };

  get = (id: string): BasePlugin | undefined => {
    return this.cache[id];
  };

  getActive = (): BasePlugin[] => {
    return this.active.map((k) => this.cache[k]).filter(Boolean);
  };

  run = async () => {
    const { utils } = this;
    const plugins = this.getActive();

    const binds = await utils.a.sequence(plugins, async (p: BasePlugin) => {
      const type = utils.m.resolveType(this.app.cfg(`plugins.${p.id}`));
      try {
        if (p.bind) await p.bind();
        const ptype = type ? ` (${type})` : "";
        const poptions =
          (Object.keys(this.options[p.id]).length && this.options[p.id]) || "";
        this.log(p.id, `✅ ${p.id}${ptype}`, poptions);
        return true;
      } catch (e) {
        this.active.splice(this.active.indexOf(p.id), 1);
        this.failed.push([p.id, "bind()", e]);
        return false;
      }
    });

    this.failed.map(([id, scope, err]) => {
      this.log(id, `💥 ${id}.${scope}`, err.message || err);
    });
  };
}
