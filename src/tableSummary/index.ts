import { Widget, BoxPanel } from '@phosphor/widgets';

import { Toolbar } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel } from '../components';

import { Api } from '../api';

import { ResultsTable } from '../components';

import { JupyterLabSqlPage } from '../page';

export namespace TableSummaryPage {
  export interface IOptions {
    tableName: string
  }
}


export class TableSummaryPage implements JupyterLabSqlPage {
  constructor(options: TableSummaryPage.IOptions) {
    this._content = new Content(options)
  }

  get content(): Widget {
    return this._content
  }

  readonly toolbar: Toolbar = new Toolbar();
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
