import { BoxPanel } from '@phosphor/widgets';

import { newToolbar, ConnectionPageToolbarModel } from './connectionPageToolbar';

namespace ConnectionPage {
  export interface IOptions {
    initialConnectionString: string;
  }
}

export class ConnectionPage extends BoxPanel {

  constructor(options: ConnectionPage.IOptions) {
    super();

    this.addClass('p-Sql-MainContainer')

    const toolbarModel = new ConnectionPageToolbarModel(options.initialConnectionString);
    const connectionWidget = newToolbar(toolbarModel);

    this.addWidget(connectionWidget)
    BoxPanel.setSizeBasis(connectionWidget, 50)
  }

}
