import { Widget, BoxLayout } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { Toolbar } from '@jupyterlab/apputils';

import { SingletonPanel } from './components';

import { QueryPage } from './queryPage';

import { ConnectionPage } from './connectionPage';

import { DatabaseSummaryPage } from './databaseSummary';

import { TableSummaryPage } from './tableSummary';

import { JupyterLabSqlPage, PageName } from './page';

namespace JupyterLabSqlWidget {
  export interface IOptions {
    name: string;
    pageName: PageName;
    connectionUrl: string;
  }
}

export class JupyterLabSqlWidget extends Widget {
  constructor(editorFactory: IEditorFactoryService, options: JupyterLabSqlWidget.IOptions) {
    super()

    // TODO bring out widget definition into separate methods
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
    this.editorFactory = editorFactory;
    this._connectionUrl = options.connectionUrl;
    this._setInitialPage()
  }

  get connectionUrl(): string {
    return this._connectionUrl;
  }

  get pageChanged(): ISignal<this, void> {
    return this._pageChanged;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
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
    this._connectionUrl = newConnectionUrl;
    this._connectionUrlChanged.emit(this._connectionUrl);
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
      this._loadTableSummaryPage()
    })
    page.navigateBack.connect(() => {
      this._loadConnectionPage()
    })
    this.page = page;
  }

  private _loadQueryPage() {
    // TODO: Don't hardcode URL
    const connectionUrl = 'postgres://localhost:5432/postgres';
    const options = {
      initialConnectionString: connectionUrl,
      initialSqlStatement: 'select * from t',
      editorFactory: this.editorFactory
    }
    this.page = new QueryPage(options);
  }

  private _loadTableSummaryPage() {
    // TODO don't hard-code table name
    const tableName: string = 'account';
    this.page = new TableSummaryPage({ tableName });
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
  pageName: PageName;

  private _connectionUrl: string;
  private _toolbar: Toolbar | null = null;
  private readonly content: SingletonPanel

  private readonly _pageChanged: Signal<this, void> = new Signal(this);
  private readonly _connectionUrlChanged: Signal<this, string> = new Signal(this);
}
