import * as uuid from 'uuid';

import { BoxPanel, Widget } from '@lumino/widgets';

import { Message } from '@lumino/messaging';

import { ISignal, Signal } from '@lumino/signaling';

import { DisposableSet } from '@lumino/disposable';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { Toolbar } from '@jupyterlab/apputils';

import * as Api from '../api';

import { JupyterLabSqlPage, PageName } from '../page';

import { proxyFor } from '../services';

import { Response, IResponse } from './response';

import { Editor, IEditor } from './editor';

import { QueryToolbar } from './toolbar';

namespace QueryPage {
  export interface IOptions {
    editorFactory: IEditorFactoryService;
    connectionUrl: string;
    initialSqlStatement: string;
  }
}

export class QueryPage implements JupyterLabSqlPage {
  constructor(options: QueryPage.IOptions) {
    this._onExecutionStarted = this._onExecutionStarted.bind(this);
    this._onExecutionFinished = this._onExecutionFinished.bind(this);
    this._content = new Content(options);
    this._toolbar = new QueryToolbar(options.connectionUrl);
    this._backButtonClicked = proxyFor(this._toolbar.backButtonClicked, this);
    this._sqlStatementChanged = proxyFor(
      this._content.sqlStatementChanged,
      this
    );
    this._content.executionStarted.connect(this._onExecutionStarted);
    this._content.executionFinished.connect(this._onExecutionFinished);
    this._disposables = DisposableSet.from([this._content, this._toolbar]);
  }

  get toolbar(): Toolbar {
    return this._toolbar;
  }

  get content(): Widget {
    return this._content;
  }

  get backButtonClicked(): ISignal<this, void> {
    return this._backButtonClicked;
  }

  get sqlStatementChanged(): ISignal<this, string> {
    return this._sqlStatementChanged;
  }

  get isDisposed() {
    return this._disposables.isDisposed;
  }

  dispose() {
    return this._disposables.dispose();
  }

  private _onExecutionStarted(): void {
    this._toolbar.setLoading(true);
  }

  private _onExecutionFinished(): void {
    this._toolbar.setLoading(false);
  }

  readonly pageName = PageName.CustomQuery;
  private readonly _content: Content;
  private readonly _toolbar: QueryToolbar;
  private readonly _disposables: DisposableSet;
  private readonly _backButtonClicked: Signal<this, void>;
  private readonly _sqlStatementChanged: Signal<this, string>;
}

class Content extends BoxPanel {
  constructor(options: QueryPage.IOptions) {
    super();

    this.addClass('p-Sql-MainContainer');

    this.editor = new Editor(
      options.initialSqlStatement,
      options.editorFactory
    );
    this.response = new Response();

    this.editor.execute.connect((_, value: string) => {
      this.updateGrid(options.connectionUrl, value);
    });
    this._sqlStatementChanged = proxyFor(this.editor.valueChanged, this);

    this.addWidget(this.editor.widget);
    this.addWidget(this.response.widget);
    BoxPanel.setStretch(this.editor.widget, 1);
    BoxPanel.setStretch(this.response.widget, 3);
  }

  get sqlStatementValue(): string {
    return this.editor.value;
  }

  get sqlStatementChanged(): ISignal<this, string> {
    return this._sqlStatementChanged;
  }

  get executionStarted(): ISignal<this, void> {
    return this._executionStarted;
  }

  get executionFinished(): ISignal<this, void> {
    return this._executionFinished;
  }

  onActivateRequest(_: Message) {
    this.editor.widget.activate();
  }

  private async updateGrid(connectionUrl: string, sql: string): Promise<void> {
    this._executionStarted.emit(void 0);
    const thisRequestId = uuid.v4();
    this._lastRequestId = thisRequestId;
    const data = await Api.getForQuery(connectionUrl, sql);
    if (this._lastRequestId === thisRequestId) {
      // Only update the response widget if the current
      // query is the last query that was dispatched.
      this.response.setResponse(data);
      this._executionFinished.emit(void 0);
    }
  }

  readonly editor: IEditor;
  readonly response: IResponse;
  private _lastRequestId: string;
  private readonly _sqlStatementChanged: ISignal<this, string>;
  private readonly _executionStarted: Signal<this, void> = new Signal(this);
  private readonly _executionFinished: Signal<this, void> = new Signal(this);
}
