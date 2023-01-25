import BasePlugin from "./basePlugin";

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
    const self = this
    setTimeout(() => {
      modal.prop("open", true);
      self.modal = modal;

      // inject UIModal to callback
      const [_, pluginId, elementId] = id.split(".")
      cb && cb(self.app.ui.getModal(pluginId, elementId));
    }, 0)
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
}
