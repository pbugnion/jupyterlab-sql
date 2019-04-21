import { BoxPanel, Widget } from '@phosphor/widgets';

import { Toolbar } from '@jupyterlab/apputils';

import { newToolbar, ConnectionPageToolbarModel } from './connectionPageToolbar';

import { Signal, ISignal } from '@phosphor/signaling';

import { JupyterLabSqlPage } from './page';

import { proxyFor } from './services';

namespace ConnectionPage {
  export interface IOptions {
    initialConnectionString: string;
  }
}

export class ConnectionPage implements JupyterLabSqlPage {
  constructor(options: ConnectionPage.IOptions) {
    const { initialConnectionString } = options
    this._content = new Content(initialConnectionString)
    this._connectDatabase = proxyFor(this._content.connectDatabase, this)
  }

  get content(): Widget {
    return this._content
  }

  get connectDatabase(): ISignal<this, string> {
    return this._connectDatabase;
  }

  readonly toolbar: Toolbar = new Toolbar();
  private readonly _content: Content;
  private readonly _connectDatabase = new Signal<this, string>(this);
}

class Content extends BoxPanel {
  constructor(initialConnectionString: string) {
    super();

    this.addClass('p-Sql-MainContainer')

    const toolbarModel = new ConnectionPageToolbarModel(initialConnectionString);
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
