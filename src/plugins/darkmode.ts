import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "darkmode";
  }

  ui = async () => {
    const { ui } = this.app;
    const icon = `<i class="bx bx-moon bx-sm moon" onclick="app.theme.switch('dark')"></i>
    <i class="bx bx-sun bx-sm sun" onclick="app.theme.switch('light')"></i>`;

    ui.set("darkmode-icon", icon);
    ui.push("header-icons", ui.get("darkmode-icon"));
  };
}
