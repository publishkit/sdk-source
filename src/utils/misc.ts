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

// const parseOptionValue = (value: string) => {
//  let [v, ...params] = value.split(":")
//  params = params.join(":") as any
//  v = parsePluginValue(v, v)

//  console.log("vvv", v , params)
//  return params
// }


// const parseOptions = (s: string, o: ObjectAny = {}) => {
//   if (!s || !o) return {};
//   const vars = s.split(",");
//   vars.map((v) => {
//     let [key, ...optionValue] = v.split(":");
//     let value: any = (optionValue || "").join(":");
//     if (isNumeric(value)) value = Number(value);
//     else if (value == "true") value = true;
//     else if (value == "false") value = false;
//     if(value.includes(":")) value = parseOptionValue(value)
//     console.log("yuuuu", value)
//     put(o, key, value);
//   });
//   return o;
// };

// export const resolveType = (name: string) => {
//   name = (name + "").trim();
//   if (!name) return "unknown";

//   if (name.startsWith("©")) return "core";
//   if (name.startsWith("@")) return "community";

//   if (
//     name.startsWith("https://") ||
//     name.startsWith("http://") ||
//     name.startsWith("//")
//   )
//     return "external";

//   return "unknown";
// };

// export const parsePluginValue () => {
//   id = id.split("|")[0].replace("@", "").replace("©", "");
//     value =
//       typeof value == "boolean"
//         ? id == "theme"
//           ? "@default"
//           : value
//           ? id
//           : ""
//         : value || "";
//         console.log("ooo", id, value)

//     const plugin = parsePluginValueRaw(id, value);
//     // precise plugin
//     if (plugin.type == "unknown") {
//       if (CoreKeys.includes(id)) plugin.type = "core";
//       else {
//         plugin.name = plugin.id;
//         plugin.type = "internal";
//       }
//     }
//     return plugin;
// }


// export const parsePluginValueRaw = (
//   id: string = "",
//   value: string
// ): PluginObject => {
  
//   const p: Partial<PluginObject> = {};

//   try {
//     p.id = id.split("|")[0].replace("@", "").replace("©", "");
//     if (typeof value !== "string") return <PluginObject>p;
//     let [name = "", options = ""] = value.trim().split("|");

//     if (!name) name == p.id;
//     else if (name == "@") name = `@${p.id}`;
//     else if (name == "©") name = `©${p.id}`;

//     p.name = name.replace("@", "").replace("©", "");
//     p.value = value;
//     p.type = resolveType(name);

//     if (options === "false") p.value = false;
//     else p.options = parseOptions(options);

//     if (!p.id)
//       switch (p.type) {
//         case "internal":
//           p.id = name;
//           break;
//         case "external":
//           p.id = name.split("/").pop()?.split(".")[0] || "";
//           break;
//         case "community":
//           p.id = name.replace("@", "");
//           break;
//       }
//   } catch (e) {
//     // @ts-ignore
//     p.error = e;
//   }

//   return <PluginObject>p;
// };

// export const resolveUrl = (plugin: ObjectAny = {}): string => {
//   let url = "";

//   const getPath = (name: string) =>
//     // @ts-ignore
//     ({
//       theme: `/themes/${plugin.name}.js`,
//       plugin: `/plugins/${plugin.name}.js`,
//     }[plugin.class]);

//   const path = getPath(plugin.name);

//   switch (plugin.type) {
//     case "internal":
//       url = `${window.pk.local}${path}`;
//       break;
//     case "external":
//       url = plugin.value.split("|")[0];
//       break;
//     case "community":
//       url = `https://cdn.jsdelivr.net/gh/publishkit/community@latest${path}`;
//       break;
//   }

//   return url;
// };
