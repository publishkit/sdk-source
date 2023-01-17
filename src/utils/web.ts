export const urlParams = new URLSearchParams(window.location.search);

export const isDark = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "";

export const isMac = () => navigator.platform.indexOf("Mac") > -1;

export const isWindows = () => navigator.platform.indexOf("Win") > -1;

export const scrollTo = (el: string, offset = 0, timeout: number) =>
  $("html, body").animate({ scrollTop: $(el).offset()!.top - offset }, timeout);

export const pageHeight = () => {
  const body = document.body,
    html = document.documentElement;
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
};

export const getData = async (path: string): Promise<string> => {
  const url = `${window.pk.base}${path}`
  const myRequest = new Request(url);
  const res = await fetch(myRequest);
  return res.ok ? res.text() : "";
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
