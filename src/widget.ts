import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { SingletonPanel } from './components';

import { QueryPage } from './queryPage';

import { ConnectionPage } from './connectionPage';

import { DatabaseSummaryPage } from './databaseSummary';


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
    const widget = new ConnectionPage({
      initialConnectionString: options.initialConnectionString
    })
    widget.connectDatabase.connect((_, connectionUrl) => {
      const widget = new DatabaseSummaryPage({ connectionUrl });
      widget.customQueryClicked.connect(() => {
        const options = {
          initialConnectionString: connectionUrl,
          initialSqlStatement: 'select * from t'
        }
        const widget = new QueryPage(editorFactory, options)
        this.widget = widget
      })
      this.widget = widget
    })
    this.widget = widget
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
}
