type ThemeMode = "all" | "light" | "dark";

interface SetupOptions {
  font?: string;
  headings?: HeadingSetup;
  highlight?: string;
  primary?: string;
}

interface HeadingSetup {
  font?: string;
}
