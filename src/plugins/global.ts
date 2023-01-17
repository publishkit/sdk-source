import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "global";
    this.deps = [
      "https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js",
    ];
    this.css = [
      "https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css",
    ];
  }

  code = async () => {
    // global click listener
    $(document).on("click", (event) => {
      const target: any = event.target;

      // close modal
      if (window.modal) {
        // const searchBtn = $(target).parents('#search-btn').length
        // const searchIcon = ($(target).attr('class')||'').indexOf('search') >= 0
        const modalContent = window.modal[0]
          .querySelector("article")
          .contains(target);
        // if(!(searchBtn || searchIcon || modalContent)) window.modal.prop('open', false)
        if (!modalContent) window.modal.prop("open", false);
      }

      // close menu if open
      if ($("#navbar.open")[0]) {
        const isIcon = target.id == "navbar-icon";
        const isNav = $(target).parents("#navbar").length;
        if (!(isIcon || isNav)) this.app.plugins.get("navbar").toggle();
      }
    });

    // onclick prop is not passed in html in obsidian, so we use data-click and then rename it here
    this.utils.d.renameProp("data-click", "onclick");

    // tables
    $("table").wrap("<figure></figure>"); // make tables scrollable
    for (const el of document.querySelectorAll("table"))
      el.setAttribute("role", "grid"); // make table striped

    // for (const el of document.querySelectorAll('img')) el.setAttribute('class', 'img-fluid')

    // callouts
    $(".callout-title:has(.callout-fold)").on("click", function () {
      $(this).next().toggle();
    });
  };
}
