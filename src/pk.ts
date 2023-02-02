import { decrypt } from "./utils/crypto";

export default class PK {
  pkrc: ObjectAny;

  url: string; // sdk file url base
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
    this.api = process.env.PK_API;
    this.debug = localStorage.getItem("pk.debug") || "";
    this.ready = false;
    this.error = "";
    this.help = `documentation @ https://publishkit.dev\n\n`;
  }

  setBase = (href: string) => {
    if (!href) return;
    const base = document.createElement("base");
    base.href = href;
    document.getElementsByTagName("head")[0].appendChild(base);
  };

  init = async () => {
    if (!(await this.uncrypt())) return;

    let pkrc = {};
    try {
      pkrc = JSON.parse(
        await (await fetch(`${this.base}pkrc.json?v=${Date.now()}`)).text()
      );
    } catch (e) {
      try {
        this.base = `/${window.location.pathname.split("/")[1]}/`;
        pkrc = JSON.parse(
          await (await fetch(`${this.base}pkrc.json?v=${Date.now()}`)).text()
        );
      } catch (e) {
        this.base = "/";
        pkrc = {};
      }
    }

    this.pkrc = window.pkrc = pkrc;
    this.setBase(this.base);

    this.url = (
      localStorage.getItem("pk.sdk") ||
      process.env.PK_SDK ||
      ""
    ).trim();
    this.version = (
      localStorage.getItem("pk.version") ||
      this.pkrc.pk?.version ||
      "latest"
    ).trim();
    this.local = (
      localStorage.getItem("pk.local") ||
      this.pkrc.pk?.local ||
      "pklocal"
    ).trim();

    let dirsValue = localStorage.getItem("pk.dirs") || this.pkrc.pk?.dirs;

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

    this.liscence();
  };

  uncrypt = async () => {
    return new Promise((solve) => {
      window.addEventListener("DOMContentLoaded", async (event) => {
        const tpl = document.querySelector("template#content");
        const value = tpl?.innerHTML?.trim() || "";
        if (!value?.startsWith("_crypted_")) return solve(true);
        const encrypted = value.slice(9);
        const tryPassword = async () => {
          try {
            const pwd = (await prompt("password")) || "";
            const decrypted = await decrypt(encrypted, pwd);
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
    try {
      if (this.localhost) return (this.ready = true);

      const siteID = this.pkrc.site?.id;
      if (!siteID)
        throw new Error(
          `💥 setting "site.id" missing. more at https://publishkit.dev`
        );
      const r = await (await fetch(`${this.api}/site?id=${siteID}`)).json();
      const sites = r.site.split("|").slice(0, 2).filter(Boolean);

      const hostname = window.location.hostname;
      if (!sites.includes(hostname))
        throw new Error(
          `💥 "${hostname}" is unregistered. more at https://publishkit.dev`
        );
      this.ready = true;
    } catch (e) {
      console.log(e);
      this.error = e.message;
      this.ready = true;
    }
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
