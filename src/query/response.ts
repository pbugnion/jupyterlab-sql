import { Widget } from '@lumino/widgets';

import { PreWidget, SingletonPanel, ResultsTable } from '../components';

import * as Api from '../api';

export interface IResponse {
  readonly widget: Widget;
  setResponse(response: Api.ResponseModel.Type): void;
}

export class Response {
  constructor() {
    this._widget = new ResponseWidget();
  }

  get widget(): Widget {
    return this._widget;
  }

  setResponse(response: Api.ResponseModel.Type): void {
    this._widget.setResponse(response);
  }

  private readonly _widget: ResponseWidget;
}

export class ResponseWidget extends SingletonPanel {
  dispose(): void {
    if (this._table) {
      this._table.dispose();
    }
    super.dispose();
  }

  setResponse(response: Api.ResponseModel.Type) {
    this._disposeTable();
    Api.ResponseModel.match(
      response,
      (keys, rows) => {
        const table = new ResultsTable(keys, rows);
        this._table = table;
        this.widget = table.widget;
      },
      () => {
        const message = 'Command executed successfully';
        this.widget = new PreWidget(message);
      },
      ({ message }) => {
        this.widget = new PreWidget(message);
      }
    );
  }

  private _disposeTable(): void {
    if (this._table) {
      this._table.dispose();
    }
    this._table = null;
  }

  private _table: ResultsTable | null = null;
}
