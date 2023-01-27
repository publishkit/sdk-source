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

const parseOptions = (s: string, o: ObjectAny = {}) => {
  if (!s || !o) return {};
  const vars = s.split(",");
  vars.forEach((v) => {
    let [key, ...optionValue] = v.split(":");
    let value: any = (optionValue||"").join(":");
    if (isNumeric(value)) value = Number(value);
    else if (value == "true") value = true;
    else if (value == "false") value = false;
    put(o, key, value);
  });
  return o;
};

export const resolveType = (name: string) => {
  if (typeof name == "boolean") return "core";
  if (typeof name != "string" || !name) return "";
  if (name.includes("//")) return "external";
  else if (name.startsWith("@")) return "community";
  else return "internal";
};

export const parseFlyPlugin = (value: string): PluginObject => {
  const p: PluginObject = {
    id: "",
    value: "",
    options: {},
  };

  try {
    if (typeof value != "string" || !(value = value.trim())) return p;

    let [name = "", options = ""] = value.split("|");

    p.value = value;
    if (options === "false") p.value = false;
    else p.options = parseOptions(options);

    switch (resolveType(name)) {
      case "internal":
        p.id = name;
        break;
      case "external":
        p.id = name.split("/").pop()?.split(".")[0] || "";
        break;
      case "community":
        p.id = name.replace("@", "");
        break;
    }

  } catch (e) {
    // @ts-ignore
    p.error = e;
  }

  return p;
};


export const resolvePluginUrl = (
  type: PluginType = "plugin",
  plugin: ObjectAny = {}
): string => {
  let { id, value} = plugin
  if (typeof value != "string" || !(value = value.trim())) return "";
  let url = "";

  const getPath = (name: string) =>
    ({
      theme: `/themes/${name}.js`,
      plugin: `/plugins/${name}.js`,
    }[type]);

  const path = getPath(id);

  switch (resolveType(value)) {
    case "internal":
      url = `${window.pk.folder}${path}`;
      break;
    case "external":
      url = value.split("|")[0];
      break;
    case "community":
      url = `https://cdn.jsdelivr.net/gh/publishkit/community@latest${path}`;
      break;
  }

  return url;
};
