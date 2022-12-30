import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "header";
  }

  ui = async () => {
    const { ui, cfg } = this.app;
    const className = cfg("layout.fluid") ? "-fluid" : "";

    const header = this.utils.s
      .handlebar(`<nav id="header" class="container${className}">
        <ul>
            ${
              (cfg("site.logo") &&
                `<li id="logo">
                    <a href="/" class="contrast" onclick="event.preventDefault()">
                        <img class="logo" src="${cfg("site.logo")}"></img>
                    </a>
                </li>`) ||
              ""
            }
            ${
              (cfg("site.name") &&
                `<li>
                    <a href="/" class="logo-text contrast">
                        <strong>${cfg("site.name", "Sitename")}</strong>
                    </a>
                </li>`) ||
              ""
            }
        </ul>
        <ul>
        ${ui
          .get("header-icons")
          .map((i: string) => `<li>${i}</li>`)
          .join("\n")}
        </ul>
    </nav>`);

    ui.set("header", header);
  };
}
