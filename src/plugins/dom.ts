import { load as Load } from "src/utils/dom";
import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  body: JQuery;

  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    // this.emit("foo")
  }

  // get a fresh dom
  create = (html: string) => $("<div/>").html(html);

  // load & injects ressources (js, css)
  load = Load;

  waitForEl = (selector: string) => {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  };

  cssvar = (key: string, value: any) =>
    // @ts-ignore
    document.querySelector(":root")?.style.setProperty(key, value);
  // same as document.documentElement.style.setProperty(key, value);

  reloadStylesheets = () => {
    var links = document.getElementsByTagName("link");
    for (var cl in links) {
      var link = links[cl];
      if (link.rel === "stylesheet") link.href += "";
    }
  };

  // rename every props on documents
  // renameProp('data-target', 'onclick')
  renameProp = (from: string, to: string, dom?: JQuery) => {
    const { $utils, $dom } = window;

    $dom.body.find("[" + from + "]").each(function () {
      const el = $(this);
      el.attr({ [to]: el.attr(from) }).removeAttr(from);
    });

    return this;
  };

  // unwrap only-child elements
  // <div><h1>text</h1></div> => <h1>text</h1>
  unwrapOnlyChild = (els: any, wrapper?: string) => {
    const { $utils, $dom } = window;
    const { body } = $dom;

    wrapper = wrapper || "div";

    const selector = $utils.a
      .asArray(els)
      .map((el: string) => `${wrapper} ${el}:only-child`)
      .join(",");

    body.find(selector).each(function () {
      $(this).parent().replaceWith($(this));
    });

    return this;
  };

  reduceHeadings = () => {
    const { body } = window.$dom;
    const h1 = !!body.find("h1").length;
    const embeds = body.find(".embed-content h1").parents(".embed-content");

    // decrement headers level in embeds
    if (h1 && embeds.length) {
      embeds.each(function () {
        const headers = $(this).find("h1,h2,h3,h4,h5,h6");

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

    if (h1) body.find("h1:first-of-type").addClass("root-h1");

    return this;
  };

  processContentBindings = () => {
    const { $dom, $utils } = window;

    $dom.body.find("[data-kit]").each(function () {
      const el = $(this);
      const value = el.attr("data-kit");
      const target = el.next();

      if (value?.startsWith(".")) {
        const classes = $utils.a.asArray(value);
        // @ts-ignore
        classes.map((c) => target.addClass(c.replace(".", "")));
      } else {
        // implement
      }
    });

    return this;
  };
}
