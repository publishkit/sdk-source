import { asArray } from "./array";

export const loadScript = async (path: string | string[], isAsync = true) =>
  Promise.all(
    asArray(path).map(
      (path) =>
        new Promise((success, error) => {
          $.ajax({
            async: isAsync,
            url: path,
            dataType: "script",
            success,
            error,
          });
        })
    )
  );

export const addScript = async (
  path: string | string[],
  props?: ObjectAny,
  target?: HTMLElement
) =>
  Promise.all(
    asArray(path).map(
      (path) =>
        new Promise((success: Function, error) => {
          target = target || document.head;
          const tag = scriptEl(path, props);
          target.append(tag);
          success()
        })
    )
  );

export const addStylesheet = async (
  path: string | string[],
  props?: ObjectAny,
  target?: HTMLElement
) =>
  Promise.all(
    asArray(path).map(
      (path) =>
        new Promise((success: Function, error) => {
          target = target || document.head;
          const tag = cssEl(path, props);
          target.append(tag);
          success()
        })
    )
  );

export const scriptEl = (src: string, props?: ObjectAny) => {
  src = src.trim();
  const s = document.createElement("script");
  s.type = "text/javascript";
  // @ts-ignore
  s.crossorigin = "anonymous";
  if (src.startsWith("http") || src.startsWith("//")) s.src = src;
  else s.innerHTML = src;
  if (props) Object.keys(props).map((k) => s.setAttribute(k, props[k]));
  return s;
};

export const cssEl = (href: string, props?: ObjectAny) => {
  const s = document.createElement("link");
  s.rel = "stylesheet";
  // @ts-ignore
  s.crossorigin = "anonymous";
  s.href = href;
  if (props) Object.keys(props).map((k) => s.setAttribute(k, props[k]));
  return s;
};

export const titleEl = (title: string) => {
  const s = document.createElement("title");
  s.innerHTML = title;
  return s;
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
