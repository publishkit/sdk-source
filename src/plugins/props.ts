import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  _prefixes: string[];

  _syntax = (str: string) => {
    str = str
      .replace(/^return /gi, "")
      .replace(/~([a-z-\.-_]+)/gi, '$props.get("$1")')
      .replace(/\~/gi, "$props.get");
    return $("<textarea />").html(str).text(); // html decode
  };

  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
    const { utils, _syntax } = this;
    const { $ee } = window;

    this._prefixes = options._prefixes || ["~"];

    this.options = new Proxy(this.options, {
      get: function (target, key: string) {
        const value = utils.o.get(target, key);
        if (value?.trim && value.startsWith("(")) {
          return new Function(`return ${_syntax(value)}`)();
        } else {
          return value;
        }
      },
      set: function (target, key, value) {
        // @ts-ignore
        const old = target[key];
        // @ts-ignore
        target[key] = value;
        // @ts-ignore
        $ee.emit(`props:${key}`, { value, old });
        return true;
      },
    });
  }

  get = (key: string) => {
    return this.options[key];
  };

  set = (key: string, value: any) => {
    this.options[key] = value;
    return value;
  };

  deSugar = (str: string) => {
    if (!str) return { props: [] };
    const props: string[] = [];
    const sugar = str
      .replace(/^return /gi, "")
      .replace(/~([a-z_.]+[:]?)/gi, function (match) {
        const colon = match[match.length - 1] == ":" ? "." : "";
        const prop = colon ? match.slice(1, -1) : match.slice(1);
        props.push(prop);
        return `$props.options.${prop}${colon}`;
      });
    const fn = new Function(`return ${sugar}`);
    return { fn, sugar, props };

    // const getSugar = (str: string) => {
    //     str = str
    //       .replace(/~([a-z-\.-_]+)/gi, '$props.options.$1')
    //       .replace(/\~/gi, "$props.get");
    //     return $("<textarea />").html(str).text() // html decode
    //   };
  };

  bind = async () => {
    const { _prefixes, log, error, deSugar } = this;
    const { $ee, $ } = window;

    const bindings = $(":contains(~)").filter(function () {
      const onlyChild = $(this).children().length === 0;
      const regex = `^(${_prefixes.join("|")})[a-z_.]`;
      const isSugar = new RegExp(regex).test(this.innerHTML);
      const noProcess = this.classList.contains("noprocess");
      return !noProcess && onlyChild && isSugar;
    });

    bindings.each(function () {
      try {
        const code = $(this).html();
        const { fn, props } = deSugar(code);

        props.map((prop) => {
          $ee.on(`props:${prop}`, () => {
            const oldValue = $(this).html();
            const newValue = fn() + ""; // cast to string
            if (oldValue != newValue) {
              $(this).html(newValue);
              log(prop, oldValue, "=>", newValue);
            }
          });
        });

        // log(code, props);
        $(this).html(fn());
      } catch (e) {
        // @ts-ignore
        error(e, this);
      }
    });

    // tranform syntaxic sugar
    // ~foo.var => $props.options.foo.var
    $("[onclick]").each(function () {
      const el = $(this);
      const value = el.attr("onclick");
      const { sugar } = deSugar(value);
      if (value?.startsWith("~")) el.attr("onclick", sugar);
    });

    // show element on given condition
    $("[data-show]").each(function () {
      const el = $(this);
      const value = el.attr("data-show");
      const { fn, props } = deSugar(value);

      props.map((prop) => {
        $ee.on(`props:${prop}`, () => {
          const condition = fn();
          if (condition) el.removeClass("d-none");
          else el.addClass("d-none");
        });
      });

      const condition = fn();
      if (condition) el.removeClass("d-none");
      else el.addClass("d-none");
    });
  };
}
