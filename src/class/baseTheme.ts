import BasePlugin from "./basePlugin";

export default class BaseTheme extends BasePlugin {
  setupDeps: string[] = [];
  setupOptions: SetupOptions = {};
  highlightCode?: (el: Element) => boolean;
  $var?: (pattern: string, value: string, cond?: any) => string;

  constructor(id: string, options?: ObjectAny) {
    super(id, options);
  }

  postSetup = () => {
    const setup = this.setupOptions;

    $("html").attr("data-theme", this.mode()); // set mode

    if (setup.highlight) {
      // to timeout or not to timeout, that is the question
      this.highlightCode = (el: Element) =>
        setTimeout(() => window.hljs.highlightElement(el), 50) && true;
      // this.highlightCode = window.hljs.highlightElement

      window.hljs.configure({
        ignoreUnescapedHTML: true,
      });

      document.querySelectorAll("pre code").forEach((el) => {
        window.hljs.highlightElement(el);
      });
    }
  };

  setup = async () => {
    const { options, utils, theme } = this;
    const setup: SetupOptions = {};

    const $var = (this.$var = (pattern: string, value: string, cond?: any) => {
      return cond ? pattern.replace("%s", value) : "";
    });

    const load = (dep: string, options?: ObjectAny) =>
      this.setupDeps.push([dep, options] as any);

    // load base css
    load("https://cdn.jsdelivr.net/npm/@picocss/pico@1.5.6/css/pico.min.css");
    load(`${window.pk.url}/pk.css`);

    // load fonts
    setup.font = options.font?.trim().replaceAll(" ", "-").toLowerCase();
    if (setup.font)
      load(`https://fonts.cdnfonts.com/css/${setup.font}`, { type: "css" });

    setup.headings = {};
    setup.headings.font = options.headings?.font
      ?.trim()
      .replaceAll(" ", "-")
      .toLowerCase();
    if (setup.headings.font && setup.headings.font != setup.font)
      load(`https://fonts.cdnfonts.com/css/${setup.headings.font}`, {
        type: "css",
      });

    // highlight
    setup.highlight = (options.highlight || "")
      ?.trim()
      .replaceAll(" / ", "/")
      .replaceAll(" ", "-")
      .toLowerCase();
    if (setup.highlight) {
      const highlighRepo =
        "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/";
      load(`${highlighRepo}/highlight.min.js`);
      load(`${highlighRepo}/styles/${setup.highlight}.min.css`);
      //(options.highlight && `--highlight-background-color: var(--bg);`) ||
    }

    const primary = utils.w.colorToHsl(options.primary);
    const secondary = utils.w.colorToHsl(options.secondary);
    const hexicon = primary.hex.replace("#", "%23");

    theme.allMode(`
      ${$var("--font-family: %s, sans-serif;", options.font, true)}
      ${$var(
        "--headings-font-family: %s, sans-serif;",
        options.headings?.font || options.font,
        true
      )}
      ${$var("--primary-hue: %s;", primary.h, options.primary)}
      ${$var("--primary-sat: %s%;", primary.s, options.primary)}
      ${$var("--primary-lig: %s%;", primary.l, options.primary)}
      ${$var("--secondary-hue: %s;", secondary.h, options.secondary)}
      ${$var("--secondary-sat: %s%;", secondary.s, options.secondary)}
      ${$var("--secondary-lig: %s%;", secondary.l, options.secondary)}

      ${$var("--highlight-background-color: var(--bg);", options.highlight, true)}

      --icon-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      --icon-date: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
      --icon-search: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
      --icon-time: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
      --icon-close: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E");
    `);

    // load deps
    await Promise.all(
      this.setupDeps.map(([dep, options]) => utils.dom.load(dep, options))
    );

    this.setupOptions = setup;
    this.postSetup();
    return setup;
  };

  theme = {
    cache: {
      all: [],
      light: [],
      dark: [],
    },
    allMode: (token: string) => this.theme.add("all", token),
    lightMode: (token: string) => this.theme.add("light", token),
    darkMode: (token: string) => this.theme.add("dark", token),
    light: ":root:not([data-theme=dark]), [data-theme=light]",
    dark: ":root[data-theme=dark]",
    all: ":root[data-theme=dark], :root:not([data-theme=dark]), [data-theme=dark], [data-theme=light]",
    render: (): string => {
      const result = [];
      for (const [mode, tokens] of Object.entries(this.theme.cache)) {
        const alias = `${mode}Mode`;
        // @ts-ignore
        const method = this[alias];
        const token = method && method(this);
        // @ts-ignore
        if (token) tokens.push(token);

        // console.log('tokeexe', alias, token)
        // @ts-ignore
        const selector = this.theme[mode];
        tokens.length && result.push(`${selector} { ${tokens.join("\n")} }`);
      }
      const css = result.join("\n");
      return css;
    },
    add: (mode: ThemeMode, token: string) => {
      // @ts-ignore
      this.theme.cache[mode].push(token);
    },
  };

  mode = () =>
    this.utils.w.ls("theme.mode") || this.utils.w.isDark() || "light";

  switch = (theme: string | undefined) => {
    theme = theme || (this.mode() == "light" ? "dark" : "light");
    this.utils.w.ls("theme.mode", theme);
    $("html").attr("data-theme", theme);
  };
}
