import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    this.deps.push("https://cdn.jsdelivr.net/npm/yamljs@0.3.0/dist/yaml.min.js");
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
      <a href="#" class="close" onclick="return $modal.close()"></a>
      <select required>
        <option value="frontmatter" selected>frontmatter</option>
        <option value="pkrc">pkrc</option>
        <option value="config">config</option>
      </select>
      <pre class="m-0"><code class="language-yaml">${options.data.frontmatter}</code></pre>
    `;

    ui.addModal("modal", modal);

    ui.addAction("run", {
      text: "show frontmatter",
      icon: "bxl-markdown",
      fn: () => ui.get("modal").open(),
    });
  };

  bind = async () => {
    const { options, ui } = this;
    const action = ui.get("run");
    const modal = ui.get("modal");
    const select = modal.el.find("select");
    const code = modal.el.find("code");

    if(action.fn) $(`[id="${action.id}"]`).on("click", (e) => {
      e.preventDefault();
      action.fn();
    });

    select.on("change", function () {
      code.html(options.data[this.value]);
      window.$theme?.highlightCode(code[0])
    });
  };
}
