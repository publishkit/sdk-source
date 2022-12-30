import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "modal";
  }

  code = async () => {
    window.modal = null;

    // @ts-ignore
    $.fn.modal = function (action: string, cb = (state) => {}, cbb) {
      if (typeof cb == "object") {
        (cb as any).preventDefault();
        cb = cbb || (() => {});
      }
      let state: boolean = this.prop("open") ? false : true;
      if (action == "show") state = true;
      if (action == "hide") state = false;
      // console.log('modal', state)
      setTimeout(() => {
        window.modal = state ? this : null;
        this.prop("open", state);
        cb(state);
      }, 0);
    };
  };
}
