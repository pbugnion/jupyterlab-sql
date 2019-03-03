import * as uuid from 'uuid';

import { BoxPanel } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { ISignal, Signal } from '@phosphor/signaling';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { ToolbarContainer, ToolbarModel } from './toolbar';

import { ResponseWidget } from './response';

import { Editor, IEditor } from './editor';

import { Api } from './api';

namespace JupyterLabSqlWidget {
  export interface Options {
    name: string;
    initialConnectionString: string;
    initialSqlStatement: string;
  }
}

export class JupyterLabSqlWidget extends BoxPanel {
  constructor(
    editorFactory: IEditorFactoryService,
    options: JupyterLabSqlWidget.Options
  ) {
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
      this._connectionStringChanged.emit(value);
    });

    this.editor = new Editor(options.initialSqlStatement, editorFactory);
    this.responseWidget = new ResponseWidget();

    this.editor.execute.connect((_, value: string) => {
      const connectionString = this.toolbarModel.connectionString;
      this.updateGrid(connectionString, value);
    });
    this.editor.valueChanged.connect((_, value) => {
      this._sqlStatementChanged.emit(value);
    });

    this.addWidget(connectionWidget);
    this.addWidget(this.editor.widget);
    this.addWidget(this.responseWidget);
    BoxPanel.setSizeBasis(connectionWidget, 50);
    BoxPanel.setStretch(this.editor.widget, 1);
    BoxPanel.setStretch(this.responseWidget, 3);
  }

  readonly editorFactory: IEditorFactoryService;
  readonly editor: IEditor;
  readonly responseWidget: ResponseWidget;
  readonly toolbarModel: ToolbarModel;
  readonly name: string;
  private _lastRequestId: string;
  private _connectionStringChanged = new Signal<this, string>(this);
  private _sqlStatementChanged = new Signal<this, string>(this);

  get connectionStringChanged(): ISignal<this, string> {
    return this._connectionStringChanged;
  }

  get sqlStatementChanged(): ISignal<this, string> {
    return this._sqlStatementChanged;
  }

  get sqlStatementValue(): string {
    return this.editor.value;
  }

  async updateGrid(connectionString: string, sql: string): Promise<void> {
    const thisRequestId = uuid.v4();
    this._lastRequestId = thisRequestId;
    this.toolbarModel.isLoading = true;
    const data = await Api.getForQuery(connectionString, sql);
    if (this._lastRequestId === thisRequestId) {
      // Only update the response widget if the current
      // query is the last query that was dispatched.
      this.responseWidget.setResponse(data);
    }
    this.toolbarModel.isLoading = false;
  }

  onActivateRequest(msg: Message) {
    this.editor.widget.activate();
  }
}
