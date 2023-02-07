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
