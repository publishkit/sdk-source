import { decrypt } from "../utils/crypto";

export default class Kit {
  kitrc: ObjectAny;
  url: string; // kit repo
  localhost: boolean;
  base: string;
  version: string;
  local: string;
  dirs: Boolean;
  api;
  debug;
  ready: Boolean;
  error: string;
  help: string;

  constructor() {
    this.localhost =
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.hostname.startsWith("192.168");
    this.base = "/";
    this.api = process.env.KIT_API;
    this.debug = localStorage.getItem("kit.debug") || "";
    this.ready = false;
    this.error = "";
    this.help = `visit @ https://publishkit.dev\n\n`;
  }

  ls = (key: string, value?: string) => {
    if (localStorage == null)
      return console.log("Local storage not supported!");
    else {
      try {
        let result: string | void | null = "";
        if (typeof value != "undefined") {
          localStorage.setItem(key, value);
          result = value;
        } else {
          result =
            value === null
              ? localStorage.removeItem(key)
              : localStorage.getItem(key);
        }
        return result ? result.replace(/(\r\n|\n|\r)/gm, "") : result;
      } catch (err) {
        const private_browsing_error =
          "Unable to store local data. Are you using Private Browsing?";
        console.log(
          /QUOTA_EXCEEDED_ERR/.test(err) ? private_browsing_error : err
        );
      }
    }
  };

  log = (key: string, ...args: any[]) => {
    if (!this.debug) return;
    const cond =
      ["pk", "*", key, `$${key}`].includes(window.kit.debug) ||
      ["pk", "*"].includes(key);
    cond && console.log(`pk ➔`, ...args);
  };

  setBase = (href: string) => {
    if (!href) return;
    const base = document.createElement("base");
    base.href = href;
    document.getElementsByTagName("head")[0].appendChild(base);
  };

  init = async () => {
    if (!(await this.uncrypt())) return;

    let kitrc = {};
    try {
      kitrc = JSON.parse(
        await (await fetch(`${this.base}kitrc.json?v=${Date.now()}`)).text()
      );
    } catch (e) {
      try {
        this.base = `/${window.location.pathname.split("/")[1]}/`;
        kitrc = JSON.parse(
          await (await fetch(`${this.base}kitrc.json?v=${Date.now()}`)).text()
        );
      } catch (e) {
        this.base = "/";
        kitrc = {};
      }
    }

    this.kitrc = window.kitrc = kitrc;
    this.setBase(this.base);

    this.url = (
      localStorage.getItem("kit.url") ||
      process.env.KIT_URL ||
      ""
    ).trim();
    this.version = (
      localStorage.getItem("kit.version") ||
      this.kitrc.kit?.version ||
      "latest"
    ).trim();
    this.local = (
      localStorage.getItem("kit.local") ||
      this.kitrc.kit?.local ||
      "kit_local"
    ).trim();

    let dirsValue = localStorage.getItem("kit.dirs") || this.kitrc.kit?.dirs;

    if (typeof dirsValue == "undefined" || typeof dirsValue == "object")
      dirsValue = false;
    if (typeof dirsValue == "string") {
      dirsValue = dirsValue.trim();
      if (dirsValue == "false") dirsValue = false;
      if (dirsValue == "true") dirsValue = true;
    }
    this.dirs = dirsValue;

    if (this.version != "latest")
      this.url = this.url.replace("@latest", `@${this.version}`);

    this.log("*", `debug:`, this.debug);

    this.liscence();
  };

  uncrypt = async () => {
    const { ls } = this;
    return new Promise((solve) => {
      window.addEventListener("DOMContentLoaded", async (event) => {
        const tpl = document.querySelector("template#content");
        const value = tpl?.innerHTML?.trim() || "";
        if (!value?.startsWith("_crypted_")) return solve(true);
        const encrypted = value.slice(9);
        const tryPassword = async () => {
          try {
            const pwd = ls("user.pwd") || (await prompt("password")) || "";
            const decrypted = await decrypt(encrypted, pwd);
            ls("user.pwd", pwd);
            // @ts-ignore
            tpl.innerHTML = decrypted;
            return solve(true);
          } catch (e) {
            document.body.innerHTML = "invalid password !";
            return solve(false);
          }
        };
        await tryPassword();
      });
    });
  };

  liscence = async () => {
    // 3 august 2023 - going open source
    this.ready = true;
    return true;
    // try {
    //   if (this.localhost) return (this.ready = true);

    //   const kitID = this.kitrc.site?.id;
    //   if (!kitID)
    //     throw new Error(
    //       `💥 setting "site.id" missing. more at https://publishkit.dev`
    //     );
    //   const kit = await (await fetch(`${this.api}/site?id=${kitID}`)).json();
    //   kit.hostname = new URL(kit.url).hostname;
    //   const hostname = window.location.hostname;
    //   if (hostname != kit.hostname)
    //     throw new Error(
    //       `💥 "${hostname}" is unregistered. more at https://publishkit.dev`
    //     );
    //   this.ready = true;
    // } catch (e) {
    //   console.log(e);
    //   this.error = e.message;
    //   this.ready = true;
    // }
  };

  unregistered = () => {
    const content = document.getElementById("content");
    const errorDiv = document.createElement("div");
    const div = document.createElement("div");
    errorDiv.innerHTML = this.error;
    errorDiv.style.background = "#131226";
    errorDiv.style.color = "#fff";
    errorDiv.style.padding = "10px";
    div.innerHTML = content?.innerHTML || "";
    div.style.opacity = "0.2";
    document.body.appendChild(errorDiv);
    document.body.appendChild(div);
  };
}
