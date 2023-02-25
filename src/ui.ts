import { put, get } from "./utils/object";
import Layout from "./lib/layout";

export default class UI {
  app;
  utils;
  layout: Layout;

  cache: ObjectAny = {};
  tpl: ObjectAny;

  constructor(app: App) {
    this.app = app;
    this.utils = app.utils;
    this.tpl = $("template#content");
    this.layout = new Layout(this);
    if (typeof this.utils.w.urlParams.get("ui") == "string") this.outline();
  }

  set = (key: string, value: any): any => put(this.cache, key, value);

  get = (id: string): UITypes => {
    const element = get(this.cache.els, id) || get(this.cache, id);
    element.el = $(`[id="${id}"]`);
    return element;
  };

  outline = () => $("html").toggleClass("show-ui");

  create = async () => {
    this.set("els", {}); // elements
    this.set("header", { left: {}, right: {} });
    this.set("actions", {});
    this.set("left", {});
    this.set("right", {});
    this.set("top", { hero: "", left: {}, right: {} });
    this.set("footer", { left: {}, right: {} });
    this.set("modals", {});
    this.set("body", {});

    this.addElement(
      "copyright",
      "main",
      "footer.left",
      `© ${new Date().getFullYear()}`
    );

    this.addElement(
      "poweredby",
      "main",
      "footer.right",
      `<div class="poweredby">
        <span class="prefix">powered by</span>
        <a href="https://publishkit.dev" target="_new" style="text-decoration: none;margin-left: 4px;" data-tooltip="Markdown driven apps">
          <span class="logo-svg" style="-webkit-mask: url(https://publishkit.dev/attachements/logo/logo.svg) no-repeat center;-webkit-mask-size: contain;mask: url(https://publishkit.dev/attachements/logo/logo.svg) no-repeat center;mask-size: contain;">
            <img src="https://publishkit.dev/attachements/logo/logo.svg" style="opacity:0;"></img>
          </span>
        </a>
      </div>`,
      { index: 1000 }
    );

    return this;
  };

  render = async () => {
    const layout = this.layout.render();
    const { $dom } = window;
    $dom.body = $dom.create(layout);
  };

  draw = async () => {
    const { $dom } = window;
    $("body").html($dom.body.html());
    return await this.utils.dom.waitForEl("main.ready");
  };

  getUIElements = (zone: LayoutZone): UIElement[] => {
    const object = get(this.cache, zone);
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
    ui.get = (id: string) => this.get(`${pluginId}.${id}`);
    ui.addElement = curry(this.addElement)(pluginId);
    ui.addIcon = curry(this.addIcon)(pluginId);
    ui.addAction = curry(this.addAction)(pluginId);
    ui.addModal = curry(this.addModal)(pluginId);

    return ui;
  };

  buildId = (...args: any[]) => args.join(".");

  addElement = (
    pluginId: string,
    elementId: string,
    zone: LayoutZone,
    body: string,
    options?: Partial<UIElement | UIIcon>
  ): UIElement | UIIcon => {
    const id = this.buildId(pluginId, elementId);

    body = body.trim();

    // if not a tag, wrap in div
    if (!body.startsWith("<")) body = `<div>${body}</div>`;

    const el = $(body);
    el.attr("id", id);
    if (options?.className) el.addClass(options.className);

    const html = el.prop("outerHTML");
    const element = <UIElement>{ id, html, ...options };
    this.set(`${zone}.${id}`, element);
    this.set(`els.${id}`, element);
    return element;
  };

  addIcon = (
    pluginId: string,
    elementId: string,
    zone: LayoutZone,
    options: Partial<UIIcon>
  ): UIIcon => {
    const body = `<i class="bx ${options.icon || ""}"></i>`;
    return <UIIcon>this.addElement(pluginId, elementId, zone, body, options);
  };

  addAction = (
    pluginId: string,
    elementId: string,
    options: Partial<UIAction> = {}
  ): UIAction => {
    const icon =
      (options.icon && `<i class="bx-fw bx ${options.icon}"></i>`) || "";
    const body = `<a href="#">${icon}${options.text || "unamed action"}</a>`;
    return <UIAction>(
      this.addElement(pluginId, elementId, "actions", body, options)
    );
  };

  addModal = (
    pluginId: string,
    elementId: string,
    body: string | Function,
    options: Partial<UIModal> = {}
  ): UIModal => {
    const { $modal } = window;
    const id = this.buildId(pluginId, elementId);
    const noesc = (options.noesc && `noesc="true"`) || "";

    body = `<dialog ${noesc}> 
      <article>
        ${body}
      </article>
    </dialog>`;

    options.open = (cb: Function | undefined) => $modal.open(id, cb);
    options.close = (cb: Function | undefined) => $modal.close(cb);

    return <UIModal>(
      this.addElement(pluginId, elementId, "modals", body, options)
    );
  };
}
