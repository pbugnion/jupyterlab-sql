import { Widget, BoxPanel } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { Toolbar } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel, ResultsTable, ToolbarItems } from '../components';

import * as Api from '../api';

import { JupyterLabSqlPage, PageName } from '../page';

import { proxyFor } from '../services';

// TODO: add ability to refresh page
// TODO: add loading button

export namespace TableSummaryPage {
  export interface IOptions {
    connectionUrl: string,
    tableName: string
  }
}

export class TableSummaryPage implements JupyterLabSqlPage {
  constructor(options: TableSummaryPage.IOptions) {
    this._content = new Content(options)
    this._toolbar = new TableSummaryToolbar(
      options.connectionUrl,
      options.tableName
    )
    this._navigateBack = proxyFor(this._toolbar.backButtonClicked, this);
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

  readonly pageName: PageName = PageName.TableSummary;
  private readonly _toolbar: TableSummaryToolbar;
  private readonly _content: Content;
  private readonly _navigateBack: Signal<this, void>;
}


class Content extends BoxPanel {
  constructor(options: TableSummaryPage.IOptions) {
    super();
    this._responseWidget = new ResponseWidget()
    this.addWidget(this._responseWidget)
    this._getTableStructure(options.connectionUrl, options.tableName);
  }

  private async _getTableStructure(connectionUrl: string, tableName: string): Promise<void> {
    const response = await Api.getTableStructure(connectionUrl, tableName)
    this._responseWidget.setResponse(response)
  }

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
    this.addItem(
      'back',
      new ToolbarItems.BackButton({ onClick: this._onBackButtonClicked })
    )
    this.addItem('spacer', Toolbar.createSpacerItem())
    this.addItem('url', new ToolbarItems.TextItem(connectionUrl))
    this.addItem('tableName', new ToolbarItems.TextItem(tableName))
  }

  get backButtonClicked(): ISignal<this, void> {
    return this._backButtonClicked;
  }

  private _onBackButtonClicked(): void {
    this._backButtonClicked.emit(void 0)
  }

  private readonly _backButtonClicked: Signal<this, void> = new Signal(this);
}
