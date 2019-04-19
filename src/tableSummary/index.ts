import { BoxPanel } from '@phosphor/widgets';

import { PreWidget, SingletonPanel } from '../components';

import { Api } from '../api';

export namespace TableSummaryPage {
  export interface IOptions {
    tableName: string
  }
}

export class TableSummaryPage extends BoxPanel {
  constructor(options: TableSummaryPage.IOptions) {
    super();
    const { tableName } = options
    this._responseWidget = new ResponseWidget()
    this._responseWidget.setResponse(tableName)
    this.addWidget(this._responseWidget)
    this._getTableStructure();
  }

  private async _getTableStructure(): Promise<void> {
    const response = await Api.getTableStructure()
    this._responseWidget.setResponse(JSON.stringify(response))
  }

  private readonly _responseWidget: ResponseWidget;
}

class ResponseWidget extends SingletonPanel {

  // TODO: Dispose of table and signals

  setResponse(response: string) {
    this.widget = new PreWidget(response)
  }
}
