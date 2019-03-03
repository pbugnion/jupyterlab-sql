import * as uuid from 'uuid';

import { BoxPanel } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { ISignal, Signal } from '@phosphor/signaling';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { ServerConnection } from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

import { ToolbarContainer, ToolbarModel } from './toolbar';

import { ResponseWidget } from './response';

import { Editor } from './editor';

namespace JupyterLabSqlWidget {
  export interface Options {
    name: string;
    initialConnectionString: string;
  }
}

export class JupyterLabSqlWidget extends BoxPanel {
  constructor(editorFactory: IEditorFactoryService, options: JupyterLabSqlWidget.Options) {
    super();
    this.name = options.name;
    this.id = 'jupyterlab-sql';
    this.title.label = 'SQL';
    this.title.closable = true;
    this.addClass('p-Sql-MainContainer');

    this.toolbarModel = new ToolbarModel(options.initialConnectionString);
    const connectionWidget = new ToolbarContainer();
    connectionWidget.model = this.toolbarModel;

    this.toolbarModel.connectionStringChanged.connect((_, value: string) => {
      this._connectionStringChanged.emit(value)
    })

    this.editorWidget = new Editor(editorFactory);
    this.responseWidget = new ResponseWidget();

    this.editorWidget.executeRequest.connect((_, value) => {
      const connectionString = this.toolbarModel.connectionString;
      this.updateGrid(connectionString, value);
    });
    this.settings = ServerConnection.makeSettings();

    this.addWidget(connectionWidget);
    this.addWidget(this.editorWidget);
    this.addWidget(this.responseWidget);
    BoxPanel.setSizeBasis(connectionWidget, 50);
    BoxPanel.setStretch(this.editorWidget, 1);
    BoxPanel.setStretch(this.responseWidget, 3);
  }

  readonly editorFactory: IEditorFactoryService;
  readonly editorWidget: Editor;
  readonly settings: ServerConnection.ISettings;
  readonly responseWidget: ResponseWidget;
  readonly toolbarModel: ToolbarModel;
  readonly name: string;
  private _lastRequestId: string;
  private _connectionStringChanged = new Signal<this, string>(this);

  get connectionStringChanged(): ISignal<this, string> {
    return this._connectionStringChanged
  }

  async updateGrid(connectionString: string, sql: string): Promise<void> {
    const url = URLExt.join(this.settings.baseUrl, '/jupyterlab-sql/query');
    const request: RequestInit = {
      method: 'POST',
      body: JSON.stringify({ connectionString, query: sql })
    };
    const thisRequestId = uuid.v4();
    this._lastRequestId = thisRequestId;
    this.toolbarModel.isLoading = true;
    const response = await ServerConnection.makeRequest(
      url,
      request,
      this.settings
    );
    const data = await response.json();
    if (this._lastRequestId === thisRequestId) {
      // Only update the response widget if the current
      // query is the last query that was dispatched.
      this.responseWidget.setResponse(data);
    }
    this.toolbarModel.isLoading = false;
  }

  onActivateRequest(msg: Message) {
    this.editorWidget.activate();
  }
}
