import BasePlugin from "./basePlugin";

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

    let body = "";

    for (const [key, icon] of Object.entries(links)) {
      const url = cfg(`social.${key}`);
      if (url)
        body += `<a href="${url}" target="_blank" class="secondary" data-tooltip="${key}" >
          <i class="bx ${icon} bx-xs"></i>
        </a>`;
    }

    if (body) this.ui.addElement("footer.left", "main", body);
  };

  style = async () => `
    [id="footer.left.social.main"] {
      display: flex;

      a + a {
        margin-left: 5px;
      }
    }
  `;
}
