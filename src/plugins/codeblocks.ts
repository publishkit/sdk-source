import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  bind = async () => {
    const { utils, options } = this;
    $("pre:has(code)").each(function () {
      const pre = $(this);
      const code = pre.find("> code");
      const items = [];

      if (options.lang)
        items.push(
          `<span>${this.classList.value.replace("language-", "")}</span>`
        );

      if (options.copy) {
        const copy = $(
          `<a data-tooltip="copy"><i class="bx bx-copy cursor"></i></a>`
        );
        copy.on("click", async function () {
          const text = code.text();
          const tooltip = copy.attr("data-tooltip");

          await utils.w.copyToClipboard(text);
          copy.attr("data-tooltip", "copied !");

          setTimeout(() => {
            // @ts-ignore
            copy.attr("data-tooltip", tooltip);
          }, 1000);
        });

        items.push(copy);
      }

      if (items.length) {
        const tools = $('<div class="tools">');
        items.map((t) => tools.append(t));
        pre.append(tools);
      }
    });
  };

  style = async () => {
    return `
    pre:has(code) {
        position: relative;
        color: var(--primary);
        overflow: unset;

        .tools {
            position: absolute;
            top: 0;
            right: 0;
            background: #00000070;
            font-size: 10px;
            padding: 0.3rem 1rem;
            display: grid;
            grid-auto-flow: column;
            grid-gap: 1rem;
            align-items: center;
            box-shadow: 3px -3px 3px #0000001f inset;
            border-top-right-radius: var(--border-radius);
            border-bottom-left-radius: var(--border-radius);

            i {
                font-size: 18px;
            }
        }
    }
  `;
  };
}
