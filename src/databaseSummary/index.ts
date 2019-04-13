
import { Widget, BoxPanel } from '@phosphor/widgets';

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
    this._responseWidget = new ResponseWidget()
    this._responseWidget.setResponse("loading")
    const customQueryWidget = new CustomQueryWidget()
    this.addWidget(customQueryWidget);
    this.addWidget(this._responseWidget);
    BoxPanel.setSizeBasis(customQueryWidget, 30);
    BoxPanel.setStretch(this._responseWidget, 1)
    this._getStructure()
  }

  private async _getStructure(): Promise<void> {
    const response = await Api.getStructure()
    this._responseWidget.setResponse(response)
  }

  private readonly _responseWidget: ResponseWidget
}

class CustomQueryWidget extends Widget {
  constructor() {
    super();
    const element = document.createElement('div');
    const button = document.createElement('button');
    button.innerHTML = 'Custom query';
    button.onclick = () => console.log('custom query click');
    element.appendChild(button);
    this.node.appendChild(element);
  }
}

class ResponseWidget extends SingletonPanel {
  setResponse(response: any) {
    this.widget = new PreWidget(JSON.stringify(response));
  }
}
