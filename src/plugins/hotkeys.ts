import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "hotkeys";
    this.deps = [
      "https://cdn.jsdelivr.net/npm/hotkeys-js@3.7.3/dist/hotkeys.min.js",
    ];
  }

  code = async () => {
    // enable hotkeys to work in inputs
    window.hotkeys.filter = function (event: any) {
      const tagName = (event.target || event.srcElement).tagName;
      window.hotkeys.setScope(
        /^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? "input" : "other"
      );
      return true;
    };

    // handle escape
    window.hotkeys("esc", function (event: any) {
      window.modal && window.modal.prop("open", false);
    });
  };
}
