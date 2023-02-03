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

    #header ~ main {
      padding-top: calc(var(--block-spacing-vertical) + 1.1rem);
    }
  
    #header {
      --nav-link-spacing-vertical: 1rem;
      z-index: 99;
      position: fixed;
      padding: 0 20px;
      top: 0;
      right: 0;
      left: 0;
      background: var(--card-background-color);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      backdrop-filter: saturate(100%) blur(20px);

      &:not(.container-fluid){
        border-bottom-left-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
      }
      
      i {
        ${this.options.icons_fontsize && `
        --header-icons-fontsize: ${this.options.icons_fontsize};
        font-size: var(--header-icons-fontsize, inherit) !important;
        ` || ""}
        cursor: pointer;

        &.ham {
          margin-right: -4px;
        }
      }
      ul {
        --color: var(--contrast);
        margin-left: 0;
        margin-right: 0;
        li {
          display: flex;
          align-items: center;
          padding-right: 0;
          &:first-child {
            padding-left: 0;
          }
          font-size: 2.2rem;
          padding: 0.5rem 0.2rem;

          
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
        font-size: var(--site-name-fontsize, 1.4rem);
        color: var(--contrast);
        padding: 0;
        margin: 0;
      }

      
    }

    @media (min-width: 768px) {
      #header {
        &.container-fluid {
          padding: 0 20px;
        }
      }
      
      &~ {
        padding-top: calc(var(--block-spacing-vertical) + 3rem);
      }
    }
  `;
}
