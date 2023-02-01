import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  init = async () => {
    const dirs = location.pathname
      .replace(window.pk.base, "")
      .split("/")
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

    const element = `<nav aria-label="breadcrumb">
      <ul>
      ${dirs
        .map((dir: string, i: number) => {
          return `<li><a href="${paths[i]}">${dir}</a></li>`;
        })
        .join("\n")}
        <li>${current}</li>
      </ul>
    </nav>`;

    this.ui.addElement("center.elements", "main", element);
  };
}
