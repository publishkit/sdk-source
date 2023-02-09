import UI from "src/ui";

export default class Layout {
  ui: UI;

  constructor(ui: UI) {
    this.ui = ui;
  }

  render = () => {
    const { $cfg } = window;
    const fluid = $cfg("layout.fluid") ? "-fluid" : "";

    const body = this.body();
    const header = this.header();
    const left = this.left();
    const right = this.right();
    const center = this.center();
    const modals = this.modals();

    return `
      ${body}
      ${header}
      <main class="ready container${fluid}">
        ${left}
        ${center}
        ${right}
        ${modals}
      </main>`;
  };

  body = () => {
    const data = this.ui.getUIElements("body");
    return (data.length && this.ui.joinUIElements(data)) || "";
  };

  header = () => {
    return this.ui.cache.header.html || "";
  };

  left = () => {
    const { ui } = this;
    const data = ui.getUIElements("left");
    return (
      (data.length &&
        `<aside>
            <div class="ui-left">
            ${ui.joinUIElements(data)}
            </div>
        </aside>`) ||
      ""
    );
  };

  right = () => {
    const { ui } = this;
    const data = ui.getUIElements("right");
    return (
      (data.length &&
        `<div>
        <div class="ui-right">
          ${ui.joinUIElements(data)}
        </div>
      </div>`) ||
      ""
    );
  };

  top = () => {
    const { ui } = this;
    const rx: ObjectAny = {};
    let top,
      left,
      right,
      actions = "";

    actions = this.actions();

    left = ui.getUIElements("top.left");
    left = (left.length && ui.joinUIElements(left)) || "";

    right = ui.getUIElements("top.right");
    right = (right?.length && `${ui.joinUIElements(right)}`) || "";

    top = left || right || actions;
    top =
      (!!top &&
        `<div class="ui-top">
          <div class="ui-top-left">${left}</div>
          <div class="ui-top-right">${right}${actions}</div>
        </div>`) ||
      "";

    return top;
  };

  actions = () => {
    const { ui } = this;
    const data = ui.getUIElements("actions");
    const actions =
      data.length && ui.joinUIElements(data, (el) => `<li>${el.html}</li>`);

    return (
      (data.length &&
        `<details class="dropdown-icon right" role="list">
        <summary aria-haspopup="listbox">
          <i class="bx bx-dots-vertical-rounded"></i>
        </summary>
        <ul role="listbox">
          ${actions}
        </ul>
      </details>`) ||
      ""
    );
  };

  content = () => {
    const content = $(`[id="content"]`).html();
    return `<div class="ui-content" role="document">
        ${content}
    </div>`;
  };

  center = () => {
    const hero = this.hero();
    const top = this.top();
    const content = this.content();
    const footer = this.footer();
    return `<div class="ui-center">
      ${hero}
      ${top}
      ${content}
      ${footer}
    </div>`;
  };

  hero = () => {
    const { ui } = this;
    const data = ui.getUIElements("top.hero");
    return (data.length && ui.joinUIElements(data)) || "";
  };

  footer = () => {
    const { ui } = this;
    const rx: ObjectAny = {};

    rx.left = ui.getUIElements("footer.left");
    rx.left =
      (rx.left.length &&
        `<div class="ui-footer-left d-grid">
          ${ui.joinUIElements(rx.left)}
        </div>`) ||
      "";

    rx.right = ui.getUIElements("footer.right");
    rx.right =
      (rx.right.length &&
        `<div class="ui-footer-right d-grid">
          ${ui.joinUIElements(rx.right)}
        </div>`) ||
      "";

    rx.footer = rx.left || rx.right;
    rx.footer =
      (!!rx.footer &&
        `<footer id="footer" class="ui-footer d-grid">
          ${rx.left}
          ${rx.right}
        </footer>`) ||
      "";

    return rx.footer;
  };

  modals = () => {
    const { ui } = this;
    const data = ui.getUIElements("modals");
    return (
      (data.length &&
        `<div class="ui-modals">${ui.joinUIElements(data)}</div>`) ||
      ""
    );
  };
}
