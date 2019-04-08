import { BoxPanel } from '@phosphor/widgets';

import { newToolbar, ConnectionPageToolbarModel } from './connectionPageToolbar';

import { Signal, ISignal } from '@phosphor/signaling';

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

    toolbarModel.connect.connect((_, connectionUrl) => {
      this._connectDatabase.emit(connectionUrl)
    })
  }

  get connectDatabase(): ISignal<this, string> {
    return this._connectDatabase;
  }

  private readonly _connectDatabase = new Signal<this, string>(this);

}
