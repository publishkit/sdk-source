export default class BasePlugin {
  app: App;
  utils;

  id: string;
  base: ObjectAny;
  options: ObjectAny;
  default: ObjectAny;
  ui: UIBuilder;

  deps: string[] | Function;
  css: string[] | Function;

  constructor(id: string, options?: ObjectAny) {
    this.id = id;
    this.app = window.$app;
    this.utils = this.app.utils;
    this.options = options || {};
    this.ui = this.app.ui.bind(this.id);
  }

  defaults = (options: ObjectAny = {}) => {
    this.default = options;
    this.options = this.utils.o.merge({}, options, this.options);
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
}
