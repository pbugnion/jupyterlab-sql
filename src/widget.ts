import { Widget, BoxLayout } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { Toolbar } from '@jupyterlab/apputils';

import { SingletonPanel } from './components';

import { QueryPage } from './query';

import { ConnectionPage } from './connection';

import { DatabaseSummaryPage } from './databaseSummary';

import { TableSummaryPage } from './tableSummary';

import { JupyterLabSqlPage, PageName } from './page';

namespace JupyterLabSqlWidget {
  export interface IOptions {
    name: string;
    pageName: PageName;
    connectionUrl: string;
    tableName: string;
    sqlStatement: string;
  }
}

export class JupyterLabSqlWidget extends Widget {
  constructor(editorFactory: IEditorFactoryService, options: JupyterLabSqlWidget.IOptions) {
    super()

    // TODO: Disconnect signals on page change
    this.addClass('jp-MainAreaWidget');
    this.id = 'jupyterlab-sql';
    this._configureTitle()

    this.content = new SingletonPanel()
    this.layout = this._createWidgetLayout();

    this.name = options.name;
    this.pageName = options.pageName;
    this._connectionUrl = options.connectionUrl;
    this._tableName = options.tableName;
    this._sqlStatement = options.sqlStatement;
    this.editorFactory = editorFactory;
    this._setInitialPage()
  }

  get connectionUrl(): string {
    return this._connectionUrl;
  }

  get tableName(): string {
    return this._tableName;
  }

  get sqlStatement(): string {
    return this._sqlStatement
  }

  get pageChanged(): ISignal<this, void> {
    return this._pageChanged;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  get tableNameChanged(): ISignal<this, string> {
    return this._tableNameChanged;
  }

  get sqlStatementChanged(): ISignal<this, string> {
    return this._sqlStatementChanged;
  }

  onActivateRequest(): void {
    this._focusContent()
  }

  onCloseRequest(): void {
    this.dispose();
  }

  private _createWidgetLayout(): BoxLayout {
    const layout = new BoxLayout({ spacing: 0, direction: 'top-to-bottom' });
    BoxLayout.setStretch(this.content, 1)
    layout.addWidget(this.content);
    this.content.node.tabIndex = -1;
    return layout
  }

  private _configureTitle(): void {
    this.title.label = 'SQL';
    this.title.closable = true;
  }

  private _setInitialPage(): void {
    if (this.pageName === PageName.Connection) {
      this._loadConnectionPage()
    } else if (this.pageName === PageName.DatabaseSummary) {
      this._loadSummaryPage()
    } else if (this.pageName === PageName.TableSummary) {
      this._loadTableSummaryPage()
    } else {
      this._loadQueryPage()
    }
  }

  private set toolbar(newToolbar: Toolbar) {
    this._toolbar = newToolbar;
    BoxLayout.setStretch(this._toolbar, 0);
    (<BoxLayout>this.layout).insertWidget(0, this._toolbar)
  }

  private set page(newPage: JupyterLabSqlPage) {
    const oldPage = this._page;
    if (oldPage !== newPage) {
      this.content.widget = newPage.content;
      this.toolbar = newPage.toolbar
      this.pageName = newPage.pageName
      this._page = newPage
      this._pageChanged.emit(void 0)
      if (oldPage !== null) {
        oldPage.dispose()
      }
      this.content.activate();
    }
  }

  private _setConnectionUrl(newConnectionUrl: string): void {
    if (newConnectionUrl !== this._connectionUrl) {
      this._connectionUrl = newConnectionUrl;
      this._connectionUrlChanged.emit(this._connectionUrl);
    }
  }

  private _setTableName(newTableName: string): void {
    if (newTableName !== this._tableName) {
      this._tableName = newTableName;
      this._tableNameChanged.emit(this._tableName);
    }
  }

  private _setSqlStatement(newStatement: string): void {
    if (newStatement !== this._sqlStatement) {
      this._sqlStatement = newStatement;
      this._sqlStatementChanged.emit(this._sqlStatement);
    }
  }

  private _loadConnectionPage(): void {
    const initialConnectionString = this._connectionUrl
    const page = new ConnectionPage({
      initialConnectionString
    });
    page.connectDatabase.connect((_, connectionUrl) => {
      this._setConnectionUrl(connectionUrl)
      this._loadSummaryPage()
    })
    page.connectionUrlChanged.connect((_, connectionUrl) => {
      this._setConnectionUrl(connectionUrl)
    })
    this.page = page
  }

  private _loadSummaryPage() {
    const connectionUrl: string = this._connectionUrl;
    const page = new DatabaseSummaryPage({ connectionUrl });
    page.customQueryClicked.connect(() => {
      this._loadQueryPage()
    })
    page.navigateToTable.connect((_, tableName) => {
      this._setTableName(tableName);
      this._loadTableSummaryPage()
    })
    page.navigateBack.connect(() => {
      this._loadConnectionPage()
    })
    this.page = page;
  }

  private _loadQueryPage() {
    const options = {
      connectionUrl: this._connectionUrl,
      initialSqlStatement: this._sqlStatement,
      editorFactory: this.editorFactory
    }
    const page = new QueryPage(options);
    page.backButtonClicked.connect(() => {
      this._loadSummaryPage()
    })
    page.sqlStatementChanged.connect((_, newStatement) => {
      this._setSqlStatement(newStatement)
    })
    this.page = page
  }

  private _loadTableSummaryPage() {
    const tableName = this._tableName;
    const connectionUrl = this._connectionUrl;
    const page = new TableSummaryPage({ connectionUrl, tableName });
    page.navigateBack.connect(() => {
      this._loadSummaryPage();
    })
    this.page = page
  }

  /**
   * Give focus to the content.
   */
  private _focusContent(): void {
    // Focus the content node if we aren't already focused on it or a
    // descendent.
    if (!this.content.node.contains(document.activeElement)) {
      this.content.node.focus();
    }

    // Activate the content asynchronously (which may change the focus).
    this.content.activate();
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
  pageName: PageName;

  private _connectionUrl: string;
  private _tableName: string;
  private _toolbar: Toolbar | null = null;
  private _sqlStatement: string = '';
  private _page: JupyterLabSqlPage | null = null;
  private readonly content: SingletonPanel

  private readonly _pageChanged: Signal<this, void> = new Signal(this);
  private readonly _connectionUrlChanged: Signal<this, string> = new Signal(this);
  private readonly _tableNameChanged: Signal<this, string> = new Signal(this);
  private readonly _sqlStatementChanged: Signal<this, string> = new Signal(this);
}
