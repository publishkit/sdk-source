import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  render = async () => {
    const { $theme } = window;
    const { ui } = this;

    const icon = $theme.mode() == "light" ? "bx-moon" : "bx-sun";

    ui.addIcon("icon", "header.right", {
      icon,
      fn: function () {
        if ($theme.mode() == "light")
          $(this).removeClass("bx-moon").addClass("bx-sun");
        else $(this).removeClass("bx-sun").addClass("bx-moon");
        $theme.switch();
      },
    });
  };

  bind = async () => {
    const { ui } = this;
    const icon = ui.get("icon");
    icon.el.on("click", icon.fn);
  };
}
