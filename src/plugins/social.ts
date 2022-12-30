import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "social";
  }

  ui = async () => {
    const { ui, cfg } = this.app;

    const string = `<div>
        ${
          (cfg("social.github") &&
            `<a target="_new" href="${cfg(
              "social.github"
            )}" class="secondary"><i class='bx bxl-github bx-xs'></i></a>`) ||
          ""
        }
        ${
          (cfg("social.discord") &&
            `<a target="_new" href="${cfg(
              "social.discord"
            )}" class="secondary"><i class='bx bxl-discord-alt bx-xs'></i></a>`) ||
          ""
        }
        ${
          (cfg("social.twitter") &&
            `<a target="_new" href="${cfg(
              "social.twitter"
            )}" class="secondary"><i class='bx bxl-twitter bx-xs'></i></a>`) ||
          ""
        }
        ${
          (cfg("social.linkedin") &&
            `<a target="_new" href="${cfg(
              "social.linkedin"
            )}" class="secondary"><i class='bx bxl-linkedin-square bx-xs'></i></a>`) ||
          ""
        }
        ${
          (cfg("social.instagram") &&
            `<a target="_new" href="${cfg(
              "social.instagram"
            )}" class="secondary"><i class='bx bxl-instagram bx-xs'></i></a>`) ||
          ""
        }
        ${
          (cfg("social.twitch") &&
            `<a target="_new" href="${cfg(
              "social.twitch"
            )}" class="secondary"><i class='bx bxl-twitch bx-xs'></i></a>`) ||
          ""
        }
        ${
          (cfg("social.facebook") &&
            `<a target="_new" href="${cfg(
              "social.facebook"
            )}" class="secondary"><i class='bx bxl-facebook-circle bx-xs'></i></a>`) ||
          ""
        }
        ${
          (cfg("social.reddit") &&
            `<a target="_new" href="${cfg(
              "social.reddit"
            )}" class="secondary"><i class='bx bxl-reddit bx-xs'></i></a>`) ||
          ""
        }
    </div>`;

    ui.set("social", string);
    ui.push("footer", ui.get("social"));
  };
}
