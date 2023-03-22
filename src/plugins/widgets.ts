import { text } from "stream/consumers";
import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  types = [
    "switch",
    "hero-title",
    "div",
    "wrapper",
    "preview",
    "section",
    "card",
  ];

  transform = async () => {
    const self = this;
    const { $dom, $utils } = window;
    const dry = false; // toggle for debug

    const renderWidgets = () => {
      this.types.map((type) => {
        $dom.body.find(`[data-${type}]:not([data-rendered])`).each(function () {
          const start = $(this);
          const nodes = self.getNodes(start);
          let box = $("<div />");

          // @ts-ignore
          self.passProps(start, box);

          nodes.map((el) => {
            box.append(el.clone());
            !dry && el.remove();
          });

          // @ts-ignore
          const tranformer = self[type.replaceAll("-", "_")];
          if (tranformer) box = tranformer(box) || box;

          !dry && start.replaceWith(box);
        });
      });
    };

    // 2 level render
    renderWidgets();
    renderWidgets();

    return $dom;
  };

  passProps = (source: JQuery, target: JQuery) => {
    const { utils } = this;
    target.attr("data-rendered", "true");

    $.each(source.prop("attributes"), function () {
      if (["class", "style"].includes(this.name)) return;
      target.attr(this.name, this.value);
    });

    // @ts-ignore
    source.attr("class") && target.addClass(source.attr("class"));
    source.attr("style") &&
      target.attr(
        "style",
        utils.s.join(source.attr("style"), target.attr("style"))
      );
  };

  isStartTag = (el: JQuery) => {
    for (const type of this.types)
      if (typeof el.attr(`data-${type}`) == "string") return true;
    return false;
  };

  isEndTag = (el: JQuery) => {
    return [typeof el.attr(`data-end`), typeof el.attr(`data-close`)].includes(
      "string"
    );
  };

  getNodes = (start: JQuery) => {
    const nodes = [];
    let current = start;
    let next = start.next().length;
    let level = 0;
    let i = 0;

    while (next && i < 1000) {
      i++;
      current = current.next();
      const isStartTag = this.isStartTag(current);
      if (isStartTag) level++;

      const isEndTag = this.isEndTag(current);
      const isFinalTag = isEndTag && !level;
      if (level && isEndTag) level--;

      if (isFinalTag) {
        next = 0;
        current.remove();
      } else {
        nodes.push(current);
      }
    }

    return nodes;
  };

  // basic = (tx: any, target: any) => {
  //   const onlyChild = target.find("> ul:only-child");
  //   if (onlyChild.length) target = onlyChild;
  //   tx.attr("class") && target.addClass(tx.attr("class"));
  //   tx.attr("style") && target.prop("style", tx.attr("style"));
  //   tx.remove();
  // };

  wrapper = (box: JQuery) => {
    box.addClass("wrapper py-5");
    return box;
  };

  card = (box: JQuery, className = "") => {
    const { app, passProps, utils } = this;
    const settings = app.cfg("cards") || {};

    const children = box.children();
    const onlyChild = children.length == 1;

    box.addClass("cards");
    settings.class && box.addClass(settings.class);
    settings.style &&
      box.attr("style", utils.s.join(settings.style, box.attr("style")));
    className && box.addClass(className);

    const bg = box.attr("data-bg");
    bg && box[0].style.setProperty("--cards-bg", bg);

    if (onlyChild) {
      let child = children.first();
      if (child[0]?.tagName != "UL") {
        child = child.children().first();
        if (child[0]?.tagName != "UL") return box;
      }

      const data = this.listToData(window, <HTMLUListElement>child[0]);
      const item = {
        class: box.attr("data-item-class"),
        style: box.attr("data-item-style"),
        click: box.attr("data-item-click"),
        href: typeof box.attr("data-item-href") == "string",
      };

      const wrapClick = (fnBody, items, index) => {
        const a = JSON.stringify(items[index]);
        const b = JSON.stringify(items);
        const fn = `((item, index, items) => { ${fnBody} })(${a}, ${index}, ${b});`;
        // console.log("wrapClick", fn);
        return fn;
      };

      child.children().each(function (index) {
        const li = $(this);

        // remove key value list item
        li.find("ul li").map(function () {
          const li = $(this);
          if (li.attr("is-kv")) li.remove();
        });

        // pass item props
        (settings.item?.class || item.class) &&
          li.addClass(`${settings.item?.class || ""} ${item.class || ""}`);
        (settings.item?.style || item.style) &&
          li.attr("style", utils.s.join(settings.item?.style, item.style));
        item.click && li.attr("onclick", wrapClick(item.click, data, index));

        if (item.href) {
          const html = li.html();
          const { href } = item;
          const a = $("<a>", { href: item.href }).append(html);
          li.html(a.prop("outerHTML"));
        }
      });

      passProps(box, child);
      box = child;
    }
    return box;
  };

  preview = (box: JQuery) => {
    return this.card(box, "preview");
  };

  section = (box: JQuery) => {
    const { app, utils } = this;
    const settings = app.cfg("sections") || {};

    const section = $("<section />");
    const wrapper = $('<div class="wrapper">');

    if (
      (settings.class && box.hasClass("text-start")) ||
      box.hasClass("text-end")
    )
      settings.class = settings.class.replace("text-center", "");

    settings.class && section.addClass(settings.class);
    settings.style &&
      section.attr(
        "style",
        utils.s.join(settings.style, section.attr("style"))
      );
    this.passProps(box, section);

    const bg = box.attr("data-bg");
    if (bg) section[0].style.setProperty("--section-bg", bg);

    wrapper.append(box.html());
    section.html(wrapper.prop("outerHTML"));
    return section;
  };

  hero_title = (box: JQuery) => {
    const child = box.children().first();
    if (child[0].tagName != "UL") return box;
    const data = this.listToData(window, <HTMLUListElement>child[0]);
    const title = data.getValue("title");
    const label = data.getValue("label");
    return $(
      `<div class="hero_title">
        <div class="title">${title}</div>
        <span class="label bottom">${label}</span>
      </div>`
    );
  };

  switch = (box: JQuery) => {
    let child = box.children().first();
    if (child[0].tagName != "UL") {
      child = child.children().first();
      if (child[0].tagName != "UL") return box;
    }

    const { $, $props, $utils, $ee } = window;

    const db = box.attr("data-bind");
    const binding = $props.deSugar(db);
    const initialValue = (binding.fn && binding.fn()) || "";
    const id = $utils.c.shortId();
    const data = this.listToData(window, <HTMLUListElement>child[0]);

    let str = ``;
    // @ts-ignore
    data.map((item, i) => {
      const el = $(this).children()?.text()
        ? $(this).children().first()
        : $(this);
      const value = item.key;
      const label = item.label || item.key;

      const onclick = item.onclick || (db && `${binding.sugar}='${value}'`);
      const checked = initialValue == value ? "checked" : "";
      str += `<input type="radio" name="${id}" id="${id}-${value}" ${checked}><label onclick="${onclick}" for="${id}-${i}">${label}</label>`;
    });

    binding.props.map((prop: string) => {
      // @ts-ignore
      $ee.on(`props:${prop}`, ({ value, old }) => {
        if (old != value) $(`input[id="${id}-${value}"]`).prop("checked", "on");
      });
    });

    const el = $(`<div class="switch" />`).html(str);
    this.passProps(box, el);

    return el;
  };

  listToData = (win: Window, rootUl: HTMLUListElement | null) => {
    const { $ } = win;
    if (!rootUl) return [];
    const array = [] as any;

    const parseItem = (el: Element) => {
      let key =
        $(el).find("label")[0]?.innerHTML ||
        $(el).clone().children().remove().end().text().trim();

      const isKV = (k: string) => /^[a-zA-Z]+:/gi.test(k); // keyvalue mode

      const item: ObjectAny = { _tokens: [] };
      item.key = isKV(key) ? key.split(":")[0] : key;
      item._active = !$(el).find('[type="checkbox"][checked=""]')[0];
      item.onclick = $(el).attr("onclick") || "";

      if (isKV(key)) {
        const [k, ...rest] = key.split(":");
        item.value =
          rest.join(":").trim() || $(el).html().replace(`${item.key}:`, "");
      }

      $(el)
        .find("ul li")
        .map(function () {
          const html = $(this).html();
          if (isKV(html)) {
            const [key, ...values] = html.split(":");
            item[key] = values.join("").trim();

            // if special key href and link tag present, parse & return href only
            if (key == "href" && item[key].startsWith("<a"))
              item[key] = $(item[key])
                .prop("href")
                .replace(window.location.origin + "/", "");

            $(this).attr("is-kv", true);
            // item._tokens.push(item[key]);
          } else {
            item._tokens.push(html);
          }
        });

      return item;
    };

    for (const el of $(rootUl).find("> li")) {
      array.push(parseItem(el));
    }

    array.getValue = (key: string) =>
      array.find((d: any) => d.key == key)?.value;

    return array;
  };

  style = async () => {
    return `
    .switch {
        display: flex;
        justify-content: start;
        align-items: start;
        width: fit-content;
        background-color: var(--form-element-background-color);
        border-radius: calc(var(--border-radius) + 2px);
        border: var(--border-width) solid var(--form-element-border-color);
        margin-bottom: var(--spacing);
        
        input[type="radio"] {
            appearance: none;
            display: none;
        }
        
        label {
            display: inline-flex;
            justify-content: space-around;
            align-items: center;
            height: var(--input-height);
            padding: var(--spacing);
            font-size: 0.8rem;
            transition: linear 0.3s;
            margin-right: 0;

            &:first-of-type {
                border-top-left-radius: var(--border-radius);
                border-bottom-left-radius: var(--border-radius);
            }
            &:last-of-type {
                border-top-right-radius: var(--border-radius);
                border-bottom-right-radius: var(--border-radius);
            }
        }
        
        input[type="radio"]:checked + label, input[type="radio"]:hover + label  {
            background-color: var(--primary);
            color: var(--primary-inverse);
            // font-weight: 900;
            transition: 0.3s;
        }
    
    }



    /* HERO_TITLE */

    .hero_title {
      position: relative;
      background-size: cover;
      padding-bottom: 30%;
      font-weight: normal;
      border-radius: var(--border-radius);
      // background: var(--primary);
      margin: 0 -1rem;
      margin-top: -1rem;
      margin-bottom: 3rem;
      border-radius: 0;
      overflow: hidden;

      &::before {
        content: '';
        animation:slide 5s ease-in-out infinite alternate;
        background-image: linear-gradient(36deg, var(--contrast) 50%, var(--primary) 50%);
        position: absolute;
        top: 0px;
        left: 0px;
        width: calc(100% * 2);
        height: 100%;
      }

      .title {
        font-weight: bold;
        // text-transform: uppercase;
        text-align: right;
        background: var(--bg);
        display: block;
        padding: 0.5rem;
        transform-origin: 124% 0%;
        transform: skew(0, -10deg);
        font-size: 2rem;
      }

      .label {
        position: absolute;
        color: var(--bg);
        &.top {
          top: .5rem;
          left: .5rem;
        }
        &.bottom {
          right: .5rem;
          bottom: .5rem;
        }
      }
    }

    @media (min-width: 768px){
      .hero_title {
        // border-radius: var(--border-radius);
      }
    }

    @keyframes slide {
      0% {
        transform:translateX(-50%);
      }
      100% {
        transform:translateX(0%);
      }
    }

    

    /* TYPING EFFECT */

    .typing > * {
      overflow: hidden;
      white-space: nowrap;
      animation: typingAnim 2s steps(50);
    }

    .typing > *::before{
      content: "";
      position: absolute;
      display: block;
      top: 2.1em;
      left: .25em;
      width: 1em;
      height: .1em;
      border-radius: 100%;
      background: #fff;
      animation: typingSpeak .2s steps(2);
      animation-iteration-count: 10;
    }

    .typing > *::after {
      content: ". .";
      display: block;
      position: absolute;
      top: 1em;
      left: .35em;
    }

    @keyframes typingAnim{
      from { width: 0 }
      to { width: 100% }
    }
    @keyframes typingSpeak{
      0% { width: 1em; height: .1em }
      100% { width: 1em; height: .5em; }
    }
  `;
  };
}
