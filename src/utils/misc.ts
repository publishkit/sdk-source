import { put } from "./object";
import { isNumeric } from "./number";

// https://stackoverflow.com/questions/74674559/truncate-portions-of-a-string-found-between-a-regex-pattern#74675305
// ex: f('lorem <mark>ipsum</mark> dolor <mark>amer</mark> sipiu', '<mark>.+?</mark>', 2, '...')
// =>: '...m <mark>ipsum</mark> d...r <mark>amer</mark> s...'
export const truncateBetweenPattern = (
  str: string,
  pattern: string,
  padding = 0,
  sep = "..."
) => {
  const re = [
    RegExp(`^().+?(.{${padding}})$`, "s"),
    RegExp(`^(.{${padding}}).+?(.{${padding}})$`, "s"),
    RegExp(`^(.{${padding}}).+?()$`, "s"),
  ];
  const parts = str.split(RegExp(`(${pattern})`, "s"));
  return parts.length < 2
    ? str
    : parts
        .map((part, i, { length }) =>
          i % 2
            ? part
            : // @ts-ignore
              part.replace(re[(i > 0) + (i == length - 1)], `$1${sep}$2`)
        )
        .join("");
};




const parseOptions = (s: string, o: ObjectAny) => {
  if(!s || !o) return {}
  const vars = s.split(",")
  vars.forEach(v => {
    let kv = v.split(":")
    let key = kv[0]
    let value: any = kv[1]
    if(isNumeric(value)) value = Number(value)
    else if(value=="true") value = true
    else if(value=="false") value = false
    put(o, key, value)
  })
  return o
}

export const parseValue = (value: string, type: string): ObjectAny => {
  const getPath = (name: string) => (({
    "css": `/themes/${name}.css`,
    "js": `/plugins/${name}.js`
  } as ObjectAny)[type])
  const p = {
    key: "",
    url: "",
    options: {},
  };

  if (typeof value != "string" || !(value = value.trim())) return p;

  let [url = "", options = ""] = value.split("|");
  parseOptions(options, p.options);

  if (options === "false") {
    p.key = url
    // @ts-ignore
    p.url = false
  } else if (url.includes("//")) {
    // @ts-ignore
    p.key = url.split("/").pop()?.split(".")[0];
    p.url = url;
  } else if (value.startsWith("@")) {
    p.key = url.replace("@", "");
    p.url = `https://cdn.jsdelivr.net/gh/publishkit/community@latest${getPath(p.key)}`;
  } else {
    p.key = url;
    p.url = `${window.pk.base}${window.pk.folder}${getPath(p.key)}`;
  }

  return p;
};
