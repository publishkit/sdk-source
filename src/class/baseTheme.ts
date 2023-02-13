import BasePlugin from "./basePlugin";

export default class BaseTheme extends BasePlugin {
  deps: string[] = [];
  themeOptions: ThemeOptions = {};
  highlightCode?: (el: Element) => boolean;
  $var?: (pattern: string, value: string, cond?: any) => string;

  constructor(id: string, options?: ObjectAny, defaults?: ObjectAny) {
    super(id, options, defaults);
    this.parseOptions();
    this.setup();
    window.$ee.on("post:binds", () => this.postBinds());
  }

  mode = () =>
    this.utils.w.ls("theme.mode") || this.utils.w.isDark() || "light";

  switch = (mode: string | undefined) => {
    mode = mode || (this.mode() == "light" ? "dark" : "light");
    this.utils.w.ls("theme.mode", mode);
    $("html").attr("data-theme", mode);
  };

  spin = (yes: boolean) => {
    if (yes) $("#spinner").removeClass("d-none");
    else $("#spinner").addClass("d-none");
  };

  postBinds = () => {
    const { $theme } = window;
    const { themeOptions } = this;

    // init mode
    $theme.switch(this.mode());

    // set sipnner
    $("body").append('<progress id="spinner"></progress>'); // add spinner
    (document.getElementsByTagName("progress")[0] as any).indeterminate = true; // spin
    setTimeout(() => $theme.spin(false), 600);

    // init highlight
    if (themeOptions.highlight) {
      this.highlightCode = window.hljs.highlightElement;

      window.hljs.configure({
        ignoreUnescapedHTML: true,
      });

      setTimeout(() => {
        document.querySelectorAll("pre code").forEach((el) => {
          window.hljs.highlightElement(el);
        });
      }, 50);
    }
  };

  parseOptions = async () => {
    const { $kitrc } = window;
    const { options, utils } = this;
    const parsed: Partial<ThemeOptions> = {};

    const parseCdnfonts = (name: string) =>
      name?.trim().replaceAll(" ", "-").toLowerCase() || "";

    const parseHighlightjs = (name: string) =>
      name?.trim().replaceAll(" / ", "/").replaceAll(" ", "-").toLowerCase() ||
      "";

    // fonts
    parsed.headings = {};
    parsed.font = parseCdnfonts(options.font);
    parsed.headings.font = parseCdnfonts(options.headings?.font) || parsed.font;

    // highlight
    parsed.highlight = parseHighlightjs(options.highlight);

    // merge other options in themeOptions
    this.themeOptions = <ThemeOptions>(
      utils.o.merge({}, $kitrc.theme, options, parsed)
    );
    return this.themeOptions;
  };

  setup = async () => {
    const { $kit } = window;
    const { utils, modes, themeOptions: opt, options } = this;

    modes.init();

    const $var = (this.$var = (
      pattern: string,
      value: string = "",
      cond?: any
    ) => {
      return cond ? pattern.replace("%s", value) : "";
    });

    const load = (dep: string, options?: ObjectAny) =>
      this.deps.push([dep, options] as any);

    // load base css
    load("https://cdn.jsdelivr.net/npm/@picocss/pico@1.5.6/css/pico.min.css");
    load(`${$kit.url}/kit.css`);

    // fonts
    if (opt.font)
      load(`https://fonts.cdnfonts.com/css/${opt.font}`, {
        type: "css",
      });

    if (opt.headings?.font && opt.headings?.font != opt.font)
      load(`https://fonts.cdnfonts.com/css/${opt.headings.font}`, {
        type: "css",
      });

    // highlight
    if (opt.highlight) {
      const highlighRepo =
        "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/";
      load(`${highlighRepo}/highlight.min.js`);
      load(`${highlighRepo}/styles/${opt.highlight}.min.css`);
    }

    const bg = utils.w.colorToHsl(opt.bg);
    const color = utils.w.colorToHsl(opt.color);
    const primary = utils.w.colorToHsl(opt.primary);
    const secondary = utils.w.colorToHsl(opt.secondary);
    const hexicon = primary.hex.replace("#", "%23");

    // @ts-ignore
    modes.css(
      "all",
      `
      ${$var("--color-hue: %s;", color.h, opt.color)}
      ${$var("--color-sat: %s%;", color.s, opt.color)}
      ${$var("--color-lig: %s%;", color.l, opt.color)}
      ${$var("--bg-hue: %s;", bg.h, opt.bg)}
      ${$var("--bg-sat: %s%;", bg.s, opt.bg)}
      ${$var("--bg-lig: %s%;", bg.l, opt.bg)}
      ${$var("--primary-hue: %s;", primary.h, opt.primary)}
      ${$var("--primary-sat: %s%;", primary.s, opt.primary)}
      ${$var("--primary-lig: %s%;", primary.l, opt.primary)}
      ${$var("--secondary-hue: %s;", secondary.h, opt.secondary)}
      ${$var("--secondary-sat: %s%;", secondary.s, opt.secondary)}
      ${$var("--secondary-lig: %s%;", secondary.l, opt.secondary)}
      ${$var("--headings-color: %s;", opt.headings?.color, opt.headings?.color)}
      
      ${$var("--font-family: %s, sans-serif;", options.font, true)}
      ${$var(
        "--headings-font-family: %s, sans-serif;",
        options.headings?.font || options.font,
        true
      )}
      ${$var("--highlight-background-color: var(--bg);", opt.highlight, true)}

      --icon-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      --icon-date: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
      --icon-search: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
      --icon-time: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
      --icon-close: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${hexicon}' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E");
    `
    );
  };

  modes = {
    cache: {},
    init: () => {
      this.modes.create("all", {
        selector:
          ":root[data-theme=dark], :root:not([data-theme=dark]), [data-theme=dark], [data-theme=light]",
      });
      this.modes.create("light", {
        selector: ":root:not([data-theme=dark]), [data-theme=light]",
      });
      this.modes.create("dark", {
        selector: ":root[data-theme=dark]",
      });
    },
    create: (key: ThemeModeName, mode: ObjectAny) => {
      mode.tokens = [];
      // @ts-ignore
      this.modes.cache[key] = mode;
    },
    css: (mode: ThemeModeName, token: string) => {
      // @ts-ignore
      this.modes.cache[mode].tokens.push(token);
    },
    render: (): string => {
      const result = [];
      for (const [key, mode] of Object.entries(this.modes.cache)) {
        const { selector, tokens } = <ThemeMode>mode;
        tokens.length && result.push(`${selector} { ${tokens.join("\n")} }`);
      }
      return result.join("\n");
    },
  };
}
