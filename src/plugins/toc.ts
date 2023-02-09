import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  render = async () => {
    const { ui } = this;
    ui.addElement("nav", "right", "<ul></ul>");
    ui.addIcon("icon", "top.right", {
      icon: "bx-book-content",
      fn: () => {},
    });
  };

  transform = async () => {
    const { $dom, $utils } = window;
    const headings = $dom.body.find("h1, h2, h3");

    if (headings.length <= 1) return;

    headings.each(function () {
      if ($(this).attr("class")?.includes("noprocess")) return;
      this.id = "heading-" + $utils.s.slugify($(this).text());
    });
  };

  bind = async () => {
    const self = this;
    const { ui, options } = this;

    const toc = ui.get("nav").el;
    const icon = ui.get("icon").el;
    const headings = $('[id^="heading-"]');
    const lastHeading = headings.last();

    icon.on("click", function (e) {
      e.preventDefault();
      self.toggle();
    });

    window.documentOnClick.push((event: JQuery.ClickEvent) => {
      if (!$('[id="toc.nav"].open')[0]) return;
      const target: any = event.target;

      // close menu if open
      const isIcon = target.id == "toc.icon";
      if (!isIcon) self.toggle();
    });

    if (options.title)
      $(`<div class="mb-2"><small>${options.title}</small></div>`).insertBefore(
        toc
      );

    const links = headings
      .map(function () {
        return `<li><a href="#${
          this.id
        }" class="secondary is-${this.tagName.toLowerCase()}">${$(this).text()}</a></li>`;
      })
      .toArray()
      .join("");

    const scrollTo = (el: string) => this.utils.w.scrollTo(el, 120, 600);

    toc.html(links).on("click", "a", function (e) {
      e.preventDefault();
      scrollTo(this.getAttribute("href"));
      window.location.hash = this.getAttribute("href");
      self.close();
    });

    // scrollspy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const isLast = lastHeading[0].id == id;
        const isVisible = entry.isIntersecting || isLast;
        const item = document.querySelector('a[href="#' + id + '"]');
        // @ts-ignore
        $(item).parent().toggleClass("is-visible", isVisible);
      });
    });
    headings.toArray().map((area) => {
      observer.observe(area);
    });

    // autoscroll to hash
    const hash = window.location.hash || "";
    if (hash.startsWith("#heading-"))
      setTimeout(() => {
        scrollTo(hash);
      }, 0);
  };

  close = () => {
    const icon = this.ui.get("icon").el;
    const nav = this.ui.get("nav").el;
    icon.removeClass("open");
    nav.removeClass("open");
  };

  toggle = () => {
    const icon = this.ui.get("icon").el;
    const nav = this.ui.get("nav").el;
    icon.toggleClass("open");
    nav.toggleClass("open");
  };

  style = async () => `
    [id="toc.nav"] {
      padding: 0;
      margin: 0;
      width: 100%;
      li {
        list-style: none;
        margin: 0;
        border-left: 2px solid var(--muted-border-color);
        a {
          font-size: 0.8rem;
          color: var(--secondary);
          display: block;
          padding: 0.3rem 0;
          text-decoration: none;
          margin-left: 10px;
          &:focus {
            background-color: transparent;
          }
          &.is-h2 {
            margin-left: 20px;
          }
          &.is-h3 {
            margin-left: 30px;
          }
        }
      }
      &> .is-visible {
        border-left: 2px solid var(--primary);
        background: var(--card-sectionning-background-color);
        a {
          color: var(--card-sectionning-color);
        }
      }
      .is-visible ~ .is-visible {
        border-left: 2px solid var(--muted-border-color);
        background: transparent;
        a {
          color: var(--secondary);
        }
      }
    }

    [id="toc.icon"] {
      display: none;
    }

    @media (max-width: 1199px){
      [id="toc.nav"] {
        &.open {
          position: fixed;
          top: calc(var(--header-height) + var(--top-height));
          padding: var(--spacing);
          background: var(--bg);
          bottom: 0;

          a {
            font-size: 1rem;
          }
        }
      }

      [id="toc.icon"] {
        display: block;
        &.open {
          color: var(--primary);
        }
      }
    }

    @media (min-width: 758px){
      [id="toc.nav"] {
        &.open {
          top: calc(var(--header-height));
          width: var(--container-md-width);
        }
      }
    }

    @media (min-width: 992px){
      [id="toc.nav"] {
        &.open {
          width: var(--container-lg-width);
        }
      }
    }
  `;
}
