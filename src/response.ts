import { SingletonLayout, Widget, LayoutItem } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { PreWidget } from './components';

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

  onResize(msg: Message) {
    if (this._item) {
      this._fitCurrentWidget();
    }
  }

  setResponse(response: ResponseModel.Type) {
    this._disposeTable();
    let widget: Widget;
    ResponseModel.match(
      response,
      (keys, rows) => {
        const table = ResponseTable.fromKeysRows(keys, rows);
        this._table = table;
        widget = table.widget;
      },
      () => {
        const message = 'Command executed successfully';
        widget = new PreWidget(message);
      },
      ({ message }) => {
        widget = new PreWidget(message);
      }
    );
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

  private _disposeTable(): void {
    if (this._table) {
      this._table.dispose();
    }
    this._table = null;
  }

  readonly layout: SingletonLayout;
  private _item: LayoutItem;
  private _table: ResponseTable | null = null;
}
