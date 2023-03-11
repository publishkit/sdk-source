import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  init = async () => {
    const { $kit } = window;
    const dirs = location.pathname
      .replace($kit.base, "")
      .split("/")
      .map(decodeURIComponent)
      .filter(Boolean);

    const last = dirs[dirs.length - 1] || "";
    if (last == "index" || last == "index.html") dirs.pop();

    const paths = dirs.map((dir, i) => {
      if (i == 0) return dir;
      const prev = dirs[i - 1];
      return [prev, dir].join("/");
    });

    return dirs.length > 1 && { dirs, paths };
  };

  render = async () => {
    const { dirs, paths } = this.options._init;
    const current = dirs.pop().replace(".html", "");

    // <a href="#"><i class="bx bxs-home me-2"></i></a>
    const element = `<div>
      <nav aria-label="breadcrumb">
        <ul>
        ${dirs
          .map((dir: string, i: number) => {
            return `<li><a href="${paths[i]}">${dir}</a></li>`;
          })
          .join("\n")}
          <li>${current}</li>
        </ul>
      </nav>
    </div>`;

    this.ui.addElement("div", "top.left", element);
  };

  style = async () => `
    [id="breadcrumbs.div"] {
      display: grid;
      grid-auto-flow: column;
      align-items: center;
      justify-content: start;

      li {
        padding: 0 var(--nav-element-spacing-horizontal);
      }
    }

    @media (max-width: 575px){
      [id="breadcrumbs.div"] {
        font-size: .7rem;
      }
    }

    /* PICO OVERIDE  */

    nav[aria-label="breadcrumb"] ul li:not(:last-child) ::after {
      content: ">";
    }
  `;
}
