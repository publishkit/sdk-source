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
  layout?: ThemeLayoutOptions;
  highlight?: string;
  primary?: string;
  secondary?: string;
}

interface ThemeHeadingOptions {
  font?: string;
  color?: string;
}

interface ThemeLayoutOptions {
  className?: string;
  maxWidth?: string;
}
