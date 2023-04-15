import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  stack: any[] = [];
  modal: JQuery | false;

  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  get = (id: string) => {
    return this.stack.find((m) => m.attr("id") == id);
  };

  open = (id: string, options?: Function | ObjectAny, cb?: Function) => {
    const { $ui } = window;

    if (typeof options == "function") {
      cb = options;
      options = {};
    } else {
      options = options || {};
      cb = options.cb;
    }

    let modal = this.get(id);

    if (modal) {
      const index = this.stack.indexOf(modal);
      if (index < this.stack.length - 1) {
        this.stack.splice(index, 1);
        this.stack.push(modal);
      }
    } else {
      modal = document.getElementById(id);
      if (!modal) return;
      modal = $(modal);
      if (options.noesc || modal.attr("noesc")) modal.attr("noesc", true);
      this.stack.push(modal);
    }

    this.stack.forEach((m) => m.prop("open", false));

    const self = this;
    setTimeout(() => {
      modal.prop("open", true);
      self.modal = modal;

      // auto focus input if found
      $(modal).find("input,select ~ div").first().trigger("focus");

      // inject UIModal to callback
      cb && cb($ui.get(id));
    }, 10);

    // https://stackoverflow.com/a/7056673/1428445
    // we return false so we can use <a href="#" onclick="return $modal.open('')" /> to prevent default click handler
    return false;
  };

  close = (cb?: Function) => {
    if (!this.modal) return;
    this.stack = this.stack.slice(0, -1);
    this.modal.prop("open", false);
    this.modal = false;
    if (this.stack.length) {
      const modal = this.stack[this.stack.length - 1];
      modal.prop("open", true);
      this.modal = modal;
    }
    cb && cb();

    // https://stackoverflow.com/a/7056673/1428445
    // we return false so we can use <a href="#" onclick="return $modal.open('')" /> to prevent default
    return false;
  };

  bind = async () => {
    const self: ModalPlugin = this;
    window.$modal = self;

    window.documentOnClick.push((event: JQuery.ClickEvent) => {
      if (!self.modal) return;
      const target: any = event.target;

      // @ts-ignore
      const modalContent = self.modal[0]
        .querySelector("article")
        .contains(target);

      // close modal
      if (!modalContent && !self.modal.attr("noesc")) self.close();
    });

    // handle escape
    window.hotkeys("esc", function (event: any) {
      if (!self.modal) return;
      if (!self.modal.attr("noesc")) self.close();
    });
  };

  style = async () => `
    dialog:not([open]), dialog[open=false] {
      display: flex;
    }

    dialog {
      padding: var(--block-spacing-vertical) 0;
      -webkit-transform: translateY(101%);
      transform: translateY(101%);
      transition: all 400ms ease;

      article {
        max-height: calc(100vh - var(--block-spacing-vertical) * 2);
        background: var(--bg);
      }
    }
    
    dialog[open] {
      -webkit-transform: translateY(0%);
      transform: translateY(0%);
    }
    
    @media (max-width: 575px) {
      dialog {
        align-items: flex-start;
        padding: 0;
        article {
          width: -webkit-fill-available;
          max-height: fit-content;
          max-height: -webkit-fill-available;
          margin: 0;
        }
      }
    }
    
    @media (max-width: 767px) {
      dialog {
        align-items: flex-start;
      }
    }
  `;
}
