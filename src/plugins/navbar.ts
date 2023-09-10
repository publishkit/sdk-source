import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  init = async () => {
    if (this.app.cfg("navbar") === false) return false;
    const data = (await this.utils.w.getData(`navbar.json`, {
      json: true,
      nocache: true,
    })) as ObjectAny;
    const { nested, items } = data;
    return items.length ? { nested, items } : false;
  };

  render = async () => {
    const { ui, utils, options } = this;
    const { _init } = options;

    const items = `{{#each items}} 
      <li class="d-flex align-items-center">
        {{#if this.[1]}}
        <i class='bx {{this.[1]}} me-2'></i>
        {{else}}
        <i class='bx bx-chevron-right me-2'></i>
        {{/if}}
        {{{this.[0]}}}
      </li>
    {{/each}}`;

    const element = utils.s.handlebar(
      `<nav>
        ${
          _init.nested
            ? `
        {{#each items}} 
        <details {{#if isOpen}}open="true"{{/if}}>
          <summary>{{this.label}}</summary>
          <ul>${items}</ul>
        </details>
        {{/each}}
        `
            : `
        <ul>${items}</ul>
        `
        }
      </nav>`,
      this.options._init
    );

    const rightLeft = (options.ui || "").split(".")[1] || "left";

    ui.addElement("nav", options.ui || "left", element, { index: -10 });
    // @ts-ignore
    ui.addIcon("icon", `header.${rightLeft}`, {
      index: 1000,
      icon: `bx-menu-alt-${rightLeft}`,
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
    const icon = this.ui.get("icon");
    const nav = this.ui.get("nav").el;

    this.activeLinks();

    // bind nav menu icon
    icon.el.on("click", function (e) {
      e.preventDefault();
      self.toggle();
    });

    // theme
    nav.find("a").addClass("secondary");

    window.documentOnClick.push((event: JQuery.ClickEvent) => {
      if (!$('[id="navbar.nav"].open')[0]) return;
      const target: any = event.target;

      // close menu if open
      const isIcon = target.id == "navbar.icon";
      const isNav =
        $(target).parents('[id="navbar.nav"]').length ||
        target.id == "navbar.nav";
      if (!(isIcon || isNav)) self.toggle();
    });
  };

  toggle = () => {
    const icon = this.ui.get("icon").el;
    const nav = this.ui.get("nav").el;
    setTimeout(() => {
      icon.toggleClass("open");
      nav.toggleClass("open");
    }, 0);
  };

  style = async () => {
    const { options } = this;

    return ` 
    [id="navbar.nav"] {
      display: none;
      user-select: none;
      width: 100%;

      ul {
        --color: var(--primary);
        display: block;
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
          font-weight: bold;
          text-transform: uppercase;
          padding-block: 0.5rem;
          
          &:after {
            display: none;
          }
        }
      }
      
      li, summary {
        padding-top: 0;
        padding-bottom: 0;
      }
      
      ${
        !options.ui || options.ui == "left"
          ? `
      li {
        padding-block: 10px;
      }
      `
          : ""
      }

      ${
        options.ui == "header.right"
          ? `
      &> ul li:last-child {
        padding-right: var(--spacing);
      }
      `
          : ""
      }
    }

    [id="navbar.icon"] {
      &.open {
        color: var(--primary) !important;
      }
    }

    .ui-header-right {
      [id="navbar.nav"] ul {
        display: grid;
        grid-row-gap: 1rem;
        grid-auto-flow: column;
      }
    }

    .ui-right {
      [id="navbar.nav"] {
        padding: var(--spacing);
      }
    }

    @media (max-width: 767px) {
      [id="navbar.nav"] {
        &.open {
          display: grid;
          grid-template-columns: auto auto;
          justify-content: space-around;
          user-select: none;
          display: grid;
          grid-column-gap: 10px;
          grid-row-gap: 3rem;
          grid-template-columns: 1fr 1fr;
          justify-content: left;
          align-items: start;
          font-size: 1rem;
          background: var(--bg);
          border-bottom: 4px solid var(--muted-border-color);
          border-top: 4px solid var(--muted-border-color);
          padding: calc(var(--spacing) * 2);
    
          details {
            margin-bottom: 0;
            padding-bottom: 0;
          }
        }
      }

  
      .ui-header-right > [id="navbar.nav"] {
        position: fixed;
        left: 0;
        top: var(--header-height);
        width: 100%;
  
        ul {
          grid-auto-flow: row;
        }
      }
    }


    @media (max-width: 575px) {
      [id="navbar.nav"] {
        &.open {
          padding: var(--spacing);
          grid-template-columns: 1fr;
        }

        i {
          font-size: 1rem !important;
        }
      }
    }
    
    @media (min-width: 768px) {
      [id="navbar.nav"] {
        display: block;
        border: none;
        font-size: 0.8rem;
      }
      [id="navbar.icon"] {
        display: none;
      }
    }

    .layout-fluid {
      [id="navbar.nav"] {
        details {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        summary {
          display: none;
        }
        ul {
          font-weight: bold;
        }
      }
      
      @media (min-width: 768px) {
        [id="navbar.nav"] ul {
          display: flex;
        }
      }
    }
  `;
  };
}
