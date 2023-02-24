import { text } from "stream/consumers";
import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  transform = async () => {
    const self = this;
    const { $dom, $utils } = window;

    $dom.body.find("[data-ui]").each(function () {
      const el = $(this);
      const value = el.attr("data-ui");
      const target = el.next();

      // @ts-ignore
      const tranformer = self[value] || self.basic;
      if (tranformer) tranformer(el, target);
    });

    return $dom;
  };

  basic = (tx: any, target: any) => {
    tx.attr("class") && target.addClass(tx.attr("class"));
    tx.attr("style") && target.prop("style", tx.attr("style"));
    tx.remove();
  };

  hero_title = (tx: any, target: any) => {
    tx.attr("class") && target.addClass(tx.attr("class"));
    tx.attr("style") && target.prop("style", tx.attr("style"));
    const data = this.listToData(window, target[0]);
    const title = data.getValue("title");
    const label = data.getValue("label");
    target.replaceWith(
      `<div class="hero_title"><div class="title">${title}</div><span class="label bottom">${label}</span></div>`
    );
    tx.remove();
  };

  switch = (tx: any, target: any) => {
    const { $, $props, $utils, $ee } = window;

    const db = tx.attr("data-bind");
    const binding = $props.deSugar(db);
    const initialValue = (binding.fn && binding.fn()) || "";
    const id = $utils.c.shortId();
    const data = this.listToData(window, target[0]);

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
      str += `<input type="radio" name="${id}" id="${id}-${i}" ${checked}><label onclick="${onclick}" for="${id}-${i}">${label}</label>`;
    });

    binding.props.map((prop: string) => {
      // @ts-ignore
      $ee.on(`props:${prop}`, ({ value, old }) => {
        if (old != value)
          $(`input[name="${id}"][id="${value}"]`).prop("checked", "on");
      });
    });

    const el = $(`<div class="switch" />`).html(str);
    tx.attr("class") && el.addClass(tx.attr("class"));
    tx.attr("style") && el.prop("style", tx.attr("style"));

    target.replaceWith(el);
    tx.remove();
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
        item.value = rest.join(":").trim();
      }

      $(el)
        .find("ul li")
        .map(function () {
          const html = $(this).html();
          if (isKV(html)) {
            const [key, ...values] = html.split(":");
            item[key] = values.join("").trim();
            item._tokens.push(item[key]);
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
        border-radius: var(--border-radius);
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
        border-radius: var(--border-radius);
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
