interface App {
  cache: AppCache;
  utils: typeof import("../utils/index").default;
  plugins: import("../plugins").default;
  ui: import("../ui").default;
  cfg: Function;
}

interface AppCache {
  pkrc: ObjectAny;
  dirs: ObjectAny[];
  frontmatter: ObjectAny;
  fly: ObjectAny;
  config: ObjectAny;
  pkdb: ObjectAny;
  tags: string[];
}
