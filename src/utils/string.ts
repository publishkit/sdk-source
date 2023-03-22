// https://fsymbols.com/generators/carty/
export const banner = () => {
  return `
█▀█ █░█ █▄▄ █░░ █ █▀ █░█   █▄▀ █ ▀█▀
█▀▀ █▄█ █▄█ █▄▄ █ ▄█ █▀█   █░█ █ ░█░ .dev`;
};

export const slugify = (text: string) => {
  return text
    .toString() // Cast to string (optional)
    .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\_/g, "-") // Replace _ with -
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/\-$/g, ""); // Remove trailing -
};

export const handlebar = (str: string, data?: any): string => {
  try {
    return window.Handlebars.compile(str)(data);
  } catch (e) {
    console.log("handlebar:error", e);
    return "";
  }
};

export const join = (...strs: any[]) => {
  return strs.reduce((a, v) => (a += `${v || ""} `), "").trim().replace(/  +/g, ' ');
};
