
type BasePlugin = import("src/plugins/basePlugin").default;
type PluginType = "plugin" | "theme";


interface PluginCache {
  [key: string]: BasePlugin;
}

interface PluginObject {
  id: string;
  value: string | boolean;
  options: ObjectAny;
  url?: string;
}

interface HotkeysPlugin extends BasePlugin {
  register(shortcut: string, description: string, fn: Function): void;
}

interface ModalPlugin extends BasePlugin {
  stack: any[];
  modal: JQuery | false;
  open(id: string, cb?: Function): void;
  close(cb?: Function): void;
}

interface HighlightPlugin extends BasePlugin {
  apply(el: Element): void;
}

interface NavbarPlugin extends BasePlugin {
  toggle(): void;
}
