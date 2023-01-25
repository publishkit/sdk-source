import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);

    this.deps = () =>
      this.options.id
        ? [`https://www.googletagmanager.com/gtag/js?id=${this.options.id}`]
        : [];
  }

  bind = async () => {
    const { id } = this.options;
    if (!id) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    // @ts-ignore
    gtag("js", new Date());
    // @ts-ignore
    gtag("config", id);
  };
}

// G-MWGQ40965V
