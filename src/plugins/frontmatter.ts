import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    this.deps = ["https://cdn.jsdelivr.net/npm/yamljs@0.3.0/dist/yaml.min.js"];
  }

  render = async () => {
    const { options, ui, app } = this;
    const { cache } = app;
    const yaml = (d: ObjectAny) => window.YAML.stringify(d, 2);

    options.data = {
      frontmatter: yaml(cache.frontmatter),
      pkrc: yaml(cache.pkrc),
      config: yaml(cache.config),
    };

    const modal = `
      <select required>
        <option value="frontmatter" selected>frontmatter</option>
        <option value="pkrc">pkrc</option>
        <option value="config">config</option>
      </select>
      <pre class="m-0"><code>${options.data.frontmatter}</code></pre>
    `;

    ui.addModal("main", modal);

    ui.addAction("main", {
      text: "show frontmatter",
      icon: "bxl-markdown",
      fn: () => ui.getModal("main").open(),
    });
  };

  bind = async () => {
    const { options, ui, app } = this;
    const action = ui.getAction("main");
    const modal = ui.getModal("main");
    const select = modal.el.find("select");
    const code = modal.el.find("code");
    const highlight = <HighlightPlugin>app.plugins.get("highlight");

    $(`[id="${action.id}"]`).on("click", (e) => {
      e.preventDefault();
      action.fn();
    });

    select.on("change", function () {
      code.html(options.data[this.value]);
      highlight && highlight.apply(code[0]);
    });
  };
}
