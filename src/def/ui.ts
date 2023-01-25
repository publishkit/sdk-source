type UINamespace =
  | "body"
  | "header.elements"
  | "header.icons"
  | "left"
  | "right"
  | "footer.left"
  | "footer.right"
  | "center."
  | "center.elements"
  | "modals"
  | "actions";

interface UIBuilder {
  base: import("src/ui").default;

  addElement(
    ns: UINamespace,
    elementId: string,
    body: string,
    options?: Partial<UIElement>
  ): UIElement;
  getElement(ns: UINamespace, elementId: string): UIElement;

  addHeaderIcon(
    elementId: string,
    options: Partial<UIHeaderIcon>
  ): UIHeaderIcon;
  getHeaderIcon(elementId: string): UIHeaderIcon;

  addAction(elementId: string, options: Partial<UIAction>): UIAction;
  getAction(elementId: string): UIAction;

  addModal(elementId: string, body: string, options?: ObjectAny): UIModal;
  getModal(elementId: string): UIModal;
}

interface UIElement {
  id: string;
  index?: number;
  html: string;
  el: JQuery;
  className?: string;
  fn(...args: any[]): any;
}

interface UIHeaderIcon extends UIElement {
  icon: string;
}

interface UIAction extends UIElement {
  text: string;
  icon?: string;
}

interface UIModal extends UIElement {
  open(cb?: (modal: UIModal) => void): void;
  close(cb?: Function): void;
}
