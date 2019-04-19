import { Widget, BoxPanel } from '@phosphor/widgets';

import { PreWidget, SingletonPanel } from '../components';

export class TableSummaryPage extends BoxPanel {
  constructor() {
    super();
    this._responseWidget = new ResponseWidget()
    this.addWidget(this._responseWidget)
  }

  private readonly _responseWidget: Widget;
}

class ResponseWidget extends SingletonPanel {
  constructor() {
    super();
    this.widget = new PreWidget('hello table summary')
  }
}
