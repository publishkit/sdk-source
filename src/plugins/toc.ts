import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  init = async () => {
    const { utils, ui } = this;
    const content = ui.base.get("content");
    const dom = $("<div/>").html(content);
    const headings = dom.find("h1, h2, h3");

    if (headings.length <= 1) return;

    headings.each(function () {
      if($(this).attr("class")?.includes("noprocess")) return
      this.id = "heading-" + utils.s.slugify($(this).text());
    });

    ui.base.set("content", dom.html());
    return true;
  };

  render = async () => {
    const { ui } = this;
    ui.addElement("right", "main", "<ul></ul>");
  };

  bind = async () => {
    const { ui, options } = this;

    const toc = this.ui.getElement("right", "main").el.find("ul");
    const headings = $('[id^="heading-"]');
    const lastHeading = headings.last();

    if(options.title) $(`<div class="mb-2"><small>${options.title}</small></div>`).insertBefore(
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

  style = async () => `
    [id="right.toc.main"] ul {
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
        background: var(--card-background-color);
      }
      .is-visible ~ .is-visible {
        border-left: 2px solid var(--muted-border-color);
        background: transparent;
      }
    }
  `;
}
