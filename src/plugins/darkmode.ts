import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  style = async () => `
    :root[data-theme="dark"] #header li:has([id="header.icons.darkmode.moon"]) {
      display: none;
    }
    :root[data-theme="light"] #header li:has([id="header.icons.darkmode.sun"]) {
      display: none;
    }
  `;

  render = async () => {
    const { ui, app } = this;

    ui.addHeaderIcon("moon", {
      icon: "bx-moon",
      className: "moon",
      fn: () => app.theme.switch("dark"),
    });

    ui.addHeaderIcon("sun", {
      icon: "bx-sun",
      className: "sun",
      fn: () => app.theme.switch("light"),
    });
  };

  bind = async () => {
    const { ui } = this;
    const moon = ui.getHeaderIcon("moon");
    const sun = ui.getHeaderIcon("sun");

    moon.el.on("click", moon.fn);
    sun.el.on("click", sun.fn);
  };
}
