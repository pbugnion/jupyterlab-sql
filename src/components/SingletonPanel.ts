
import { SingletonLayout, Widget, LayoutItem } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

export class SingletonPanel extends Widget {
  onResize(_: Message) {
    if (this._item) {
      this._fitCurrentWidget()
    }
  }

  onActivateRequest() {
    const widget = this.layout.widget
    if (widget) {
      // Focus the content node if we aren't already focused on it or a
      // descendent.
      if (!widget.node.contains(document.activeElement)) {
        widget.node.focus();
      }

      // Activate the content asynchronously (which may change the focus).
      widget.activate();
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

  readonly layout: SingletonLayout = new SingletonLayout();
  private _item: LayoutItem;
}
