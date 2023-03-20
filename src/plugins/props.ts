import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  _prefixes: string[];

  _syntax = (str: string) => {
    str = str
      .replace(/^return /gi, "")
      .replace(/~([a-z-\.-_]+)/gi, "$props.options.$1")
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
      set: function (target, key: string, value) {
        const old = utils.o.get(target, key);
        utils.o.put(target, key, value);
        $ee.emit(`props:${key}`, { value, old });
        return true;
      },
    });
  }

  get = (key: string) => {
    return this.options[key];
  };

  set = (key: string, value: any) => {
    return (this.options[key] = value);
  };

  deSugar = (str: string) => {
    if (!str) return { props: [] };
    const props: string[] = [];
    const sugar = str
      .replace(/^return /, "")
      .replace(/~([a-z_.]+[:]?)/gi, function (match) {
        const colon = match[match.length - 1] == ":" ? "." : "";
        const prop = colon ? match.slice(1, -1) : match.slice(1);
        props.push(prop);
        return `$props.options.${prop}`;
      });
    const fn = new Function(`return ${sugar}`);
    return { fn, sugar, props };
  };

  bind = async () => {
    const { _prefixes, log, error, deSugar } = this;
    const { $ee, $, $props } = window;

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
            // @ts-ignore
            const newValue = fn() + ""; // cast to string
            if (oldValue != newValue) {
              $(this).html(newValue);
              // log(prop, oldValue, "=>", newValue);
            }
          });
        });

        // log(code, props);
        // @ts-ignore
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
          // @ts-ignore
          const condition = fn();
          if (condition) el.removeClass("d-none");
          else el.addClass("d-none");
        });
      });

      // @ts-ignore
      const condition = fn();
      if (condition) el.removeClass("d-none");
      else el.addClass("d-none");
    });

    // input text data-bind
    $("input[data-bind]").each(function () {
      try {
        const el = $(this);
        const debounce = parseInt(el.attr("data-debounce") || 10);
        const bindVariable = el.attr("data-bind");
        const { fn, props } = deSugar(bindVariable);

        el.on(
          "input",
          $.debounce(debounce, () => {
            $props.set(props[0], el.val());
          })
        );

        props.map((prop) => {
          $ee.on(`props:${prop}`, ({ value, old }) => {
            if (value == old) return;
            el.val(value);
          });
        });

        // @ts-ignore
        const value = fn();
        el.val(value);
      } catch (e) {
        console.log("errrr", e);
      }
    });
  };
}
