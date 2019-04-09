
import { SingletonLayout, Widget, LayoutItem } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

export class SingletonPanel extends Widget {
  constructor() {
    super();
    this.layout = new SingletonLayout();
  }

  onResize(_: Message) {
    if (this._item) {
      this._fitCurrentWidget()
    }
  }

  set widget(widget: Widget) {
    this.layout.widget = widget;
    this._item = new LayoutItem(this.layout.widget);
    this._fitCurrentWidget();
  }

  private _fitCurrentWidget() {
    this._item.update(0, 0, this.node.offsetWidth, this.node.offsetHeight);
  }

  readonly layout: SingletonLayout;
  private _item: LayoutItem;
}
