import { App } from "src/def/app";
import BasePlugin from "./basePlugin";

export default class Plugin extends BasePlugin {
  constructor(app: App, options?: ObjectAny) {
    super(app, options);
    this.id = "navbar";
  }

  init = async () => {
    const html = await this.utils.w.getData("/navbar");
    const { nested, items } = this.utils.a.fromUl(html);
    return items.length ? { nested, items } : false;
  };

  ui = async (options: ObjectAny) => {
    const { ui } = this.app;
    const string = this.utils.s.handlebar(
      `<nav id="navbar" class="">
        {{#if nested}}
            {{#each items}} 
            <details {{#if isOpen}}open="true"{{/if}}>
                <summary>{{this.label}}</summary>
                <ul>
                {{#each items}} 
                    <li class="d-flex align-items-center">
                        {{#if this.[1]}}
                        <i class='bx bx-{{this.[1]}} me-2'></i>
                        {{else}}
                        <i class='bx bx-chevron-right me-2'></i>
                        {{/if}}
                        {{{this.[0]}}}
                    </li>
                {{/each}}
                </ul>
            </details>
            {{/each}}
        {{else}}
            <ul>
            {{#each items}} 
                <li class="d-flex align-items-center">
                {{#if this.[1]}}
                <i class='bx bx-{{this.[1]}} me-2'></i>
                {{else}}
                <i class='bx bx-chevron-right me-2'></i>
                {{/if}}
                {{{this.[0]}}}
                </li>
            {{/each}}
            </ul>
        {{/if}}
    </nav>`,
      this.options._init
    );

    const icon = `<i id="navbar-icon" class="bx bx-menu bx-sm ham"></i>`;

    ui.set("navbar", string);
    ui.set("navbar-icon", icon);

    ui.push("left", ui.get("navbar"));
    ui.push("header-icons", ui.get("navbar-icon"));
  };

  code = async (options: ObjectAny) => {
    const self = this;

    // set aria-current if url match nav links
    if (window.location.pathname == "/")
      $('a[href="/index"]').attr("aria-current", "");
    else
      $(
        'a[href="' +
          window.location.pathname +
          '"], a[href="' +
          window.location.pathname +
          '/index"], a[href="' +
          window.location.pathname +
          '.html"], a[href="' +
          window.location.pathname +
          '/index.html"]'
      ).attr("aria-current", "");

    // bind nav menu icon
    $("#navbar-icon").click(function (e) {
      e.preventDefault();
      self.toggle();
    });

    // theme
    $("#navbar li a").addClass("secondary");
  };

  toggle = async () => {
    $("#navbar-icon").toggleClass("open");
    $("#navbar").toggleClass("open");
  };
}
