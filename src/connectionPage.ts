import { BoxPanel } from '@phosphor/widgets';

import { newToolbar, ConnectionPageToolbarModel } from './connectionPageToolbar';

import { Api } from './api';

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

    toolbarModel.connect.connect(() => {
      Api.getStructure().then(console.log)
    })
  }

}
