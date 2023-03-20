import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    this.deps = [
      "https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js",
      "https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css",
    ];
  }

  transform = async () => {
    const { $dom, $app } = window;

    $dom
      .reduceHeadings()
      .unwrapOnlyChild("h1,h2,h3,h4,h5,h6")
      // onclick is not rendered in html in obsidian, so we use custom binding name instead.
      .renameProp("data-click", "onclick")
      .renameProp("data-onclick", "onclick")

    
    const layout = $app.cfg("layout") || {}
    if(layout.fluid) $("body").addClass("layout-fluid")

    return $dom;
  };

  bind = async () => {
    window.documentOnClick = [];

    // global click listener
    $(document).on("click", (event) => {
      window.documentOnClick.map((fn: Function) => fn(event));
    });

    // tables
    $("th .dataview").remove(); // remove dataview row number
    $("thead").each(function () {
      // remove empty headers
      const thead = this;
      $(this)
        .find("> tr > th")
        .each(function () {
          const th = $(this).text();
          if (!th) $(thead).remove();
        });
    });
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
