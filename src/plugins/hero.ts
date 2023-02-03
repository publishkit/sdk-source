import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  image: "";

  render = async () => {
    const { options, app } = this;
    this.image = options.image || app.cfg("image");
    if (!this.image) return;
    this.ui.base.set("center.hero", `<div id="hero" class="mb-3"></div>`);
  };

  style = async () => {
    if (!this.image) return "";
    const { options } = this;
    return `
      #hero {
        background-image: url(${this.image});
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        height: ${options.height || "300px"};
        margin: -20px;
      }
      @media (min-width: 576px) {
        #hero {
          margin: auto 0px;
        }
      }

      @media (max-width: 991px) {
        #hero {
          height: 150px;
        }
      }
    `;
  };
}
