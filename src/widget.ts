import { Widget, BoxLayout } from '@phosphor/widgets';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { Toolbar } from '@jupyterlab/apputils';

import { SingletonPanel } from './components';

import { QueryPage } from './queryPage';

import { ConnectionPage } from './connectionPage';

import { DatabaseSummaryPage } from './databaseSummary';

import { TableSummaryPage } from './tableSummary';
import { JupyterLabSqlPage } from './page';


namespace JupyterLabSqlWidget {
  export interface IOptions {
    name: string;
    initialConnectionString: string;
    initialSqlStatement: string
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
    this.editorFactory = editorFactory;
    this._loadConnectionPage(options.initialConnectionString);
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
  }

  private _loadConnectionPage(initialConnectionString: string): void {
    const page = new ConnectionPage({
      initialConnectionString
    });
    page.connectDatabase.connect((_, connectionUrl) => {
      this._loadSummaryPage(connectionUrl)
    })
    this.page = page
  }

  private _loadSummaryPage(connectionUrl: string) {
    const page = new DatabaseSummaryPage({ connectionUrl });
    page.customQueryClicked.connect(() => {
      this._loadQueryPage(connectionUrl)
    })
    page.navigateToTable.connect((_, tableName) => {
      this._loadTableSummaryPage(tableName)
    })
    page.navigateBack.connect(() => {
      this._loadConnectionPage(connectionUrl)
    })
    this.page = page;
  }

  private _loadQueryPage(connectionUrl: string) {
    const options = {
      initialConnectionString: connectionUrl,
      initialSqlStatement: 'select * from t',
      editorFactory: this.editorFactory
    }
    this.page = new QueryPage(options);
  }

  private _loadTableSummaryPage(tableName: string) {
    this.page = new TableSummaryPage({ tableName });
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
  private _toolbar: Toolbar | null = null;
  private readonly content: SingletonPanel
}
