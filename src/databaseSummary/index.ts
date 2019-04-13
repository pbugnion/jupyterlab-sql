
import { BoxPanel } from '@phosphor/widgets';

import { PreWidget, SingletonPanel } from '../components';

import { Api } from '../api'

namespace DatabaseSummaryPage {
  export interface IOptions {
    connectionUrl: string;
  }
}

export class DatabaseSummaryPage extends BoxPanel {
  constructor(options: DatabaseSummaryPage.IOptions) {
    super();
    this.responseWidget = new ResponseWidget()
    this.responseWidget.setResponse("loading")
    this.getStructure()
    this.addWidget(this.responseWidget);
    BoxPanel.setStretch(this.responseWidget, 1)
  }

  async getStructure(): Promise<void> {
    const response = await Api.getStructure()
    this.responseWidget.setResponse(response)
  }

  private readonly responseWidget: ResponseWidget
}

class ResponseWidget extends SingletonPanel {
  setResponse(response: any) {
    this.widget = new PreWidget(JSON.stringify(response));
  }
}
