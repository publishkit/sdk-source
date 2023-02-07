import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  render = async () => {
    const { cfg } = this.app;

    const links = {
      github: "bxl-github",
      discord: "bxl-discord-alt",
      twitter: "bxl-twitter",
      linkedin: "bxl-linkedin-square",
      instagram: "bxl-instagram",
      twitch: "bxl-twitch",
      facebook: "bxl-facebook-circle",
      reddit: "bxl-reddit",
    };

    let icons = "";

    for (const [key, icon] of Object.entries(links)) {
      const url = cfg(`social.${key}`);
      if (url)
        icons += `<a href="${url}" target="_blank" class="contrast" data-tooltip="${key}" >
          <i class="bx ${icon}"></i>
        </a>`;
    }

    if (icons) this.ui.addElement("footer.left", "main", icons, { className: "d-grid" });
  };

  style = async () => `
    [id="footer.left.social.main"] {
      justify-content: space-around;
      grid-auto-flow: column;
      grid-column-gap: .3rem;
    }

    @media (max-width: 768px) {
      [id="footer.left.social.main"] {
        --icon-size: 2rem;
      }
    }
  `;
}
