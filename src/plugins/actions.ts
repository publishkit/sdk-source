import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  render = async () => {
    const cta = `<details class="dropdown-icon right" role="list">
        <summary aria-haspopup="listbox">
            <i class="bx bx-dots-vertical-rounded"></i>
        </summary>
        <ul role="listbox"></ul>
    </details>`

    this.ui.addElement("cta", "header.right", cta, { index: 1000 });
  };

  bind = async () => {
    const { ui } = this;
    const data = ui.base.getUIElements("actions");
    const actions =
      data.length &&
      ui.base.joinUIElements(data, (el) => `<li>${el.html}</li>`);

    const cta = ui.get("cta");
    if(actions) cta.el.find("ul").html(actions);
    else cta.el.remove()
  };

  style = async () => `
  [id="actions.cta"]{
    summary {
        padding: 0 !important;
    }

    ul {
        top: var(--header-height)  !important;
        margin-top: 0px  !important;
        position: fixed  !important;
        border-radius: 0  !important;
    }
  }
  `;
}
