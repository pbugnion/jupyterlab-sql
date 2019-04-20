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
    this.addClass('jp-MainAreaWidget');
    this.id = 'jupyterlab-sql';
    this.title.label = 'SQL';
    this.title.closable = true;
    const layout = new BoxLayout({ spacing: 0, direction: 'top-to-bottom' });
    const toolbar = createToolbar();
    const content = new Content(editorFactory, options)
    BoxLayout.setStretch(toolbar, 0)
    BoxLayout.setStretch(content, 1)
    layout.addWidget(toolbar)
    layout.addWidget(content);
    content.node.tabIndex = -1;
    this.layout = layout
  }
}

class Content extends SingletonPanel {
  constructor(editorFactory: IEditorFactoryService, options: JupyterLabSqlWidget.IOptions) {
    super();
    this.name = options.name;

    this.editorFactory = editorFactory;
    this._loadConnectionPage(options.initialConnectionString);
  }

  private _loadConnectionPage(initialConnectionString: string): void {
    const widget = new ConnectionPage({
      initialConnectionString
    });
    widget.connectDatabase.connect((_, connectionUrl) => {
      this._loadSummaryPage(connectionUrl)
    })
    this.widget = widget
  }

  private _loadSummaryPage(connectionUrl: string) {
    const widget = new DatabaseSummaryPage({ connectionUrl });
    widget.customQueryClicked.connect(() => {
      this._loadQueryPage(connectionUrl)
    })
    widget.navigateToTable.connect((_, tableName) => {
      this._loadTableSummaryPage(tableName)
    })
    this.widget = widget;
  }

  private _loadQueryPage(connectionUrl: string) {
    const options = {
      initialConnectionString: connectionUrl,
      initialSqlStatement: 'select * from t'
    }
    const widget = new QueryPage(this.editorFactory, options);
    this.widget = widget;
  }

  private _loadTableSummaryPage(tableName: string) {
    const widget = new TableSummaryPage({ tableName });
    this.widget = widget;
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
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
