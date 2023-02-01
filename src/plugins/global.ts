import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    this.deps = [
      "https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js",
    ];
    this.css = [
      "https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css",
    ];
  }

  bind = async () => {
    window.documentOnClick = [];

    // global click listener
    $(document).on("click", (event) => {
      window.documentOnClick.map((fn: Function) => fn(event));
    });

    // onclick prop is not passed in html in obsidian, so we use data-click and then rename it here
    this.utils.dom.renameProp("data-click", "onclick");

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
