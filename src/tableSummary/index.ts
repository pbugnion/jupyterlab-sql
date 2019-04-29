import { Widget, BoxPanel } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { Toolbar } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel, ResultsTable, ToolbarItems } from '../components';

import * as Api from '../api';

import { JupyterLabSqlPage, PageName } from '../page';

import { proxyFor } from '../services';

export namespace TableSummaryPage {
  export interface IOptions {
    connectionUrl: string,
    tableName: string
  }
}

export class TableSummaryPage implements JupyterLabSqlPage {
  constructor(options: TableSummaryPage.IOptions) {
    this._onRefresh = this._onRefresh.bind(this)
    this._content = new Content(options)
    this._toolbar = new TableSummaryToolbar(
      options.connectionUrl,
      options.tableName
    )
    this._navigateBack = proxyFor(this._toolbar.backButtonClicked, this);
    this._toolbar.refreshButtonClicked.connect(this._onRefresh)
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

  private async _onRefresh(): Promise<void> {
    this._toolbar.setLoading(true)
    await this._content.refresh()
    // TODO: what if refresh fails?
    this._toolbar.setLoading(false)
  }

  readonly pageName: PageName = PageName.TableSummary;
  private readonly _toolbar: TableSummaryToolbar;
  private readonly _content: Content;
  private readonly _navigateBack: Signal<this, void>;
}


class Content extends BoxPanel {
  constructor(options: TableSummaryPage.IOptions) {
    super();
    this._connectionUrl = options.connectionUrl;
    this._tableName = options.tableName
    this._responseWidget = new ResponseWidget()
    this.addWidget(this._responseWidget)
  }

  async refresh(): Promise<void> {
    const response = await Api.getTableStructure(this._connectionUrl, this._tableName)
    this._responseWidget.setResponse(response)
  }

  private readonly _connectionUrl: string;
  private readonly _tableName: string;
  private readonly _responseWidget: ResponseWidget;
}

class ResponseWidget extends SingletonPanel {

  // TODO: Dispose of table and signals
  // TODO: Proper error handling

  setResponse(response: Api.TableStructureResponse.Type) {
    Api.TableStructureResponse.match(
      response,
      (keys, rows) => {
        const table = new ResultsTable(keys, rows);
        this.widget = table.widget
      },
      () => {
        this.widget = new PreWidget('oops')
      }
    )
  }
}

class TableSummaryToolbar extends Toolbar {
  constructor(connectionUrl: string, tableName: string) {
    super();
    this._onBackButtonClicked = this._onBackButtonClicked.bind(this)
    this._onRefreshButtonClicked = this._onRefreshButtonClicked.bind(this)
    this.addItem(
      'back',
      new ToolbarItems.BackButton({ onClick: this._onBackButtonClicked })
    )
    this.addItem(
      'refresh',
      new ToolbarItems.RefreshButton({ onClick: this._onRefreshButtonClicked })
    )
    this.addItem('spacer', Toolbar.createSpacerItem())
    this.addItem('url', new ToolbarItems.TextItem(connectionUrl))
    this.addItem('tableName', new ToolbarItems.TextItem(tableName))
    this.addItem('loading', this._loadingIcon)
  }

  get backButtonClicked(): ISignal<this, void> {
    return this._backButtonClicked;
  }

  get refreshButtonClicked(): ISignal<this, void> {
    return this._refreshButtonClicked;
  }

  setLoading(isLoading: boolean) {
    this._loadingIcon.setLoading(isLoading);
  }

  private _onBackButtonClicked(): void {
    this._backButtonClicked.emit(void 0)
  }

  private _onRefreshButtonClicked(): void {
    this._refreshButtonClicked.emit(void 0);
  }

  private readonly _loadingIcon: ToolbarItems.LoadingIcon = new ToolbarItems.LoadingIcon();
  private readonly _backButtonClicked: Signal<this, void> = new Signal(this);
  private readonly _refreshButtonClicked: Signal<this, void> = new Signal(this);
}
