export const asArray = (
  input: string | string[],
  { delim = ",", trim = true, uniq = true, compact = true } = {}
): string[] => {
  let output = typeof input == "string" ? input.split(delim) : input || [];

  if (trim) output = output.map((v) => v?.trim?.() || v);
  if (compact) output = output.filter(Boolean);
  if (uniq) output = [...new Set(output)];

  return output;
};

export const unique = (array: any[]): any[] => {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }
  return a;
};

// flaten, truthy, unique
export const clean = (array: any[]) => unique(array.flat().filter(Boolean));

// extract value from html
export const fromUl = (html: string) => {
  const dom = new DOMParser().parseFromString(html, "text/html");
  const root = dom.querySelector("ul");
  const array = [];

  // nested with section
  // @ts-ignore
  if ($(root).find("ul").length) {
    // @ts-ignore
    for (const el of $(root).find("> li")) {
      const label = $(el).clone().children().remove().end().text().trim();
      const isOpen = !$(el).find('[type="checkbox"][checked=""]')[0];
      const items: ObjectAny[] = [];

      $(el)
        .find("ul li")
        .map(function () {
          const item = $(this)
            .html()
            .split("||")
            .map((slot) => (slot || "").trim());
          items.push(item);
        });

      const section = { label, isOpen, items };

      array.push(section);
    }
    return { nested: true, items: array };
  } else {
    // @ts-ignore
    for (const el of $(root).find("> li")) {
      const item = $(el)
        .html()
        .split("||")
        .map((slot) => (slot || "").trim());
      array.push(item);
    }
    return { nested: false, items: array };
  }
};
