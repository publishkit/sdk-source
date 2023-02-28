import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options, {
      image:
        "https://images.unsplash.com/photo-1539035104074-dee66086b5e3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjI0MX0&auto=format&fit=crop&w=2550&q=80",
      parallax: false,
    });
  }

  render = async () => {
    const element = `<div><img /></div>`;
    this.ui.addElement("wrapper", "body", element);
  };

  bind = async () => {
    const { options, ui } = this;
    if (!options.image || !options.parallax) return;

    const wrapper = ui.get("wrapper").el.get(0);

    $("body")
      .on("mousemove", function (e) {
        if (!wrapper) return;
        const d = wrapper.getBoundingClientRect();
        let x = e.clientX - (d.left + Math.floor(d.width / 2));
        let y = e.clientY - (d.top + Math.floor(d.height / 2));
        x = x - x * 2;
        y = y - y * 2;
        wrapper.style.setProperty("--bg-scale", "1.6");
        wrapper.style.setProperty("--bg-x", x / 2 + "px");
        wrapper.style.setProperty("--bg-y", y / 2 + "px");
      })
      .on("mouseleave", function (e) {
        if (!wrapper) return;
        wrapper.style.setProperty("--bg-scale", "1");
        wrapper.style.setProperty("--bg-x", "0");
        wrapper.style.setProperty("--bg-y", "0");
      });
  };

  style = async () => {
    if (!this.options.parallax)
      return `
        body {
            background: url("${this.options.image}") no-repeat center center fixed;
            background-size: cover;
        }
    `;

    return `[id="bg.wrapper"] {
        --bg-scale: 1.5;
        --bg-y: 0;
        overflow: hidden;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: -1;

        img {
            width: 100vw;
            height: 100vh;
            background: url("${this.options.image}") no-repeat center center fixed;
            background-size: cover;
            transform: translateX(var(--bg-x)) translateY(var(--bg-y)) scale(var(--bg-scale));
            transition: ease-out 0.7s;
        }
    }
  `;
  };
}
