import { Widget, BoxLayout } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { Toolbar } from '@jupyterlab/apputils';

import { SingletonPanel } from './components';

import { QueryPage } from './query';

import { ConnectionPage } from './connectionPage';

import { DatabaseSummaryPage } from './databaseSummary';

import { TableSummaryPage } from './tableSummary';

import { JupyterLabSqlPage, PageName } from './page';

namespace JupyterLabSqlWidget {
  export interface IOptions {
    name: string;
    pageName: PageName;
    connectionUrl: string;
    tableName: string;
  }
}

export class JupyterLabSqlWidget extends Widget {
  constructor(editorFactory: IEditorFactoryService, options: JupyterLabSqlWidget.IOptions) {
    super()

    // TODO bring out widget definition into separate methods
    // TODO: Disconnect signals on page change
    this.addClass('jp-MainAreaWidget');
    this.id = 'jupyterlab-sql';
    this.title.label = 'SQL';
    this.title.closable = true;
    const layout = new BoxLayout({ spacing: 0, direction: 'top-to-bottom' });
    this.content = new SingletonPanel()
    BoxLayout.setStretch(this.content, 1)
    layout.addWidget(this.content);
    this.content.node.tabIndex = -1;
    this.layout = layout

    this.name = options.name;
    this.pageName = options.pageName;
    this._connectionUrl = options.connectionUrl;
    this._tableName = options.tableName;
    this.editorFactory = editorFactory;
    this._setInitialPage()
  }

  get connectionUrl(): string {
    return this._connectionUrl;
  }

  get tableName(): string {
    return this._tableName;
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
    if (this._toolbar !== null) {
      this._toolbar.parent = null;
      this._toolbar.dispose();
    }
    this._toolbar = newToolbar;
    BoxLayout.setStretch(this._toolbar, 0);
    (<BoxLayout>this.layout).insertWidget(0, this._toolbar)
  }

  private set page(newPage: JupyterLabSqlPage) {
    this.content.widget = newPage.content;
    this.toolbar = newPage.toolbar
    this.pageName = newPage.pageName
    this._pageChanged.emit(void 0)
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
    // TODO: Don't hardcode initial statement
    const options = {
      connectionUrl: this._connectionUrl,
      initialSqlStatement: 'select * from t',
      editorFactory: this.editorFactory
    }
    this.page = new QueryPage(options);
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

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
  pageName: PageName;

  private _connectionUrl: string;
  private _tableName: string;
  private _toolbar: Toolbar | null = null;
  private readonly content: SingletonPanel

  private readonly _pageChanged: Signal<this, void> = new Signal(this);
  private readonly _connectionUrlChanged: Signal<this, string> = new Signal(this);
  private readonly _tableNameChanged: Signal<this, string> = new Signal(this);
}
