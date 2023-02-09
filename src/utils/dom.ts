import LoadJS from "../lib/loadjs";
import { serie } from "./array";

export const load = async (paths: any, options?: any) => {
  paths = paths.push ? paths : [paths];

  let success: string[] = [];
  let failed: string[] = [];

  await serie(paths, async (path: any) => {
    try {
      if (path.push) await LoadJS(...path);
      else if (path.trim) await LoadJS(path, options);
      else throw "load: invalid path";
      path.push ? path.map((p: string) => success.push(p)) : success.push(path);
    } catch (e) {
      path.push ? path.map((p: string) => failed.push(p)) : failed.push(path);
    }
  });

  failed = failed.reduce((acc, v) => {
    if (typeof v == "string") acc.push(v);
    return acc;
  }, []);

  success = success.reduce((acc, v) => {
    if (typeof v == "string") acc.push(v);
    return acc;
  }, []);

  return { success, failed };
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
