import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  bind = async () => {
    for (let [key, value] of Object.entries(this.options)) {
      key = key.includes("--") ? key : `--${key}`;
      if (value.startsWith("hex(")) {
        value = value.replace("hex(", "");
        value = value.slice(0, -1);
        value = `#${value}`;
      }
      this.utils.dom.cssvar(key, value);
    }
  };
}
