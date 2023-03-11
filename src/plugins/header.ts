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
    const layout = app.cfg("layout") || {}
    const containerClass = layout.fluid || options.fluid ? "container-fluid" : "container";
    const bgContrast = options.contrast ? "bg-contrast" : "";

    const rx: ObjectAny = {};

    const svgClass =
      (logo.split(".")?.pop()?.toLowerCase() == "svg" && "logo-svg") || "";
    const svgStyle = svgClass ? "opacity:0" : "";

    rx.logo =
      (logo &&
        `
          <a class="logo" href="./" >
            <div class="${svgClass}"><img src="${logo}" style="${svgStyle}" /></div>
          </a>
          `) ||
      "";
    // <img src="${logo}"></img>

    rx.name =
      (name !== false &&
        !rx.logo &&
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
    // @ts-ignore
    right = (right.length && base.joinUIElements(right)) || "";

    const header = this.utils.s
      .handlebar(`<nav id="header" class="ui-header ${containerClass} ${bgContrast}">
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

  style = async () => {
    const { app } = this;
    const logo = app.cfg("header.logo") || app.cfg("site.logo");

    return `

    :root[data-theme="dark"] {
      .ui-header {
        .logo img {
          // filter: invert(0.2);
        }
      }
    }
  
    .ui-header {
      --nav-link-spacing-vertical: 1rem;
      z-index: 99;
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      margin: auto;
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

      .logo-svg img {
        min-height: var(--logo-height, 1rem);
        height: 0px;
      }

      .logo-svg, .logo-svg:hover {
        background-color: var(--contrast);
        -webkit-mask: url(${logo}) no-repeat center;
        -webkit-mask-size: contain;
        mask: url(${logo}) no-repeat center;
        mask-size: contain;
      }
      
      .logo-svg:hover {
        background-color: var(--primary);
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
          max-height: var(--logo-height, 2rem);
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
  };
}
