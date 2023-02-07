type ThemeMode = {
  selector: string;
  tokens: string[];
};
type ThemeModeName = "all" | "light" | "dark";

interface ThemeOptions {
  bg?: string;
  font?: string;
  color?: string;
  headings?: ThemeHeadingOptions;
  highlight?: string;
  primary?: string;
  secondary?: string;
}

interface ThemeHeadingOptions {
  font?: string;
  color?: string;
}
