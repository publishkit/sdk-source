export default class BasePlugin {
  app: App;
  utils;

  id: string;
  options: ObjectAny = {};
  defaults: ObjectAny = {};
  deps: string[] = [];

  base: ObjectAny; // parsePlugin result
  ui: UIBuilder;

  constructor(id: string, options?: ObjectAny, defaults?: ObjectAny) {
    this.id = id;
    this.app = window.$app;
    this.utils = this.app.utils;
    this.defaults = defaults || {};
    // @ts-ignore
    this.options = this.utils.o.merge({}, this.defaults, options);
    this.ui = this.app.ui.bind(this.id);
  }

  setDefaults = (def: ObjectAny = {}) => {
    this.defaults = def;
    this.options = this.utils.o.merge({}, this.defaults, this.options);
  };

  log = (...args: any[]) => {
    console.log(`plugins ➔ ℹ️ ${this.id}`, ...args);
  };

  error = (err: any) => {
    console.log(`plugins ➔ 💥 ${this.id}`, err.message || err);
  };

  warning = (...args: any[]) => {
    console.log(`plugins ➔ ⚠️ ${this.id}`, ...args);
  };

  init?(): Promise<any>;
  render?(): Promise<void>;
  bind?(): Promise<void>;
  style?(): Promise<string>;
  transform?(): Promise<JQuery | void>;
}
