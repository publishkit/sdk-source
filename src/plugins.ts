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

  registerPlugin = async (
    plugin: Partial<PluginObject>,
    Plugin?: BasePlugin
  ): Promise<BasePlugin> => {
    const { utils } = this;
    let { id = "", value } = plugin;

    if (plugin.type == "core") {
      Plugin = CorePlugins[id];
    } else {
      plugin.class = "plugin";
      if (id == "theme") {
        plugin.class = "theme";
        if (value == true) {
          plugin.value = "@default";
          plugin.type = "community";
        } else {
          plugin.name =
            (value && value.split("|")[0].replace("@", "")) || "xnotfoundx";
        }
      }

      const url = this.resolveUrl(plugin);
      if (url) plugin.url = url;
      const script = url && (await utils.w.getData(url, { nocache: true }));
      if (!script) throw new Error(`external file not found: ${url}`);
      const fn = new Function(script as string);
      Plugin = await fn();
    }

    if (plugin.type == "unknown") throw new Error(`unknown plugin type`);
    if (!Plugin) throw new Error(`${plugin.id}, no plugin found`);

    // @ts-ignore
    const badboy: BasePlugin = new Plugin(id, this.options[id]);
    if (!badboy.id) throw new Error(`plugin is missing an id`);
    badboy.base = utils.o.clone(plugin, "options");

    if (this.cache[id]) throw new Error(`plugin id '${id}' already exist`);
    this.cache[id] = badboy;

    const windowKey = `$${badboy.id.replace("-", "")}`;
    window[windowKey] = badboy;

    return badboy;
  };

  has = (key: string) => {
    return !!this.cache[key];
  };

  parseFromUrlKey = (urlKey: string): PluginObject[] => {
    const values = this.utils.w.urlParams.getAll(urlKey);
    return values.filter(Boolean).map((p) => {
      const parsed = this.parsePlugin(p, p);
      return parsed;
    });
  };

  injectPlugins = (index: ObjectAny = {}) => {
    const { utils } = this;
    const plugins = this.parseFromUrlKey("p");

    const themes = this.parseFromUrlKey("theme");

    themes.map((theme) => {
      theme.id = "theme";
    });

    const fly = [...plugins, ...themes].filter(Boolean);

    fly.forEach((p: PluginObject) => {
      if (!p.id) return;
      utils.o.put(index, `plugins.${p.id}`, p.value);
      if (Object.keys(p.options || {}).length)
        utils.o.put(index, p.id, p.options);
    });

    return index;
  };

  init = async () => {
    // expose BasePlugin for external plugins
    window.BasePlugin = window.BaseTheme = BasePlugin;
    window.$plugins = this.get;

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

      const plugin = this.parsePlugin(key, plugins[key]);

      const isActive =
        plugin.type == "unknown" ||
        requiredPlugins.includes(key) ||
        !!plugin.value;
      if (!isActive) return this.inactive.push(key) && acc;

      try {
        // store options in cache
        this.options[key] = utils.o.merge(
          {},
          plugin.options,
          this.app.cfg(key)
        );

        await this.registerPlugin(plugin);

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
        // this.log(key, `💥 ${key}`, { err: e.message });
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
      try {
        if (p.bind) await p.bind();
        const poptions = (Object.keys(p.options).length && p.options) || "";
        this.log(p.id, `✅ ${p.id} (${p.base.type})`, poptions);
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

  parsePlugin = (id: string, value?: string): PluginObject => {
    if (typeof value == "undefined") value = id;

    id = id.split("|")[0].replace("@", "");

    value =
      typeof value == "boolean"
        ? id == "theme"
          ? "@default"
          : value
          ? id
          : ""
        : value || "";

    const p: Partial<PluginObject> = {};
    p.id = id;

    try {
      if (typeof value !== "string") return <PluginObject>p;
      const [name = "", options = ""] = value.trim().split("|");

      // @ts-ignore
      if (!name || name === true || name == "@") p.name == p.id;

      p.name = name.replace("@", "");
      p.value = value;
      p.type = this.resolveType(name);

      if (options === "false") p.value = false;
      else p.options = this.parseOptions(options);

      // precise plugin
      if (p.type == "unknown")
        p.type = CoreKeys.includes(id) ? "core" : "internal";
    } catch (e) {
      // @ts-ignore
      p.error = e;
    }

    return <PluginObject>p;
  };

  shortSyntaxPlugins = {
    hex: (v: any) => `#${v}`,
    red: (v: any) => `red`,
  };

  parseOptionValue = (value: string) => {
    const [name, ...rest] = value.split(":");
    const options = rest.join(":");
    const plugin = this.parsePlugin(name);
    const ssp = this.shortSyntaxPlugins;

    value =
      (options.includes(":") ? this.parseOptionValue(options) : options) || "";

    // @ts-ignore
    if (ssp[name]) value = ssp[name](value);
    return value;
    // return `${name}(${value})`
  };

  parseOptions = (s: string, o: ObjectAny = {}) => {
    if (!s || !o) return {};
    const { utils } = this;
    const vars = s.split(",");
    vars.map((v) => {
      let [key, ...optionValue] = v.split(":");
      let value: any = (optionValue || "").join(":");
      if (utils.n.isNumeric(value)) value = Number(value);
      else if (value == "true") value = true;
      else if (value == "false") value = false;
      if (typeof value == "string" && value.includes(":"))
        value = this.parseOptionValue(value);
      utils.o.put(o, key, value);
    });
    return o;
  };

  resolveType = (name: string) => {
    name = (name + "").trim();
    if (!name) return "unknown";

    if (name.startsWith("©")) return "core";
    if (name.startsWith("@")) return "community";

    if (
      name.startsWith("https://") ||
      name.startsWith("http://") ||
      name.startsWith("//")
    )
      return "external";

    return "unknown";
  };

  resolveUrl = (plugin: ObjectAny = {}): string => {
    let url = "";

    const getPath = (name: string) =>
      // @ts-ignore
      ({
        theme: `/themes/${plugin.name}.js`,
        plugin: `/plugins/${plugin.name}.js`,
      }[plugin.class]);

    const path = getPath(plugin.name);

    switch (plugin.type) {
      case "internal":
        url = `${window.pk.local}${path}`;
        break;
      case "external":
        url = plugin.value.split("|")[0];
        break;
      case "community":
        url = `https://cdn.jsdelivr.net/gh/publishkit/community@latest${path}`;
        break;
    }

    return url;
  };
}
