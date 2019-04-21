import { Widget, BoxLayout } from '@phosphor/widgets';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { Toolbar, ToolbarButton } from '@jupyterlab/apputils';

import { SingletonPanel } from './components';

import { QueryPage } from './queryPage';

import { ConnectionPage } from './connectionPage';

import { DatabaseSummaryPage } from './databaseSummary';

import { TableSummaryPage } from './tableSummary';


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
    const toolbar = createToolbar();
    this.content = new SingletonPanel()
    BoxLayout.setStretch(toolbar, 0)
    BoxLayout.setStretch(this.content, 1)
    layout.addWidget(toolbar)
    layout.addWidget(this.content);
    this.content.node.tabIndex = -1;
    this.layout = layout

    this.name = options.name;
    this.editorFactory = editorFactory;
    this._loadConnectionPage(options.initialConnectionString);
  }

  private _loadConnectionPage(initialConnectionString: string): void {
    const page = new ConnectionPage({
      initialConnectionString
    });
    page.connectDatabase.connect((_, connectionUrl) => {
      this._loadSummaryPage(connectionUrl)
    })
    this.content.widget = page.content
  }

  private _loadSummaryPage(connectionUrl: string) {
    const page = new DatabaseSummaryPage({ connectionUrl });
    page.customQueryClicked.connect(() => {
      this._loadQueryPage(connectionUrl)
    })
    page.navigateToTable.connect((_, tableName) => {
      this._loadTableSummaryPage(tableName)
    })
    this.content.widget = page.content;
  }

  private _loadQueryPage(connectionUrl: string) {
    const options = {
      initialConnectionString: connectionUrl,
      initialSqlStatement: 'select * from t',
      editorFactory: this.editorFactory
    }
    const page = new QueryPage(options);
    this.content.widget = page.content;
  }

  private _loadTableSummaryPage(tableName: string) {
    const page = new TableSummaryPage({ tableName });
    this.content.widget = page.content;
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
  private readonly content: SingletonPanel
}


function createToolbar() {
  const _toolbar = new Toolbar();
  const b = new ToolbarButton({ label: 'button' });
  const s = Toolbar.createSpacerItem();
  const w = new Widget();
  w.node.innerHTML = 'hello'
  _toolbar.addItem('some-button', b)
  _toolbar.addItem('s', s)
  _toolbar.addItem('some-name', w)
  return _toolbar
}
