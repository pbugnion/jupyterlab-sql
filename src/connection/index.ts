import { BoxPanel, Widget } from '@phosphor/widgets';

import { Signal, ISignal } from '@phosphor/signaling';

import { DisposableSet } from '@phosphor/disposable';

import { Toolbar } from '@jupyterlab/apputils';

import { ConnectionEditor, ConnectionEditorModel } from './connectionEditor';

import { JupyterLabSqlPage, PageName } from '../page';

import { proxyFor } from '../services';

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
    this._connectionUrlChanged = proxyFor(this._content.connectionUrlChanged, this)
    this._toolbar = new Toolbar();
    this._disposables = DisposableSet.from([this._content, this._toolbar])
  }

  get content(): Widget {
    return this._content
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

    this.addClass('p-Sql-MainContainer')

    const connectionEditorModel = new ConnectionEditorModel(initialConnectionString);
    this._connectionWidget = ConnectionEditor.withModel(connectionEditorModel);

    this.addWidget(this._connectionWidget)
    BoxPanel.setSizeBasis(this._connectionWidget, 50)

    this._connectDatabase = proxyFor(connectionEditorModel.connect, this);
    this._connectionUrlChanged = proxyFor(connectionEditorModel.connectionUrlChanged, this);
  }

  get connectDatabase(): ISignal<this, string> {
    return this._connectDatabase;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  onActivateRequest() {
    this._connectionWidget.activate();
  }

  private readonly _connectionWidget: ConnectionEditor;
  private readonly _connectDatabase: ISignal<this, string>;
  private readonly _connectionUrlChanged: ISignal<this, string>;
}
