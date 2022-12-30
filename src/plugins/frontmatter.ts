import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App) {
    super(app);
    this.id = "frontmatter";
    this.deps = ["https://cdn.jsdelivr.net/npm/yamljs@0.3.0/dist/yaml.min.js"];
  }

  ui = async () => {
    const { ui, cache } = this.app;
    const string = `<pre><code>${window.YAML.stringify(
      cache.frontmatter,
      2
    )}</code></pre>`;
    const string2 = `<pre><code>${window.YAML.stringify(
      cache.config,
      2
    )}</code></pre>`;

    ui.set("frontmatter", string);
    ui.push("center", ui.get("frontmatter"));
    ui.push("center", string2);
  };
}
