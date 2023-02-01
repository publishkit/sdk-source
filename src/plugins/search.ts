import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    this.deps = [
      "https://cdn.jsdelivr.net/npm/minisearch@6.0.0/dist/umd/index.min.js",
    ];
    this.options = {
      shortcut: "command+k", // shift,command,control
      padding: 15,
      fuzzy: 0.2,
      chars: 3,
      max_results: 5,
      ...this.options,
    };
  }

  init = async () => {
    const { notes = {} } = this.app.cache.pkdb || {};
    return Object.keys(notes).length;
  };

  render = async () => {
    const { ui, utils, options } = this;

    const defaultValue = utils.w.urlParams.get("s") || "";

    const modal = `
      <input type="search" placeholder="search" value="${defaultValue}" />
      <ul></ul>
      <div class="help d-flex justify-content-between">
        <ul class="d-flex">
          <li>
            <kbd><svg width="15" height="15" aria-label="Enter key" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M12 3.53088v3c0 1-1 2-2 2H4M7 11.53088l-3-3 3-3"></path></g></svg></kbd>
            <span>goto</span>
          </li>
          <li>
            <kbd><svg width="15" height="15" aria-label="Arrow down" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M7.5 3.5v8M10.5 8.5l-3 3-3-3"></path></g></svg></kbd><kbd><svg width="15" height="15" aria-label="Arrow up" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M7.5 11.5v-8M10.5 6.5l-3-3-3 3"></path></g></svg></kbd>
            <span>navigate</span>
          </li>
          <li onclick="$modal.close()">
            <kbd><svg width="15" height="15" aria-label="Escape key" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956"></path></g></svg></kbd>
            <span>close</span>
          </li>
        </ul>
      </div>
    `;

    let [s1, s2] = options.shortcut.split("+");
    s1 = s1
      .replace("command", "⌘")
      .replace("shift", "^")
      .replace("control", "✲");
    s2 = s2.toUpperCase();

    const button = `<button type="button" class="contrast outline d-flex justify-content-between align-items-center">
      <span class="d-flex align-items-center">
        <i class="bx bx-search-alt"></i>
        <span class="text">Search</span>
      </span>
      <span><kbd><span class="symbol">${s1}</span>${s2}</kbd></span>
    </button>`;

    const open = () =>
      ui.getModal("main").open((modal) => {
        modal.el.find("input").trigger("focus");
      });

    ui.addModal("main", modal);
    ui.addElement("header.elements", "btn", button, { fn: open });
    ui.addHeaderIcon("icon", {
      icon: "bx-search-alt",
      fn: open,
    });
  };

  bind = async () => {
    const { ui, app, options, utils } = this;

    const icon = ui.getHeaderIcon("icon");
    const button = ui.getElement("header.elements", "btn");
    const modal = ui.getModal("main");
    const input = modal.el.find("input");
    const list = modal.el.find("article > ul");
    const hotkeys = <HotkeysPlugin>app.plugins.get("hotkeys");
    let results: any = [];

    // bind header icon
    icon.el.on("click", icon.fn);
    button.el.on("click", button.fn);

    const idx = new window.MiniSearch({
      fields: ["title", "text"], // fields to index for full-text search
      storeFields: ["title", "text", "url"], // fields to return with search results
    });

    const db = Object.values(app.cache.pkdb.notes);

    // add id to dataset
    // @ts-ignore
    db.map((item, i: Number) => (db[i].id = i));
    // add dataset to index
    idx.addAll(db);

    const selectResult = () => {
      const selectedIndex = list.find(".selected").index();
      const url = results[selectedIndex];
      // @ts-ignore
      window.location = `${window.pk.base}${url}`;
    };

    const highlight = (terms: string[], str: string) => {
      var re = new RegExp(terms.join("|"), "gi");
      return str.replace(re, (matched: string) => `<mark>${matched}</mark>`);
    };

    const getsTerms = (terms: string[], match: ObjectAny, field: string) => {
      const result: any = [];
      terms.map((t: string) => {
        if (match[t].includes(field)) result.push(t);
      });
      return result;
    };

    const makeSearch = () => {
      let str = "";
      const value = (input.val() + "").trim();
      results = []; // reset global results

      if (value && value.length >= options.chars) {
        const searchResults = idx.search(value, {
          prefix: true,
          fuzzy: options.fuzzy,
          boost: { title: 2 },
        });
        console.log("search", value, searchResults);
        searchResults.map((r: ObjectAny, i: number) => {
          const titleTerms = getsTerms(r.terms, r.match, "title");
          const textTerms = getsTerms(r.terms, r.match, "text");
          const title = titleTerms.length
            ? highlight(titleTerms, r.title)
            : r.title;
          const text = textTerms.length
            ? utils.m.truncateBetweenPattern(
                highlight(textTerms, r.text),
                "<mark>.+?</mark>",
                options.padding,
                " ... "
              )
            : "";
          str += `<li class="${i == 0 ? "selected" : ""}">
              <div class="title"><i class='bx bx-file-blank' ></i> ${title}</div>
              ${text ? `<div class="text">${text}</div>` : ""}
          </li>`;
          results.push(r.url);
        });
      }

      list.html(str);
    };

    // @ts-ignore
    input.on("input", $.debounce(1000, makeSearch));

    input.on("keydown", function (e) {
      // enter
      if (e.keyCode == 13) selectResult();

      if (results.length <= 1) return;

      // up
      if (e.keyCode == 38) {
        const selected = list.find(".selected");
        list.find("li").removeClass("selected");
        if (!selected.length) list.find("li").last().addClass("selected");
        else if (selected.prev().length == 0)
          selected.siblings().last().addClass("selected");
        else selected.prev().addClass("selected");
      }

      // down
      if (e.keyCode == 40) {
        const selected = list.find(".selected");
        list.find("li").removeClass("selected");
        if (!selected.length) list.find("li").first().addClass("selected");
        else if (selected.next().length == 0)
          selected.siblings().first().addClass("selected");
        else selected.next().addClass("selected");
      }
    });

    list.on("mouseover", "li", function () {
      list.find("li").removeClass("selected");
      $(this).addClass("selected");
    });

    list.on("click", "li", function () {
      selectResult();
    });

    // init search if "s" param is present in url
    if (utils.w.urlParams.get("s")) {
      makeSearch();
      modal.open(() => {
        input.trigger("focus");
      });
    }

    hotkeys?.register(
      options.shortcut,
      "open global search",
      function (event: any) {
        if (modal.el.prop("open")) modal.close();
        else
          modal.open(() => {
            input.trigger("focus");
          });
      }
    );
  };

  style = async () => `
    [id="modals.search.main"] {
      align-items: flex-start;
      
      article {
        margin: 0;
        padding: 20px;
        width: -webkit-fill-available;
      }
      ul:first-of-type {
        padding: 0;
        margin: 0;
        li {
          list-style: none;
          padding: 1rem;
          border-radius: var(--border-radius);
          cursor: pointer;
          border: var(--border-width) solid transparent;

          &.selected {
            border: var(--border-width) solid var(--muted-border-color);
            background: var(--card-background-color);
          }
          div.text {
            font-size: 0.8rem;
            color: hsl(var(--color-hsl) / .3);
            border-top: var(--border-width) solid var(--muted-border-color);
            margin-top: 0.4rem;
            padding-top: 0.4rem;
          }
        }
      }

      .help {
        border-top: 2px dashed var(--muted-border-color);
        margin-top: 20px;
        padding-top: 20px;
        ul {
          padding: 0;
          margin: 0;
        }
        span {
          font-size: 0.8rem;
        }
        li {
          list-style: none;
          padding: 0;
          padding-right: 10px;
          margin-bottom: 0;
        }
        kbd {
          font-size: 0.8rem;
          margin-right: 2px;
        }
      }
    }
    
    [id="header.elements.search.btn"] {
      display: none;
      .text {
        font-size: 0.8rem;
      }
      > button {
        min-width: 130px;
      }
      kbd {
        font-size: 0.6rem;
        display: flex;
        align-items: center;
        padding: 0px 5px;
        span {
          font-size: 1rem;
          margin-right: 3px;
        }
      }
    }

    @media (max-width: 576px) {
      [id="modals.search.main"] {
        padding: 0;
        article {
          border-radius: 0;
          max-height: 100vh;

          input {
            border-radius: 0;
            height: 50px;
            border-bottom: 1px solid;
          }
        }
      }
    }
    
    @media (min-width: 576px) {
      [id="modals.search.main"] article {
        margin: var(--block-spacing-vertical) 0;
      }
      li:has([id="header.icons.search.icon"]) {
        display: none !important;
      }
      [id="header.elements.search.btn"] {
        display: block;
      }
    }

    @media (min-width: 992px) {
      [id="header.elements.search.btn"] button {
        min-width: 200px;
      }
    }
  `;
}
