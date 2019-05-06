
import { Widget } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { DisposableSet } from '@phosphor/disposable';

import { Toolbar } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel } from '../components';

import * as Api from '../api'

import { proxyFor } from '../services';

import { JupyterLabSqlPage, PageName } from '../page';

import { DatabaseSummaryToolbar } from './toolbar';

import { DatabaseSummaryModel, DatabaseSummaryWidget } from './tableList';

// TODO break up into multiple source files?
// TODO bind double click to navigating to table

namespace DatabaseSummaryPage {
  export interface IOptions {
    connectionUrl: string;
  }
}

// TODO dispose of toolbar
export class DatabaseSummaryPage implements JupyterLabSqlPage {
  constructor(options: DatabaseSummaryPage.IOptions) {
    this._onRefresh = this._onRefresh.bind(this)
    this._content = new Content(options);
    this._toolbar = new DatabaseSummaryToolbar(options.connectionUrl);
    this._navigateBack = proxyFor(this._toolbar.backButtonClicked, this);
    this._toolbar.refreshButtonClicked.connect(this._onRefresh)
    this._customQueryClicked = proxyFor(this._content.customQueryClicked, this);
    this._navigateToTable = proxyFor(this._content.navigateToTable, this);
    this._disposables = DisposableSet.from([this._content, this._toolbar])

    this._onRefresh();
  }

  get content(): Widget {
    return this._content
  }

  get toolbar(): Toolbar {
    return this._toolbar
  }

  get navigateBack(): ISignal<this, void> {
    return this._navigateBack;
  }

  get customQueryClicked(): ISignal<this, void> {
    return this._customQueryClicked;
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable
  }

  // TODO: Correct disposal implementation
  get isDisposed() {
    return this._disposables.isDisposed;
  }

  dispose() {
    return this._disposables.dispose()
  }

  private async _onRefresh(): Promise<void> {
    this._toolbar.setLoading(true)
    await this._content.refresh()
    // TODO: what if refresh fails?
    this._toolbar.setLoading(false)
  }

  readonly pageName: PageName = PageName.DatabaseSummary;
  private readonly _disposables: DisposableSet;
  private readonly _toolbar: DatabaseSummaryToolbar;
  private readonly _content: Content;
  private readonly _navigateBack: Signal<this, void>;
  private readonly _customQueryClicked: Signal<this, void>
  private readonly _navigateToTable: Signal<this, string>
}

class Content extends SingletonPanel {
  constructor(options: DatabaseSummaryPage.IOptions) {
    super();
    this._connectionUrl = options.connectionUrl;
    this._responseWidget = new ResponseWidget()
    this._navigateToTable = proxyFor(this._responseWidget.navigateToTable, this);
    this._customQueryClicked = proxyFor(this._responseWidget.navigateToCustomQuery, this);
    this.widget = this._responseWidget;
  }

  get customQueryClicked(): ISignal<this, void> {
    return this._customQueryClicked;
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable
  }

  async refresh(): Promise<void> {
    const response = await Api.getStructure(this._connectionUrl)
    this._responseWidget.setResponse(response)
  }

  private readonly _connectionUrl: string;
  private readonly _responseWidget: ResponseWidget
  private readonly _customQueryClicked: Signal<this, void>;
  private readonly _navigateToTable: Signal<this, string>;
}

class ResponseWidget extends SingletonPanel {
  dispose(): void {
    this._disposeWidgets();
    super.dispose();
  }

  setResponse(response: Api.StructureResponse.Type) {
    this._disposeWidgets();
    Api.StructureResponse.match(
      response,
      tables => {
        const model = new DatabaseSummaryModel(tables);
        this.widget = DatabaseSummaryWidget.withModel(model);
        model.navigateToCustomQuery.connect(() => {
          this._navigateToCustomQuery.emit(void 0)
        })
        model.navigateToTable.connect((_, tableName) => {
          this._navigateToTable.emit(tableName);
        })
      },
      () => {
        // TODO handle error
        this.widget = new PreWidget('oops')
      }
    )
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable;
  }

  get navigateToCustomQuery(): ISignal<this, void> {
    return this._navigateToCustomQuery;
  }

  private _disposeWidgets(): void {
    if (this._databaseSummaryModel) {
      Signal.disconnectBetween(this._databaseSummaryModel, this);
      this._databaseSummaryModel.dispose()
    }
  }

  private _databaseSummaryModel: DatabaseSummaryModel | null;
  private readonly _navigateToTable = new Signal<this, string>(this);
  private readonly _navigateToCustomQuery = new Signal<this, void>(this);
}
