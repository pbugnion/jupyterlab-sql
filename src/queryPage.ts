import * as uuid from 'uuid';

import { BoxPanel, Widget } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { ISignal, Signal } from '@phosphor/signaling';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { Toolbar } from '@jupyterlab/apputils';

import { newToolbar, IToolbarModel, ToolbarModel } from './toolbar';

import { Response, IResponse } from './response';

import { Editor, IEditor } from './editor';

import { Api } from './api';

import { JupyterLabSqlPage, PageName } from './page';

namespace QueryPage {
  export interface IOptions {
    editorFactory: IEditorFactoryService,
    initialConnectionString: string;
    initialSqlStatement: string;
  }
}

export class QueryPage implements JupyterLabSqlPage {
  constructor(options: QueryPage.IOptions) {
    this._content = new Content(options)
  }

  get content(): Widget {
    return this._content
  }

  readonly pageName = PageName.CustomQuery
  readonly toolbar: Toolbar = new Toolbar()
  private readonly _content: Content
}

class Content extends BoxPanel {
  constructor(options: QueryPage.IOptions) {
    super();

    this.addClass('p-Sql-MainContainer')

    const toolbarModel = new ToolbarModel(options.initialConnectionString);
    this.toolbarModel = toolbarModel;
    const connectionWidget = newToolbar(toolbarModel);

    this.toolbarModel.connectionStringChanged.connect((_, value: string) => {
      this._connectionStringChanged.emit(value);
    });

    this.editor = new Editor(options.initialSqlStatement, options.editorFactory);
    this.response = new Response();

    this.editor.execute.connect((_, value: string) => {
      const connectionString = this.toolbarModel.connectionString;
      this.updateGrid(connectionString, value);
    });
    this.editor.valueChanged.connect((_, value) => {
      this._sqlStatementChanged.emit(value);
    });

    this.addWidget(connectionWidget);
    this.addWidget(this.editor.widget);
    this.addWidget(this.response.widget);
    BoxPanel.setSizeBasis(connectionWidget, 50);
    BoxPanel.setStretch(this.editor.widget, 1);
    BoxPanel.setStretch(this.response.widget, 3);
  }

  readonly editor: IEditor;
  readonly response: IResponse;
  readonly toolbarModel: IToolbarModel;
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
      this.response.setResponse(data);
    }
    this.toolbarModel.isLoading = false;
  }

  onActivateRequest(msg: Message) {
    this.editor.widget.activate();
  }
}
