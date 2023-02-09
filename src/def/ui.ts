type UITypes = UIElement | UIIcon | UIAction | UIModal;

interface UIBuilder {
  base: import("src/ui").default;

  get(elementId: string): UITypes;

  addElement(
    elementId: string,
    zone: LayoutZone,
    body: string,
    options?: Partial<UIElement>
  ): UIElement;

  addIcon(
    elementId: string,
    zone: LayoutZone,
    options: Partial<UIIcon>
  ): UIIcon;

  addModal(
    elementId: string,
    body: string,
    options?: Partial<UIElement>
  ): UIModal;

  addAction(elementId: string, options: Partial<UIAction>): UIAction;
}

interface UIElement {
  id: string;
  index?: number;
  html: string;
  el: JQuery;
  className?: string;
  fn?(...args: any[]): any;
}

interface UIIcon extends UIElement {
  icon: string;
}

interface UIAction extends UIElement {
  text: string;
  icon?: string;
}

interface UIModal extends UIElement {
  noesc?: boolean;
  open(cb?: (modal: UIModal) => void): void;
  close(cb?: Function): void;
}
