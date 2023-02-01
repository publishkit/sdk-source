export default class BasePlugin {
  app: App;
  utils;

  id: string;
  base: ObjectAny;
  options: ObjectAny;
  ui: UIBuilder;

  deps: string[] | Function;
  css: string[] | Function;

  constructor(id: string, options?: ObjectAny, propsd?: ObjectAny) {
    this.id = id;
    this.app = window.app;
    this.utils = this.app.utils;
    this.options = options || {};
    this.ui = this.app.ui.bind(this.id);
  }

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
