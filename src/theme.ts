import { App } from "./def/app";

export default class Theme {
  app;
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

    this.utils.d.addStylesheet([
      "https://cdn.jsdelivr.net/npm/@picocss/pico@1.5.6/css/pico.min.css",
      `${window.pk.url}/pk.css`,
    ]);

    const theme = this.utils.w.urlParams.get('theme') || (typeof window.pkrc.theme == "string" && window.pkrc.theme)
    if (!theme || theme == "default") return;

    this.setTheme(theme)
    
  };
  
  setTheme = (name: string) => {
    const theme = this.utils.m.parseValue(name, 'css')
    if(!theme.url) return this.log('invalid', name)

    this.theme = theme
    this.utils.d.addStylesheet(theme.url, { name: "theme" });
    this.log(`🎨 ${theme.key}`, theme);
  }

  mode = () =>
    this.utils.w.ls("theme.mode") || this.utils.w.isDark() || "light";

  switch = (theme: string | undefined) => {
    theme = theme || (this.mode() == "light" ? "dark" : "light");
    this.utils.w.ls("theme.mode", theme);
    $("html").attr("data-theme", theme);
  };
}
