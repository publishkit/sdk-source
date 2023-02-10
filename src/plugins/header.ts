import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  render = async () => {
    const { ui, app, options } = this;
    const { base } = ui;

    const name = app.cfg("header.name");
    const logo = app.cfg("header.logo") || app.cfg("site.logo");
    const classFluid = options.fluid ? "-fluid" : "";
    const bgContrast = options.contrast ? "bg-contrast" : "";

    const rx: ObjectAny = {};

    rx.logo =
      (logo &&
        `
          <a class="logo" href="./" >
            <img src="${logo}"></img>
          </a>
        `) ||
      "";

    rx.name =
      (name !== false &&
        `
          <a href="./" class="sitename">
            <strong>${name || app.cfg("site.name", "Sitename")}</strong>
          </a>
        `) ||
      "";

    let left = base.getUIElements("header.left");
    // @ts-ignore
    left = (left.length && base.joinUIElements(left)) || "";

    let right = base.getUIElements("header.right");
    console.log("oososs", right, base)
    // @ts-ignore
    right = (right.length && base.joinUIElements(right)) || "";

    const header = this.utils.s
      .handlebar(`<nav id="header" class="ui-header container${classFluid} ${bgContrast}">
        <div class="ui-header-left">
          ${left}
          ${rx.logo}
          ${rx.name}
        </div>
        <div class="ui-header-right">
          ${right}
        </div>
    </nav>`);

    base.set("header.html", header);
  };

  style = async () => `
  
    .ui-header {
      --nav-link-spacing-vertical: 1rem;
      z-index: 99;
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      backdrop-filter: saturate(100%) blur(20px);

      &:not(.container-fluid){
        border-bottom-left-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
      }
      
      i {
        ${
          (this.options.icons_fontsize &&
            `
        --header-icons-fontsize: ${this.options.icons_fontsize};
        font-size: var(--header-icons-fontsize, inherit) !important;
        `) ||
          ""
        }
      }
      
      .logo {
        padding: 0;
        margin-left: 0;
        margin-right: 0;
        ${
          (this.options.logo_height &&
            `--logo-height: ${this.options.logo_height};`) ||
          ""
        }
        img {
          max-height: var(--logo-height, 76px);
        }
      }

      .sitename {
        ${
          (this.options.name_fontsize &&
            `--header-name-fontsize: ${this.options.name_fontsize};`) ||
          ""
        }
        font-size: var(--site-name-fontsize, 1.4rem);
        color: var(--contrast);
        padding: 0;
        margin: 0;
      }
    }

    @media (max-width: 767px){
      .ui-header {
        &:not(.container-fluid){
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        .sitename {
          font-size: 1.1rem;
        }
      }
    }

  `;
}
