import BasePlugin from "../class/basePlugin";

const reduceHeadings = (dom: JQuery) => {
  const h1 = !!dom.find("> h1").length;
  const embeds = dom.find(".embed-content h1").parents(".embed-content");

  if (h1 && embeds.length) {
    embeds.each(function () {
      const headers = $(this).find("h1,h2,h3,h4,h5,h6");

      // increments headers level
      headers.each(function () {
        const title = $(this).html();
        const level = parseInt(this.tagName.replace("H", ""), 10) + 1;
        let style = $(this).attr("style");
        let className = $(this).attr("class");
        if (className?.includes("noprocess")) return;
        style = (style && `style="${style}" `) || "";
        className = (className && `class="${className}" `) || "";
        const tag = `<h${level} ${className} ${style}>${title}</h${level}>`;
        // console.log("iiii", `<h${level-1}>${title}<h${level-1}>`, tag)
        $(this).replaceWith($(tag));
      });
    });
  }

  // unwrap only-child headers
  // <div><h1>text</h1></div> => <h1>text</h1>
  dom
    .find(
      "div h1:only-child,div h2:only-child,div h3:only-child,div h4:only-child,div h5:only-child,div h6:only-child"
    )
    .each(function () {
      $(this).parent().replaceWith($(this));
    });

  return dom;
};

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

  init = async () => {
    const content = this.ui.base.get("content");
    const dom = $("<div/>").html(content);
    const modified = reduceHeadings(dom);
    this.ui.base.set("content", modified.html());
    return true;
  };

  bind = async () => {
    window.documentOnClick = [];

    // global click listener
    $(document).on("click", (event) => {
      window.documentOnClick.map((fn: Function) => fn(event));
    });

    // onclick prop is not passed in html in obsidian, so we use data-click and then rename it here
    this.utils.dom.renameProp("data-click", "onclick");

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
