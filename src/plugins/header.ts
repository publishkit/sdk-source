import BasePlugin from "./basePlugin";

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
        `<li >
          <a class="logo" href="./" >
            <img src="${logo}"></img>
          </a>
        </li>`) ||
      "";

    rx.name =
      (name !== false &&
        `<li>
          <a href="./" class="sitename">
            <strong>${name || app.cfg("site.name", "Sitename")}</strong>
          </a>
        </li>`) ||
      "";

    rx.elements = base.getUIElements("header.elements");
    rx.elements =
      (rx.elements.length &&
        `<ul>${base.joinUIElements(
          rx.elements,
          (el) => `<li>${el.html}</li>`
        )}</ul>`) ||
      "";

    rx.icons = base.getUIElements("header.icons");
    rx.icons =
      (rx.icons.length &&
        `<ul class="ms-2">${base.joinUIElements(
          rx.icons,
          (el) => `<li>${el.html}</li>`
        )}</ul>`) ||
      "";

    const header = this.utils.s
      .handlebar(`<nav id="header" class="container${classFluid} ${bgContrast}">
        <ul>
          ${rx.logo}
          ${rx.name}
        </ul>
        <div class="d-flex">
          ${rx.elements}
          ${rx.icons}
        </div>
    </nav>`);

    base.set("header.html", header);
  };

  style = async () => `
  
    #header {
      --nav-link-spacing-vertical: 1rem;
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      z-index: 99;
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      backdrop-filter: saturate(100%) blur(20px);
      
      i {
        ${this.options.icons_fontsize && `
        --header-icons-fontsize: ${this.options.icons_fontsize};
        font-size: var(--header-icons-fontsize, inherit) !important;
        ` || ""}
        cursor: pointer;
      }
      ul {
        margin-left: 0;
        margin-right: 0;
        li {
          display: flex;
          align-items: center;
          padding-right: 0;
          &:first-child {
            padding-left: 0;
          }
        }
      }
      
      .logo {
        padding: 0;
        margin-left: 0;
        margin-right: 0;
        ${this.options.logo_height && `--logo-height: ${this.options.logo_height};` || ""}
        img {
          max-height: var(--logo-height, 76px);
        }
      }
      .sitename {
        ${this.options.name_fontsize && `--header-name-fontsize: ${this.options.name_fontsize};` || ""}
        font-size: var(--header-name-fontsize, 1.2rem);
        color: var(--contrast);
      }
        
      &.bg-contrast {
        padding: 0 10px;
        color: var(--card-background-color);
        
        .sitename {
          color: var(--card-background-color);
        }
        kbd {
          color: var(--contrast);
        }
      }
    }

    #header ~ main {
      padding-top: calc(var(--block-spacing-vertical) + 3rem);
    }

    @media (min-width: 768px) {
      #header {
        &.container-fluid {
          padding: 0 20px;
        }
      }
    }
  `;
}
