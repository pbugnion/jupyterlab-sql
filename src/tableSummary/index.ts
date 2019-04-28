import { Widget, BoxPanel } from '@phosphor/widgets';

import { Toolbar } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel } from '../components';

import * as Api from '../api';

import { ResultsTable, ToolbarItems } from '../components';

import { JupyterLabSqlPage, PageName } from '../page';

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
  }

  get content(): Widget {
    return this._content
  }

  get toolbar(): Toolbar {
    return this._toolbar
  }

  readonly pageName: PageName = PageName.TableSummary;
  private readonly _toolbar: Toolbar;
  private readonly _content: Content;
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

  private _onBackButtonClicked(): void {
    console.log('clicked')
  }
}
