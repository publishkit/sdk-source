import { App } from "./def/app";

export default class UI {
  app;
  utils;

  cache: ObjectAny = {};
  tpl: ObjectAny;

  constructor(app: App) {
    this.app = app;
    this.utils = app.utils;
    this.tpl = $("template#content")
  }

  set = (key: string, value: any) => (this.cache[key] = value);

  push = (key: string, value: any) => {
    this.cache[key].push(value);
  };

  pushStart = (key: string, value: any) => {
    this.cache[key].unshift(value);
  };

  get = (key: string) => {
    const keys = this.utils.a.asArray(key);
    if (keys.length == 1) return this.cache[key] || "";
    return keys.reduce((acc: any, key: string) => {
      acc[key] = this.cache[key];
      return acc;
    }, {});
  };

  create = async () => {
    this.set("header-icons", []);
    this.set("left", []);
    this.set("right", []);
    this.set("center", []);
    this.set("footer", []);
    this.set("modals", []);

    this.set("content", document.getElementById("content")!.innerHTML);
    this.set(
      "copyright",
      `<span>${this.app.cfg(
        "site.name",
        ""
      )} © ${new Date().getFullYear()}</span>`
    );
    this.set(
      "poweredby",
      `<span class="poweredby">powered by</span> <a href="https://publishkit.dev" target="_new" class="contrast outline"><i class='bx bx-paper-plane'></i> PublishKit</a>`
    );

    this.push("footer", this.get("copyright"));

    return this;
  };

  render = async () => {
    // hard ui
    this.push("center", this.get("content"));
    this.push("footer", this.get("poweredby"));

    const els = this.get("header,left,right,center,footer,modals");
    const rx: ObjectAny = {};

    rx.header = this.get("header");

    rx.left =
      (els.left.length &&
        `<aside>
            <div class="left-bar">
                ${els.left.join("\n")}
            </div>
        </aside>`) ||
      "";

    rx.right =
      (els.right.length &&
        `<div>
            <div class="right-bar">
                ${els.right.join("\n")}
            </div>
        </div>`) ||
      "";

    rx.footer =
      (els.footer.length &&
        `<footer class="d-flex flex-column flex-md-row flex-lg-column flex-xl-row align-items-center justify-content-between">
            ${els.footer
              .map((el: string) => `<div class="mb-2 mb-xl-0">${el}</div>`)
              .join("\n")}
        </footer>`) ||
      "";

    rx.center =
      `<div role="document">
            ${els.center.join("\n")}
            ${rx.footer}
        </div>` || "";

    rx.modals =
      (els.modals.length &&
        `<div class="modals">${els.modals.join("\n")}</div>`) ||
      "";

    rx.layout = `
        ${rx.header}
        <main class="ready container${
          this.app.cfg("layout.fluid") ? "-fluid" : ""
        }">
            ${rx.left}
            ${rx.center}
            ${rx.right}
            ${rx.modals}
        </main>`;

    this.renderView(rx.layout)
    return await this.utils.d.waitForEl("main.ready");
  };

  renderView = (view: string) => {
    this.tpl.replaceWith(view)
  }
}
