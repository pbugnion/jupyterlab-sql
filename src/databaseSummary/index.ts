
import { BoxPanel } from '@phosphor/widgets';

namespace DatabaseSummaryPage {
  export interface IOptions {
    connectionUrl: string;
  }
}

export class DatabaseSummaryPage extends BoxPanel {
  constructor(options: DatabaseSummaryPage.IOptions) {
    super();
    const element = document.createElement('div');
    const pre = document.createElement('pre');
    pre.innerHTML = 'hello database summary'
    element.appendChild(pre)
    this.node.appendChild(element);
  }
}
