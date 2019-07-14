import { BoxPanel, Widget } from '@phosphor/widgets';

import { Signal, ISignal } from '@phosphor/signaling';

import { DisposableSet } from '@phosphor/disposable';

import { Toolbar } from '@jupyterlab/apputils';

import { JupyterLabSqlPage, PageName } from '../page';

import { proxyFor } from '../services';

import { Preset } from '../api';

import { ConnectionsWidget, ConnectionsModel } from './content';

namespace ConnectionPage {
  export interface IOptions {
    initialConnectionString: string;
  }
}

export class ConnectionPage implements JupyterLabSqlPage {
  constructor(options: ConnectionPage.IOptions) {
    const { initialConnectionString } = options;
    this._content = new Content(initialConnectionString);
    this._connectDatabase = proxyFor(this._content.connectDatabase, this);
    this._connectionUrlChanged = proxyFor(
      this._content.connectionUrlChanged,
      this
    );
    this._toolbar = new Toolbar();
    this._disposables = DisposableSet.from([this._content, this._toolbar]);
  }

  get content(): Widget {
    return this._content;
  }

  get connectDatabase(): ISignal<this, string> {
    return this._connectDatabase;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  get toolbar(): Toolbar {
    return this._toolbar;
  }

  get isDisposed() {
    return this._disposables.isDisposed;
  }

  dispose() {
    return this._disposables.dispose();
  }

  readonly pageName: PageName = PageName.Connection;
  private readonly _disposables: DisposableSet;
  private readonly _toolbar: Toolbar;
  private readonly _content: Content;
  private readonly _connectDatabase: Signal<this, string>;
  private readonly _connectionUrlChanged: Signal<this, string>;
}

class Content extends BoxPanel {
  constructor(initialConnectionString: string) {
    super();

    this.addClass('p-Sql-MainContainer');

    const presets: Array<Preset> = [
      {
        name: 'd1',
        description: 'some long description',
        url: 'postgres://localhost:5432/postgres'
      },
      {
        name: 'd2',
        url: 'sqlite:///myfile.db'
      },
      {
        name: 'some long name',
        url: 'sqlite:///myfile.db'
      }
    ]
    const connectionsModel = new ConnectionsModel(presets);
    this._connectionsWidget = ConnectionsWidget.withModel(connectionsModel);

    this.addWidget(this._connectionsWidget);
    BoxPanel.setStretch(this._connectionsWidget, 1);
  }

  get connectDatabase(): ISignal<this, string> {
    return this._connectDatabase;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  onActivateRequest() {
    this._connectionsWidget.activate();
  }

  private readonly _connectionsWidget: ConnectionsWidget;
  private readonly _connectDatabase: ISignal<this, string> = new Signal<this, string>(this);
  private readonly _connectionUrlChanged: ISignal<this, string> = new Signal<this, string>(this);
}
