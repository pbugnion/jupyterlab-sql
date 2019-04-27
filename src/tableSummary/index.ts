import { Widget, BoxPanel } from '@phosphor/widgets';

import { Toolbar, ToolbarButton } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel } from '../components';

import * as Api from '../api';

import { ResultsTable } from '../components';

import { JupyterLabSqlPage, PageName } from '../page';

export namespace TableSummaryPage {
  export interface IOptions {
    tableName: string
  }
}

export class TableSummaryPage implements JupyterLabSqlPage {
  constructor(options: TableSummaryPage.IOptions) {
    this._content = new Content(options)
    // TODO correct url
    this._toolbar = new TableSummaryToolbar(
      'postgres://localhost:5432/postgres',
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
    this._getTableStructure();
  }

  private async _getTableStructure(): Promise<void> {
    const response = await Api.getTableStructure()
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
    const connectionUrlItem = new Widget();
    connectionUrlItem.node.innerText = connectionUrl
    const tableNameItem = new Widget();
    tableNameItem.node.innerText = tableName
    this.addItem(
      'back',
      new ToolbarButton({
        // TODO remove jp-Icon and jp-Icon-16 on new release
        // of packages
        iconClassName: 'jp-UndoIcon jp-Icon jp-Icon-16',
        // TODO: On click
      })
    )
    this.addItem('spacer', Toolbar.createSpacerItem())
    this.addItem('url', connectionUrlItem)
    this.addItem('tableName', tableNameItem)
  }
}
