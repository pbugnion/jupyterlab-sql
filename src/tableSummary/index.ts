import { Widget, BoxPanel } from '@lumino/widgets';

import { ISignal, Signal } from '@lumino/signaling';

import { DisposableSet } from '@lumino/disposable';

import { Toolbar } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel, ResultsTable } from '../components';

import * as Api from '../api';

import { JupyterLabSqlPage, PageName } from '../page';

import { proxyFor } from '../services';

import { TableSummaryToolbar } from './toolbar';

export namespace TableSummaryPage {
  export interface IOptions {
    connectionUrl: string;
    tableName: string;
  }
}

export class TableSummaryPage implements JupyterLabSqlPage {
  constructor(options: TableSummaryPage.IOptions) {
    this._onRefresh = this._onRefresh.bind(this);
    this._content = new Content(options);
    this._toolbar = new TableSummaryToolbar(
      options.connectionUrl,
      options.tableName
    );
    this._navigateBack = proxyFor(this._toolbar.backButtonClicked, this);
    this._toolbar.refreshButtonClicked.connect(this._onRefresh);
    this._disposables = DisposableSet.from([this._content, this._toolbar]);
    this._onRefresh();
  }

  get content(): Widget {
    return this._content;
  }

  get toolbar(): Toolbar {
    return this._toolbar;
  }

  get navigateBack(): ISignal<this, void> {
    return this._navigateBack;
  }

  get isDisposed() {
    return this._disposables.isDisposed;
  }

  dispose() {
    return this._disposables.dispose();
  }

  private async _onRefresh(): Promise<void> {
    this._toolbar.setLoading(true);
    await this._content.refresh();
    this._toolbar.setLoading(false);
  }

  readonly pageName: PageName = PageName.TableSummary;
  private readonly _disposables: DisposableSet;
  private readonly _toolbar: TableSummaryToolbar;
  private readonly _content: Content;
  private readonly _navigateBack: Signal<this, void>;
}

class Content extends BoxPanel {
  constructor(options: TableSummaryPage.IOptions) {
    super();
    this._connectionUrl = options.connectionUrl;
    this._tableName = options.tableName;
    this._responseWidget = new ResponseWidget();
    this.addWidget(this._responseWidget);
  }

  async refresh(): Promise<void> {
    const response = await Api.getTableStructure(
      this._connectionUrl,
      this._tableName
    );
    this._responseWidget.setResponse(response);
  }

  private readonly _connectionUrl: string;
  private readonly _tableName: string;
  private readonly _responseWidget: ResponseWidget;
}

class ResponseWidget extends SingletonPanel {
  dispose(): void {
    this._disposeTable();
    super.dispose();
  }

  setResponse(response: Api.TableStructureResponse.Type) {
    this._disposeTable();
    Api.TableStructureResponse.match(
      response,
      (keys, rows) => {
        this._table = new ResultsTable(keys, rows);
        this.widget = this._table.widget;
      },
      ({ message }) => {
        this.widget = new PreWidget(message);
      }
    );
  }

  private _disposeTable() {
    if (this._table) {
      this._table.dispose();
    }
    this._table = null;
  }

  private _table: ResultsTable | null = null;
}
