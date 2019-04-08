import { BoxPanel } from '@phosphor/widgets';

import { newToolbar, ToolbarModel } from './toolbar';

namespace ConnectionPage {
  export interface IOptions {
    initialConnectionString: string;
  }
}

export class ConnectionPage extends BoxPanel {

  constructor(options: ConnectionPage.IOptions) {
    super();

    this.addClass('p-Sql-MainContainer')

    const toolbarModel = new ToolbarModel(options.initialConnectionString);
    const connectionWidget = newToolbar(toolbarModel);

    this.addWidget(connectionWidget)
    BoxPanel.setSizeBasis(connectionWidget, 50)
  }

}
