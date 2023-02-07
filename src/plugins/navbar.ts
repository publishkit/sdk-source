import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  init = async () => {
    if(this.app.cfg("navbar") === false) return false
    // TODO add json parse inside getdata fn
    const data = (await this.utils.w.getData(`navbar.json`, {
      json: true,
      nocache: true,
    })) as ObjectAny;
    const { nested, items } = data;
    return items.length ? { nested, items } : false;
  };

  render = async () => {
    const { ui, utils } = this;

    const element = utils.s.handlebar(
      `<nav>
        {{#if nested}}
          {{#each items}} 
          <details {{#if isOpen}}open="true"{{/if}}>
            <summary>{{this.label}}</summary>
            <ul>
            {{#each items}} 
              <li class="d-flex align-items-center">
                {{#if this.[1]}}
                <i class='bx {{this.[1]}} me-2'></i>
                {{else}}
                <i class='bx bx-chevron-right me-2'></i>
                {{/if}}
                {{{this.[0]}}}
              </li>
            {{/each}}
            </ul>
          </details>
          {{/each}}
        {{else}}
          <ul>
          {{#each items}} 
            <li class="d-flex align-items-center">
            {{#if this.[1]}}
            <i class='bx {{this.[1]}} me-2'></i>
            {{else}}
            <i class='bx bx-chevron-right me-2'></i>
            {{/if}}
            {{{this.[0]}}}
            </li>
          {{/each}}
          </ul>
        {{/if}}
      </nav>`,
      this.options._init
    );

    ui.addElement("left", "main", element);
    ui.addHeaderIcon("icon", {
      icon: "bx-menu",
      className: "ham",
    });
  };

  activeLinks = () => {
    // set aria-current if url match nav links
    const path = window.location.pathname.replace(window.$kit.base, "");

    if (path == "/") $('a[href="/index"]').attr("aria-current", "");
    else
      $(
        'a[href="' +
          path +
          '"], a[href="' +
          path +
          'index"], a[href="' +
          path +
          '.html"], a[href="' +
          path +
          'index.html"]'
      ).attr("aria-current", "");
  };

  bind = async () => {
    const self = this;
    const icon = this.ui.getHeaderIcon("icon");
    const nav = this.ui.getElement("left", "main").el.find("nav");

    this.activeLinks();

    // bind nav menu icon
    icon.el.on("click", function (e) {
      e.preventDefault();
      self.toggle();
    });

    // theme
    nav.find("a").addClass("secondary");

    window.documentOnClick.push((event: JQuery.ClickEvent) => {
      if (!$('[id="left.navbar.main"] nav.open')[0]) return;
      const target: any = event.target;

      // close menu if open
      const isIcon = target.id == "header.icons.navbar.icon";
      const isNav = $(target).parents('[id="left.navbar.main"]').length;
      if (!(isIcon || isNav)) self.toggle();
    });
  };

  toggle = () => {
    const icon = this.ui.getHeaderIcon("icon").el;
    const nav = this.ui.getElement("left", "main").el.find("nav");
    icon.toggleClass("open");
    nav.toggleClass("open");
  };

  style = async () => `
    [id="left.navbar.main"] nav {
      display: none;
      user-select: none;
      width: 100%;
      
      &.open {
        display: grid;
        grid-template-columns: auto auto;
        justify-content: space-around;
        user-select: none;
        width: 100%;
        position: fixed;
        top: 4.2rem;
        left: 0;
        display: grid;
        grid-column-gap: 10px;
        grid-row-gap: 3rem;
        grid-template-columns: 1fr 1fr;
        justify-content: left;
        font-size: 1rem;
        background: var(--bg);
        border-bottom: 2px solid var(--muted-color);
        border-top: 2px solid var(--muted-color);

        details {
          margin-bottom: 0;
          padding-bottom: 0;
        }
      }

      ul {
        --color: var(--primary);
      }
      
      a:focus {
        background-color: transparent;
        color: var(--primary-hover);
      }
      a[aria-current], a[aria-current]:hover {
        color: var(--primary);
        font-weight: bold;
      }

      details {
        border-bottom: none;
        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        summary {
          color: var(--h1-color);
          font-weight: 300;
          text-transform: uppercase;

          &:after {
            display: none;
          }
        }
      }
      details[open] summary {
        padding-bottom: 0.5rem;
      }
      
      li, summary {
        padding-top: 0;
        padding-bottom: 0;
        
      }
      li {
        padding-bottom: 10px;
      }
      &> ul li:last-child {
        padding-bottom: 00px;
      }
    }

    [id="header.icons.navbar.icon"] {
      // font-size: 2em !important;
    }

    @media (min-width: 576px) {
      [id="left.navbar.main"] nav {
        &.open {
          padding: 50px;
          grid-template-columns: 1fr 1fr 1fr;
        }
      }
    }
    
    @media (min-width: 768px) {
      [id="left.navbar.main"] nav {
        display: block;
        border: none;
        font-size: 0.8rem;

      }
      #header li:has([id="header.icons.navbar.icon"]) {
        display: none;
      }
    }

    @media (min-width: 991px) {
      [id="left.navbar.main"] nav {
        &.open {
          grid-template-columns: 1fr 1fr 1fr 1fr;
        }
      }
    }
  `;
}
