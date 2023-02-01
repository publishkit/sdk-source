import { asArray } from "./array";
import LoadJS from "../lib/loadjs"

export const load = LoadJS

export const waitForEl = (selector: string) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const cssvar = (key: string, value: any) =>
  // @ts-ignore
  document.querySelector(":root")?.style.setProperty(key, value);
// same as document.documentElement.style.setProperty(key, value);

export const reloadStylesheets = () => {
  var links = document.getElementsByTagName("link");
  for (var cl in links) {
    var link = links[cl];
    if (link.rel === "stylesheet") link.href += "";
  }
};

// rename every props on documents
// renameProp('data-target', 'onclick')
export const renameProp = (from: string, to: string) =>
  $("[" + from + "]").each(function () {
    const el = $(this);
    el.attr({ [to]: el.attr(from) }).removeAttr(from);
  });
