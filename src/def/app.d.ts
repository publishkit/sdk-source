import Utils from "../utils/index";

interface App {
  cache: AppCache;
  utils: typeof Utils;
  plugins: ObjectAny;
  ui: ObjectAny;
  theme: ObjectAny;
  cfg: Function;
}

interface AppCache {
  pkrc: ObjectAny;
  pkdb: ObjectAny;
  config: ObjectAny;
  frontmatter: ObjectAny;
  tags: string[];
}
