import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  shortcuts: { shortcut: string; description: string; fn: Function }[];

  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    this.deps.push(
      "https://cdn.jsdelivr.net/npm/hotkeys-js@3.7.3/dist/hotkeys.min.js"
    );
  }

  register = (shortcut: string, description: string, fn: Function) => {
    this.shortcuts = this.shortcuts || [];
    this.shortcuts.push({ shortcut, description, fn });
    window.hotkeys(shortcut, fn);
  };

  bind = async () => {
    // enable hotkeys to work in inputs
    window.hotkeys.filter = function (event: any) {
      const tagName = (event.target || event.srcElement).tagName;
      window.hotkeys.setScope(
        /^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? "input" : "other"
      );
      return true;
    };
  };
}
