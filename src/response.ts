import { SingletonLayout, Widget, LayoutItem } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { ResponseModel } from './responseModel';

import { ResponseTable } from './responseTable';

export interface IResponse {
  readonly widget: Widget;
  setResponse(response: ResponseModel.Type): void;
}

export class Response {
  constructor() {
    this._widget = new ResponseWidget();
  }

  get widget(): Widget {
    return this._widget;
  }

  setResponse(response: ResponseModel.Type): void {
    this._widget.setResponse(response);
  }

  private readonly _widget: ResponseWidget;
}

export class ResponseWidget extends Widget {
  constructor() {
    super();
    this.layout = new SingletonLayout();
  }

  dispose(): void {
    if (this._table) {
      this._table.dispose();
    }
    super.dispose();
  }

  setCurrentWidget(widget: Widget) {
    this.layout.widget = widget;
    this.item = new LayoutItem(this.layout.widget);
    this.fitCurrentWidget();
  }

  onResize(msg: Message) {
    if (this.item) {
      this.fitCurrentWidget();
    }
  }

  fitCurrentWidget() {
    this.item.update(0, 0, this.node.offsetWidth, this.node.offsetHeight);
  }

  private _disposeTable(): void {
    if (this._table) {
      this._table.dispose();
    }
    this._table = null;
  }

  setResponse(response: ResponseModel.Type) {
    ResponseModel.match(
      response,
      (keys, rows) => {
        this._disposeTable();
        const table = ResponseTable.fromKeysRows(keys, rows);
        this._table = table;
        this.setCurrentWidget(table.widget);
      },
      () => {
        this._disposeTable();
        const message = 'Command executed successfully';
        const errorResponseWidget = new TextResponseWidget(message);
        this.setCurrentWidget(errorResponseWidget);
      },
      ({ message }) => {
        this._disposeTable();
        const errorResponseWidget = new TextResponseWidget(message);
        this.setCurrentWidget(errorResponseWidget);
      }
    );
  }

  readonly layout: SingletonLayout;
  private item: LayoutItem;
  private _table: ResponseTable | null = null;
}

class TextResponseWidget extends Widget {
  constructor(message: string) {
    super();
    const element = document.createElement('div');
    const pre = document.createElement('pre');
    pre.innerHTML = message;
    element.appendChild(pre);
    this.node.appendChild(element);
  }
}
