import { IEditorFactoryService } from '@jupyterlab/codeeditor';

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


export class JupyterLabSqlWidget extends SingletonPanel {
  constructor(editorFactory: IEditorFactoryService, options: JupyterLabSqlWidget.IOptions) {
    super();
    this.name = options.name;
    this.id = 'jupyterlab-sql';
    this.title.label = 'SQL';
    this.title.closable = true;

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
    console.log(`loading ${tableName}`)
    const widget = new TableSummaryPage();
    this.widget = widget;
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
}
