interface App {
  cache: AppCache;
  utils: typeof import("../utils/index").default;
  plugins: import("../plugins").default;
  ui: import("../ui").default;
  cfg: Function;
}

interface AppCache {
  kitrc: ObjectAny;
  dirs: ObjectAny[];
  frontmatter: ObjectAny;
  fly: ObjectAny;
  config: ObjectAny;
  kitdb: ObjectAny;
  tags: string[];
}
