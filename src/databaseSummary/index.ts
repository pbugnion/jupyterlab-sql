
import { Widget, BoxPanel, SingletonLayout, LayoutItem } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { Api } from '../api'

import { PreWidget } from '../components';

namespace DatabaseSummaryPage {
  export interface IOptions {
    connectionUrl: string;
  }
}

export class DatabaseSummaryPage extends BoxPanel {
  constructor(options: DatabaseSummaryPage.IOptions) {
    super();
    this.responseWidget = new ResponseWidget()
    this.responseWidget.setResponse("loading")
    this.getStructure()
    this.addWidget(this.responseWidget);
    BoxPanel.setStretch(this.responseWidget, 1)
  }

  async getStructure(): Promise<void> {
    const response = await Api.getStructure()
    this.responseWidget.setResponse(response)
  }

  private readonly responseWidget: ResponseWidget
}

class ResponseWidget extends Widget {
  constructor() {
    super();
    this.layout = new SingletonLayout();
  }

  onResize(_: Message) {
    if (this._item) {
      this._fitCurrentWidget()
    }
  }

  setResponse(response: any) {
    const widget = new PreWidget(JSON.stringify(response));
    this._setCurrentWidget(widget);
  }

  private _setCurrentWidget(widget: Widget) {
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
