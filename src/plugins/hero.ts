import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  image: "";

  render = async () => {
    const { options, app, ui } = this;
    this.image = options.image || app.cfg("image");
    if (!this.image) return;
    ui.addElement("banner", "top.hero", `<div id="hero"></div>`);
  };

  style = async () => {
    if (!this.image) return "";
    const { options } = this;
    return `
      [id="hero.banner"] {
        background-image: url(${this.image});
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        height: ${options.height || "150px"};
        border-radius: var(--border-radius);
      }
      @media (min-width: 576px) {
        [id="hero.banner"] {
          height: 200px;
        }
      }
      @media (max-width: 767px) {
        [id="hero.banner"] {
          border-radius: 0;
          &:has(+ .ui-top) {
            margin-top: var(--top-height);
            margin-bottom: calc(var(--top-height) * -1);
          }
        }
      }
      @media (min-width: 768px) {
        [id="hero.banner"] {
          margin: 0 1rem;
          margin-bottom: var(--spacing);
          height: 150px;
        }
      }
      @media (min-width: 992px) {
        [id="hero.banner"] {
          height: 300px;
        }
      }
    `;
  };
}
