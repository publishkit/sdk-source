import { put, get } from "./utils/object";

export default class UI {
  app;
  utils;

  cache: ObjectAny = {};
  tpl: ObjectAny;

  constructor(app: App) {
    this.app = app;
    this.utils = app.utils;
    this.tpl = $("template#content");
  }

  set = (key: string, value: any): any => put(this.cache, key, value);

  push = (key: string, value: any) => {
    const item = get(this.cache, key);
    item.push(value);
  };

  pushStart = (key: string, value: any) => {
    this.cache[key].unshift(value);
  };

  get = (key: string, fallback?: any) => {
    const keys = this.utils.a.asArray(key);
    if (keys.length == 1) return get(this.cache, key) || fallback;
    return keys.reduce((acc: any, key: string) => {
      acc[key] = get(this.cache, key);
      return acc;
    }, {});
  };

  create = async () => {
    this.set("header", { icons: {}, elements: {} });
    this.set("actions", {});
    this.set("modals", {});
    this.set("left", {});
    this.set("right", {});
    this.set("footer", { left: {}, right: {} });
    this.set("center", { hero: "", content: "", elements: {} });
    this.set("center.content", document.getElementById("content")!.innerHTML);
    this.set("body", {});

    this.addElement(
      "copyright",
      "footer.left",
      "main",
      `© ${new Date().getFullYear()}`
    );

    this.addElement(
      "poweredby",
      "footer.right",
      "main",
      `<span class="poweredby">powered by</span> <a href="https://publishkit.dev" target="_new" class="contrast outline" data-tooltip="Ship markdown websites"><i class='bx bx-paper-plane'></i> PublishKit</a>`,
      { index: 1000 }
    );

    return this;
  };

  render = async () => {
    const rx: ObjectAny = {};

    rx.header = this.get("header.html", "");
    rx.hero = this.get("center.hero", "");
    rx.content = this.get("center.content");

    rx.left = this.getUIElements("left");
    rx.left =
      (rx.left.length &&
        `<aside>
            <div class="left-bar">
            ${this.joinUIElements(rx.left)}
            </div>
        </aside>`) ||
      "";

    rx.right = this.getUIElements("right");
    rx.right =
      (rx.right.length &&
        `<div>
          <div class="right-bar">
            ${this.joinUIElements(rx.right)}
          </div>
        </div>`) ||
      "";

    rx.footerLeft = this.getUIElements("footer.left");
    rx.footerLeft =
      (rx.footerLeft.length &&
        `<div class="d-flex flex-column flex-md-row flex-lg-column flex-xl-row align-items-center justify-content-between">
            ${this.joinUIElements(
              rx.footerLeft,
              (el) => `<div class="mb-2 mb-xl-0">${el.html}</div>`
            )}
          </div>`) ||
      "";

    rx.footerRight = this.getUIElements("footer.right");
    rx.footerRight =
      (rx.footerRight.length &&
        `<div class="d-flex flex-column flex-md-row flex-lg-column flex-xl-row align-items-center justify-content-between">
            ${this.joinUIElements(
              rx.footerRight,
              (el) => `<div class="mb-2 mb-xl-0">${el.html}</div>`
            )}
          </div>`) ||
      "";

    rx.footer = rx.footerLeft || rx.footerRight;
    rx.footer =
      (!!rx.footer &&
        `<footer id="footer" class="d-flex flex-column flex-md-row flex-lg-column flex-xl-row align-items-center justify-content-between">
          ${rx.footerLeft}
          ${rx.footerRight}
        </footer>`) ||
      "";

    rx.elements = this.getUIElements("center.elements");
    rx.elements = rx.elements.length && this.joinUIElements(rx.elements);

    rx.actions = this.getUIElements("actions");
    rx.actions =
      rx.actions.length &&
      this.joinUIElements(rx.actions, (el) => `<li>${el.html}</li>`);
    rx.actions =
      (rx.actions &&
        `<details class="dropdown-icon right float-end" role="list">
          <summary aria-haspopup="listbox">
            <i class="bx bx-dots-vertical-rounded"></i>
          </summary>
          <ul role="listbox">
            ${rx.actions}
          </ul>
        </details>`) ||
      "";

    rx.center =
      `<div role="document">
            ${rx.hero}
            ${rx.actions || ""}
            ${rx.elements || ""}
            ${rx.content}
            ${rx.footer}
        </div>` || "";

    rx.modals = this.getUIElements("modals");
    rx.modals =
      (rx.modals.length &&
        `<div class="modals">${this.joinUIElements(rx.modals)}</div>`) ||
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

    rx.body = this.getUIElements("body");
    rx.body = (rx.body.length && this.joinUIElements(rx.body)) || "";

    this.renderView(rx);
    return await this.utils.dom.waitForEl("main.ready");
  };

  renderView = (view: ObjectAny) => {
    if(view.body) $("body").prepend(view.body);
    this.tpl.replaceWith(view.layout);
  };

  getUIElements = (ns: UINamespace): UIElement[] => {
    const object = get(this.cache, ns);
    const keys = Object.keys(object);
    if (!keys.length) return [];

    const elements = keys.reduce((acc: any[], key: string) => {
      const plugin = object[key] || {};
      Object.values(plugin).forEach((v) => acc.push(v));
      return acc;
    }, []);

    elements.sort((a, b) => {
      const ia = a.index || 0;
      const ib = b.index || 0;
      return ia - ib;
    });

    return elements;
  };

  joinUIElements = (
    els: UIElement[],
    wrapper = (el: UIElement): string => el.html
  ): string => {
    return els.map(wrapper).join("\n");
  };

  bind = (pluginId: string): UIBuilder => {
    // @ts-ignore
    const ui: UIBuilder = {};
    const curry =
      (f: Function) =>
      (a: any) =>
      (...b: any[]) =>
        f(a, ...b);

    ui.base = this;

    ui.addElement = curry(this.addElement)(pluginId);
    ui.getElement = curry(this.getElement)(pluginId);

    ui.addHeaderIcon = curry(this.addHeaderIcon)(pluginId);
    ui.getHeaderIcon = curry(this.getHeaderIcon)(pluginId);

    ui.addAction = curry(this.addAction)(pluginId);
    ui.getAction = curry(this.getAction)(pluginId);

    ui.addModal = curry(this.addModal)(pluginId);
    ui.getModal = curry(this.getModal)(pluginId);

    return ui;
  };

  buildId = (ns: string, pluginId: string, elementId: string) =>
    `${ns}.${pluginId}.${elementId}`;

  addElement = (
    pluginId: string,
    ns: UINamespace,
    elementId: string,
    body: string | Function,
    options?: Partial<UIElement>
  ): UIElement => {
    const id = this.buildId(ns, pluginId, elementId);
    const html = `<div id="${id}">${body}</div>`;
    return this.set(id, { id, html, ...options });
  };

  getElement = (
    pluginId: string,
    ns: UINamespace,
    elementId: string
  ): UIElement => {
    const id = this.buildId(ns, pluginId, elementId);
    const element = this.get(id);
    if (!element.el) {
      element.el = $(`[id="${id}"]`);
      put(this.cache, id, element);
    }
    return element;
  };

  addHeaderIcon = (
    pluginId: string,
    elementId: string,
    options: Partial<UIHeaderIcon>
  ): UIHeaderIcon => {
    const id = this.buildId("header.icons", pluginId, elementId);
    let { icon, fn, className = "" } = options;
    const html = `<i id="${id}" class="bx ${icon} bx-sm ${className}"></i>`;
    return this.set(id, { id, icon, fn, html });
  };

  getHeaderIcon = (pluginId: string, elementId: string): UIHeaderIcon => {
    const id = this.buildId("header.icons", pluginId, elementId);
    const icon = this.get(id);
    if (!icon.el) {
      icon.el = $(`[id="${id}"]`);
      put(this.cache, id, icon);
    }
    return icon;
  };

  addAction = (
    pluginId: string,
    elementId: string,
    options: Partial<UIAction>
  ): UIAction => {
    const id = this.buildId("actions", pluginId, elementId);
    let { text, icon, fn } = options;
    const iconEl = (icon && `<i class="bx-fw bx ${icon}"></i>`) || "";
    const html = `<a href="#" id="${id}">${iconEl}${text}</a>`;
    return this.set(id, { id, text, icon, fn, html });
  };

  getAction = (pluginId: string, elementId: string): UIAction => {
    const id = this.buildId("actions", pluginId, elementId);
    const action = this.get(id);
    if (!action.el) {
      action.el = $(`[id="${id}"]`);
      put(this.cache, id, action);
    }
    return action;
  };

  addModal = (
    pluginId: string,
    elementId: string,
    body: string | Function,
    options?: ObjectAny
  ): UIModal => {
    options = options || {};
    const id = this.buildId("modals", pluginId, elementId);
    const modal = this.app.plugins.get("modal") as ModalPlugin;
    const html = `<dialog id="${id}" ${
      (options.noesc && `noesc="true"`) || ""
    }> 
      <article>
        ${body}
      </article>
    </dialog>`;
    const open = (cb: Function | undefined) => modal.open(id, cb);
    const close = (cb: Function | undefined) => modal.close(cb);
    return this.set(id, { id, html, open, close });
  };

  getModal = (pluginId: string, elementId: string): UIModal => {
    const id = this.buildId("modals", pluginId, elementId);
    const modal = this.get(id);
    if (!modal.el) {
      modal.el = $(`[id="${id}"]`);
      put(this.cache, id, modal);
    }
    return modal;
  };
}
