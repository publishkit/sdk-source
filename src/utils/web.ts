export const urlParams = new URLSearchParams(window.location.search);

export const isDark = () =>
  (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches) ||
  document.querySelectorAll('[data-theme="dark"]').length
    ? "dark"
    : "";

export const isLocalhost = () =>
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.hostname.startsWith("192.168");

export const isMac = () => navigator.platform.indexOf("Mac") > -1;

export const isWindows = () => navigator.platform.indexOf("Win") > -1;

export const scrollTo = (el: string, offset = 0, timeout: number) =>
  $("html, body").animate({ scrollTop: $(el).offset()!.top - offset }, timeout);

export const pageHeight = () => {
  const { body, documentElement } = document;
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    documentElement.clientHeight,
    documentElement.scrollHeight,
    documentElement.offsetHeight
  );
};

type getDataOptions = {
  nocache: Boolean;
  json: Boolean;
};

export const getData = async (
  path: string,
  options?: Partial<getDataOptions>
): Promise<string | ObjectAny | any[]> => {
  options = options || {};
  options.nocache = options.nocache || !!urlParams.get("nocache");
  // const base = path.includes("//") ? "" : window.pk.base;
  let url = `${path}`;
  // console.log("oooo", base, url)
  if (options.nocache) url += `?v=${Date.now()}`;
  const myRequest = new Request(url);
  const res = await fetch(myRequest);
  let text = res.ok ? await res.text() : "";
  if (options.json) text = JSON.parse(text);
  return text;
};

// local storage
export const ls = function (key: string, value?: string) {
  if (localStorage == null) return console.log("Local storage not supported!");
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

export const colorToHsl = (color: string): ObjectAny => {
  const hex = colorToHex(color);
  return hexToHsl(hex);
};

export const colorToHex = (color: string) => {
  const ctx =
    <ObjectAny>document.createElement("canvas").getContext("2d") || {};
  ctx.fillStyle = color;
  return ctx.fillStyle;
};

export const hexToHsl = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return {};

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h: any,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  s = s * 100;
  s = Math.round(s);
  l = l * 100;
  l = Math.round(l);
  h = Math.round(360 * h);

  const data = { h, l, s, hex };
  return data;
};
