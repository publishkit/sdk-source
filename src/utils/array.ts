export const asArray = (
  input: string | string[] | undefined,
  { delim = ",", trim = true, uniq = true, compact = true } = {}
): string[] => {
  if (!input) return [];
  let output =
    typeof input == "string"
      ? input.split(input.includes(delim) ? delim : " ")
      : input || [];

  if (trim) output = output.map((v) => v?.trim?.() || v);
  if (compact) output = output.filter(Boolean);
  if (uniq) output = [...new Set(output)];

  return output;
};

export const intersectStrings = (arr1 = [], arr2 = []) => {
  const res: any = [];
  const { length: len1 } = arr1;
  const { length: len2 } = arr2;
  const smaller = (len1 < len2 ? arr1 : arr2).slice();
  const bigger = (len1 >= len2 ? arr1 : arr2).slice();
  for (let i = 0; i < smaller.length; i++) {
    if (bigger.indexOf(smaller[i]) !== -1) {
      res.push(smaller[i]);
      // @ts-ignore
      bigger.splice(bigger.indexOf(smaller[i]), 1, undefined);
    }
  }
  return res;
};

export const map = async (arr: any[], fn: Function) => {
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    const result = await fn(arr[i], i, arr);
    results.push(result);
  }
  return results;
};

export const serie = map;

export const parallel = async (a: [], fn: any) => await Promise.all(a.map(fn));

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

export const sequence = async (arr: any[], cb: Function) => {
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    const result = await cb(arr[i], i, arr);
    results.push(result);
  }
  return results;
};

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
