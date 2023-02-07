import LoadJS from "../lib/loadjs";
import { serie } from "./array";

export const load = async (paths: any, options?: any) => {
  paths = paths.push ? paths : [paths];
  paths = await serie(paths, (path: any) => {
    // @ts-ignore
    if (path.push) return LoadJS(...path);
    else if (path.trim) return LoadJS(path, options);
    else throw "load: invalid path";
  });
  return paths;
};

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
