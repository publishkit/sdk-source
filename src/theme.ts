export default class Theme {
  app: App;
  utils;
  theme: ObjectAny;

  constructor(app: App) {
    this.app = app;
    this.utils = app.utils;
  }

  log = (...args: any[]) =>
    window.pk.debug.includes("theme") && console.log(`theme ➔`, ...args);

  init = () => {
    const { cfg } = this.app;

    this.utils.dom.addStylesheet([
      "https://cdn.jsdelivr.net/npm/@picocss/pico@1.5.6/css/pico.min.css",
      `${window.pk.url}/pk.css`,
    ]);
  };

  mode = () =>
    this.utils.w.ls("theme.mode") || this.utils.w.isDark() || "light";

  switch = (theme: string | undefined) => {
    theme = theme || (this.mode() == "light" ? "dark" : "light");
    this.utils.w.ls("theme.mode", theme);
    $("html").attr("data-theme", theme);
  };
}
