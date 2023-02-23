import CorePlugins from "./plugins/index";
import BasePlugin from "./class/basePlugin";
import BaseTheme from "./class/baseTheme";

const CoreKeys = Object.keys(CorePlugins);
const requiredPlugins = ["dom", "global", "hotkeys", "modal", "props", "render", "actions"];
const lastPlugins = ["header", "theme"];

export default class Plugins {
  app: App;
  utils;
  load: ObjectAny = {};
  run: ObjectAny = {};
  depsStatus: ObjectAny = { sucess: [], failed: [] };

  // // @ts-ignore
  // on<U extends keyof EE>(event: U, listener: EE[U]): this;
  // // @ts-ignore
  // emit<U extends keyof EE>(event: U, ...args: Parameters<EE[U]>): boolean;

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
    const { $kit } = window;
    if (!$kit.debug) return;
    const cond =
      ["plugins", "p", "*", key, `$${key}`].includes($kit.debug) ||
      ["plugins", "p", "*"].includes(key);
    cond && console.log(`plugins ➔`, ...args);
  };

  registerPlugin = async (
    plugin: Partial<PluginObject>,
    Plugin?: BasePlugin
  ): Promise<BasePlugin> => {
    const { utils, app } = this;
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

    // $plugin expose
    const windowKey = `$${badboy.id.replace("-", "")}`;
    window[windowKey] = badboy;

    // merge cache config
    utils.o.put(
      app.cache.config,
      badboy.id,
      utils.o.clone(badboy.options, "_init")
    );

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
    const { cache } = this.app;

    const plugins = this.parseFromUrlKey("p");
    const themes = this.parseFromUrlKey("theme");

    themes.map((theme) => {
      theme.id = "theme";
    });

    const fly = [...plugins, ...themes].filter(Boolean);

    fly.forEach((p: PluginObject) => {
      if (!p.id) return;

      // override existing configurtion
      const stringPlugin = utils.o.get(cache.config, `plugins.${p.id}`);
      const shortSyntaxOptions = typeof stringPlugin == "string" ? this.parsePlugin(stringPlugin).options : {}
      const pluginOptions = utils.o.get(cache.config, p.id);

      p.options = { ...pluginOptions, ...shortSyntaxOptions, ...p.options };
      
      // merge in cache config
      utils.o.put(cache.config, `plugins.${p.id}`, p.value);
      if (Object.keys(p.options).length)
        utils.o.put(cache.config, p.id, p.options);
    });

    return cache.config;
  };

  init = async () => {
    // expose BasePlugin for external plugins
    window.BasePlugin = BasePlugin;
    window.BaseTheme = BaseTheme;

    const { app, utils } = this;
    this.injectPlugins();

    const { plugins = {} } = app.cache.config;

    const unsortedKeys = utils.a.clean([
      ...requiredPlugins,
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
    const load = (this.load = await keys.reduce(async (prev, key: string) => {
      const acc = await prev;

      const plugin = this.parsePlugin(key, plugins[key]);

      const isActive =
        // plugin.type == "unknown" || // TOCHECK
        requiredPlugins.includes(key) || !!plugin.value;
      if (!isActive) return this.inactive.push(key) && acc;

      try {
        // store options in cache
        this.options[key] = utils.o.merge(
          {},
          plugin.options,
          this.app.cfg(key)
        );

        const p = await this.registerPlugin(plugin);

        if (p.init) {
          const init = await p.init();
          if (init) {
            // append to plugin instance & options cache
            p.options = p.options || {};
            p.options._init = init;
            this.options[key]._init = init;
          } else return this.inactive.push(key) && acc;
        }
        // if (p.deps)
        if (p.deps) acc.deps.push([p.id, p.deps]);
        if (p.style) acc.style.push([p.id, p.style]);
        if (p.render) acc.render.push([p.id, p.render, p.options]);
        if (p.transform) acc.transform.push([p.id, p.transform]);
        if (p.bind) acc.bind.push([p.id, p.bind]);

        this.active.push(key);
        return acc;
      } catch (e) {
        // this.log(key, `💥 ${key}`, { err: e.message });
        this.failed.push([key, "load()", e.message]);
        return acc;
      }
    }, Promise.resolve({ init: [], deps: [], style: [], render: [], transform: [], bind: [] })));

    return load;
  };

  get = (id: string): BasePlugin | undefined => {
    return this.cache[id];
  };

  getActive = (): BasePlugin[] => {
    return this.active.map((k) => this.cache[k]).filter(Boolean);
  };

  execute = async (sequence: string, options?: ObjectAny, cb?: Function) => {
    const { $ee } = window;

    if (typeof options == "function") {
      cb = options;
    }
    options = options || {};
    options.run = options.run || "parallel";

    const { utils, load, cache } = this;

    this.log("*", (" " + sequence + "()").padStart(30, "-"));

    const fn = async ([id, fn, options]: [string, Function, ObjectAny]) => {
      const plugin = cache[id];
      try {
        if (this.active.indexOf(id) == -1) return;
        const result = typeof fn == "function" ? await fn(options) : fn;
        cb && (await cb(id, result));
        this.log(id, `✅ ${id}`);
        $ee.emit(`post:${sequence}:${plugin.id}`, plugin);
        $ee.emit(`post:${sequence}`, plugin);
        return result;
      } catch (e) {
        this.active.splice(this.active.indexOf(id), 1);
        this.failed.push([id, sequence, e]);
        this.log(id, `💥 ${id} - err:`, e.message);
      }
    };

    // @ts-ignore
    const run = await utils.a[options.run](load[sequence], fn);
    $ee.emit(`post:${sequence}s`, run.filter(Boolean));
    return run;
  };

  deps = async () => {
    const run = await this.execute("deps");
    this.run.deps = this.utils.a.clean(run);
    this.depsStatus = await this.utils.dom.load(this.run.deps);
    return this.depsStatus;
  };

  style = async () =>
    this.execute("style", async (id: string, css: any) => {
      css = window.less ? (await window.less.render(css)).css : css;
      this.addStyle(id, css);
    });

  render = async () => this.execute("render");
  transform = async () => this.execute("transform");
  bind = async () => this.execute("bind");

  addStyle = (id: string, css: string) => {
    const style = document.createElement("style");
    style.id = `style.${id}`;
    style.textContent = css;
    document.head.append(style);
  };

  summary = async () => {
    const { cache, utils } = this;
    const plugins = this.getActive();

    this.log("*", ` summary`.padStart(30, "-"));

    this.active.map((id) => {
      const p = cache[id];
      this.log(
        id,
        `✅ ${p.base.type} - ${id}`,
        utils.o.isEmpty(p.options) ? "" : p.options
      );
    });

    this.failed.map(([id, sequence, err]) => {
      const p = cache[id];
      this.log(
        id,
        `💥 ${p.base?.type || "register:fail"} - ${id}.${sequence}() - err:`,
        err.message || err
      );
    });

    this.log("*", ` dependencies (${this.run.deps.length})`.padStart(30, "-"));
    this.run.deps.map((dep: any) => {
      const type = dep.push
        ? dep[1]?.type || dep[0]?.split(".").pop() || "unknown"
        : dep.split(".").pop();
      const path = dep.push ? dep[0] : dep;
      const status = this.depsStatus.success.includes(path) ? '✅' : '💥'
      this.log("*", `${status} - ${path} (${type})`);
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

  private parseOptionValue = (value: string) => {
    // return value if match http:// pattern
    if (/[a-z]+:\/\//.test(value)) return value;

    const [name, ...rest] = value.split(":");
    const options = rest.join(":");
    // const plugin = this.parsePlugin(name);
    const ssp = this.shortSyntaxPlugins;

    const isRecursive = options.includes(":") && !options.includes("://");

    value = (isRecursive ? this.parseOptionValue(options) : options) || "";

    // @ts-ignore
    if (ssp[name]) value = ssp[name](value);
    return value;
    // return `${name}(${value})`
  };

  private parseOptions = (s: string, o: ObjectAny = {}) => {
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

  private resolveType = (name: string) => {
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
        url = `${window.$kit.local}${path}`;
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
