import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  select: any;
  tags: ObjectAny[];
  notes: ObjectAny[] = [];
  results: ObjectAny[] = [];

  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);

    this.setDefaults({
      placeholder: "Search Tags...",
      shortcut: "control+k",
      cloud: true,
      icon: false,
    });
  }

  init = async () => {
    this.notes = Object.values(this.app.cache.kitdb.notes || {});
    this.tags = this.loadTags();
    return this.notes.length && this.tags.length;
  };

  render = async () => {
    const { ui, utils, tags, options } = this;

    const defaultTags = utils.a.asArray(utils.w.urlParams.get("t") || "");
    const isSelected = (tag = "") =>
      defaultTags.includes(tag) ? "selected" : "";

    const modal = `
    <select data-select data-ref="$tags.select" multiple="true" placeholder="${
      options.placeholder
    }" class="md">
      ${tags
        .map(
          (tag) =>
            `<option ${isSelected(tag.tag)} value="${tag.tag}">${tag.tag} ${
              (tag.count > 1 && `(${tag.count})`) || ""
            }</option>`
        )
        .join("")}
      </select>

      ${(options.cloud && this.renderCloud()) || ""}

      <ul class="results"></ul>

      <div class="help">
        <ul class="d-flex">
          ${
            (window.$search &&
              `<li onclick="$modal.close();$modal.open('search.modal')" class="cursor">
            <kbd><i class="bx bx-text"></i></kbd>
            <span>text search</span>
          </li>`) ||
            ""
          }  
          <li onclick="$modal.close()" class="cursor">
            <kbd><svg width="15" height="15" aria-label="Escape key" role="img"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"><path d="M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956"></path></g></svg></kbd>
            <span>close</span>
          </li>
        </ul>
      </div>
      `;

    ui.addModal("modal", modal);
    options.icon &&
      ui.addIcon("icon", "header.right", {
        index: -1,
        icon: "bx-hash",
        fn: ui.get("modal").open,
      });
  };

  // inspired from https://stackoverflow.com/a/18793324
  getWeight = (counter = 1, min = 1, max = 9) => {
    const counters = this.tags.map((t) => t.count);
    const min_counter = Math.min(...counters);
    const max_counter = Math.max(...counters);
    const x =
      ((counter - min_counter) * (max - min)) / (max_counter - min_counter) +
      min;
    return Math.round(x);
  };

  renderCloud = () => {
    let str = `<ul data-show="!~tags_results_length" class="cloud" role="navigation">`;
    this.tags.sort((a, b) => 0.5 - Math.random()).map((t) => {
      str += `<li><a href="#" onclick="return $tags.search('${
        t.tag
      }', true) && false" data-weight="${this.getWeight(t.count)}">${
        t.tag
      }</a></li>`;
    });
    str += `</ul>`;
    return str;
  };

  loadTags = () => {
    // @ts-ignore
    const tags: ObjectAny = this.notes.reduce((acc: any, item: ObjectAny) => {
      item.tags.map((tag: string) => {
        acc[tag] = acc[tag] || { tag, count: 0 };
        acc[tag].count++;
      });
      return acc;
    }, {});

    return Object.values(tags).sort((a, b) => {
      return b.count - a.count;
    });
  };

  search = (tags: any, updateSelect = false) => {
    const { utils, notes } = this;
    tags = utils.a.asArray(tags);
    this.results = notes.filter((note: ObjectAny, i: number) => {
      const match = utils.a.intersectStrings(note.tags, tags);
      return match.length;
    });

    this.log(tags, this.results);
    this.updateSearch();

    updateSelect && this.select.setSelected(tags);

    window.$props.set("tags_results_length", this.results.length);
    return this.results;
  };

  updateSearch = async () => {
    const { ui, results, utils } = this;

    const modal = ui.get("modal");
    const list = modal.el.find("article > ul.results");

    let str = "";
    results.map((note: ObjectAny, i: number) => {
      str += `<li class="${i == 0 ? "selected" : ""}">
        <div class="title"><i class='bx bx-file-blank' ></i> ${note.title}</div>
        <div class="url">${note.url}</div>
      </li>`;
    });

    list.html(str);
  };

  bind = async () => {
    const self = this;
    const { $kit, SlimSelect } = window;
    const { ui, app, options, utils } = this;

    const icon = ui.get("icon");
    const modal = ui.get("modal");
    const input = modal.el.find("select");
    const list = modal.el.find("article > ul.results");
    const hotkeys = <HotkeysPlugin>app.plugins.get("hotkeys");
    const defaultSearch = [utils.w.urlParams.get("t")].filter(Boolean);

    // bind header icon
    options.icon && icon.el.on("click", icon.fn);

    const selectResult = (index: number) => {
      const url = this.results[index].url;
      // @ts-ignore
      window.location = `${$kit.base}${url}`;
    };

    // @ts-ignore
    input.on("change", function (e) {
      // @ts-ignore
      self.search($(this).val());
    });

    list.on("mouseover", "li", function () {
      list.find("li").removeClass("selected");
      $(this).addClass("selected");
    });

    list.on("click", "li", function () {
      selectResult($(this).index());
    });

    // init search if "s" param is present in url
    if (defaultSearch.length) {
      this.search(defaultSearch);
      // @ts-ignore
      modal.open();
    }

    hotkeys?.register(
      options.shortcut,
      "open tags search",
      function (event: any) {
        if (modal.el.prop("open")) modal.close();
        else
          modal.open(() => {
            input.trigger("focus");
          });
      }
    );

    // tags on pages
    $("a.tag").on("click", function (e) {
      e.preventDefault();
      const tag = $(this).attr("href")?.slice(1);
      self.search(tag, true);
      modal.open();
    });
  };

  style = async () => `

    .ui-content a {
      &.tag {
        background: var(--card-background-color);
        color: var(--secondary);
        font-size: 0.7rem;
        padding: 5px;
        border-radius: var(--border-radius);
        text-decoration: none;

        &:hover {
          background: var(--primary);
          color: #fff;
        }
      }
    }

    [id="tags.modal"] {
      align-items: flex-start;

      ul.results {
        margin: 0;
        padding: 0;
      }
      
      article {
        margin: 0;
        padding: 1rem;
        width: -webkit-fill-available;

        &> ul.results {
          li {
            padding: 1rem;
            padding-block: 0.5rem;
            list-style: none;
            cursor: pointer;
            border-radius: var(--border-radius);
            border: var(--border-width) solid transparent;

            &.selected {
              border: var(--border-width) solid var(--primary);
              background: var(--card-background-color);
            }
            div.text {
              font-size: 0.8rem;
              color: hsl(var(--color-hsl) / .8);
              border-top: var(--border-width) solid var(--muted-border-color);
              margin-top: 0.4rem;
              padding-top: 0.4rem;
            }
          }
        }
      }

      .title {
        font-size: 1.2rem;
        font-weight: bold;
      }

      .url {
        font-size: 0.8rem;
        color: var(--muted-color);
      }

      .help {
        padding: var(--spacing);

        ul {
          grid-template-columns: repeat(3, auto);
          grid-column-gap: 1rem;
          justify-content: center;
          li {
            list-style: none;
            padding: 0;
            padding-right: 10px;
            margin-bottom: 0;

            &:first-child {
              border-top-color: transparent;
            }
          }
        }
        span {
          font-size: 0.8rem;
        }
        kbd {
          font-size: 0.8rem;
          margin-right: 2px;
        }
      }
    }


    @media (max-width: 575px) {
      [id="tags.modal"] {
        padding: 0;
        article {
          padding: 0;
          border-radius: 0;
          max-height: 100vh;
          height: 100%;
          padding: 0;

          &> ul.results {
            margin: 0;
            margin-top: 66px;

            li {
              --border-radius: 0;
              margin-bottom: 0;
              padding: 1.3rem 1rem;
              &.selected {
                border-left-color: transparent;
                border-right-color: transparent;
              }
              &:first-child {
                border-top: transparent;
              }
            }
          }
        }
      }
    }

    /* TAG CLOUD */

    ul.cloud {
      list-style: none;
      padding-left: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      line-height: 2.7rem;
      width: auto;
      margin: auto;
      padding-block: 2rem;

      li {
        list-style: none;
      }
      
      a {
        /*   
        Not supported by any browser at the moment :(
        --size: attr(data-weight number); 
        */
        --size: 4;
        --color: var(--contrast);
        color: var(--color);
        font-size: calc(var(--size) * 0.25rem + 0.5rem);
        display: block;
        padding: 0.125rem 0.25rem;
        position: relative;
        text-decoration: none;
        /* 
        For different tones of a single color
        opacity: calc((15 - (9 - var(--size))) / 15); 
        */
      }

      a[data-weight="1"] { --size: 1; }
      a[data-weight="2"] { --size: 2; }
      a[data-weight="3"] { --size: 3; }
      a[data-weight="4"] { --size: 4; }
      a[data-weight="5"] { --size: 6; }
      a[data-weight="6"] { --size: 8; }
      a[data-weight="7"] { --size: 10; }
      a[data-weight="8"] { --size: 13; }
      a[data-weight="9"] { --size: 16; }
    }
    
    
  
    ul[data-show-value] a::after {
      content: " (" attr(data-weight) ")";
      font-size: 1rem;
    }
    
    ul.cloud li:nth-child(2n+1) a { --color: var(--secondary); }
    ul.cloud li:nth-child(3n+1) a { --color: var(--primary); }
    // ul.cloud li:nth-child(4n+1) a { --color: var(--color); }
    
    ul.cloud a:focus {
      outline: 1px dashed;
    }
    
    ul.cloud a::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      width: 0;
      height: 100%;
      background: var(--color);
      transform: translate(-50%, 0);
      opacity: 0.15;
      transition: width 0.25s;
    }
    
    ul.cloud a:focus::before,
    ul.cloud a:hover::before {
      width: 100%;
    }
    
    @media (prefers-reduced-motion) {
      ul.cloud * {
        transition: none !important;
      }
    }

  `;
}
