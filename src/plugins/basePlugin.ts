import { App } from "src/def/app";

export default class BasePlugin {
  app;
  utils;

  id: string;
  options: ObjectAny;
  deps: string[] | Function;
  css: string[] | Function;

  constructor(app: App, options?: ObjectAny) {
    this.app = app;
    this.utils = app.utils;
    if (options) this.options = options;
  }
}
