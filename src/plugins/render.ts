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
      const tranformer = self[value];
      if (tranformer) tranformer(el, target);
    });

    return $dom;
  };

  switch = (tx: any, target: any) => {
    const { $, $props, $utils, $ee } = window;

    const db = tx.attr("data-bind");
    const { fn, sugar, props } = $props.deSugar(db);
    const initialValue = fn();
    const id = $utils.c.shortId();
    const classes = tx[0].classList.value;
    const data = this.listToData(window, target[0]);

    let str = ``;
    // @ts-ignore
    data.map((item, i) => {
      const el = $(this).children()?.text()
        ? $(this).children().first()
        : $(this);
      const value = item.key;
      const label = item.label || item.key;
      const onclick = item.onclick || `${sugar}='${value}'`;
      const checked = initialValue == value ? "checked" : "";
      str += `<input type="radio" name="foo" id="${id}-${i}" ${checked}><label onclick="${onclick}" for="${id}-${i}">${label}</label>`;
    });

    props.map((prop: string) => {
      // @ts-ignore
      $ee.on(`props:${prop}`, ({ value, old }) => {
        if (old != value)
          $(`input[name="${name}"][id="${value}"]`).prop("checked", "on");
      });
    });

    const el = $(`<div class="switch ${classes}" />`).html(str);
    target.replaceWith(el);
    tx.remove();
  };

  listToData = (win: Window, rootUl: HTMLUListElement | null) => {
    const { $ } = win;
    if (!rootUl) return [];
    const array = [] as any;

    const parseItem = (el: Element) => {
      const key =
        $(el).find("label")[0]?.innerHTML ||
        $(el).clone().children().remove().end().text().trim();
      const _active = !$(el).find('[type="checkbox"][checked=""]')[0];
      const item: ObjectAny = { key, _active, _tokens: [] };
      const onclick = $(el).attr("onclick");
      if (onclick) item.onclick = onclick;

      $(el)
        .find("ul li")
        .map(function () {
          const html = $(this).html();
          if (/[a-zA-Z]+[ ]?:/gi.test(html)) {
            const [key, ...values] = html.split(":");
            item[key.trim()] = values.join("").trim();
            item._tokens.push(item[key.trim()]);
          } else {
            item._tokens.push(html);
          }
        });

      return item;
    };

    for (const el of $(rootUl).find("> li")) {
      array.push(parseItem(el));
    }

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
  `;
  };
}
