import { BoxPanel } from '@phosphor/widgets';

import { PreWidget, SingletonPanel } from '../components';

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
  }

  private readonly _responseWidget: ResponseWidget;
}

class ResponseWidget extends SingletonPanel {

  // TODO: Dispose of table and signals

  setResponse(response: string) {
    this.widget = new PreWidget(response)
  }
}
