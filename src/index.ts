import * as uuid from 'uuid';

import {
  JupyterLab,
  JupyterLabPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  InstanceTracker
} from '@jupyterlab/apputils';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { ILauncher } from '@jupyterlab/launcher';

import { JupyterLabSqlWidget } from './widget';

import { createTracker } from './tracker';

import '../style/index.css';

function activate(
  app: JupyterLab,
  palette: ICommandPalette,
  launcher: ILauncher | null,
  editorServices: IEditorServices,
  restorer: ILayoutRestorer
) {
  const tracker: InstanceTracker<
    MainAreaWidget<JupyterLabSqlWidget>
    > = createTracker();
  const command: string = 'jupyterlab-sql:open';

  // restorer.restore(tracker, {
  //   command: command,
  //   args: widget => ({
  //     name: widget.content.name,
  //     connectionString: widget.content.toolbarModel.connectionString,
  //     sqlStatement: widget.content.sqlStatementValue
  //   }),
  //   name: widget => widget.content.name
  // });

  app.commands.addCommand(command, {
    label: ({ isPalette }) => (isPalette ? 'New SQL session' : 'SQL'),
    iconClass: 'p-Sql-DatabaseIcon',
    execute: ({ name, connectionString, sqlStatement }) => {
      const widgetName = <string>(name || uuid.v4());
      const initialConnectionString = <string>(
        (connectionString || 'postgres://localhost:5432/postgres')
      );
      const initialSqlStatement = <string>(sqlStatement || '');
      const widget = new JupyterLabSqlWidget(editorServices.factoryService, {
        name: widgetName,
        initialConnectionString,
        initialSqlStatement
      });
      const main = new MainAreaWidget({ content: widget });
      app.shell.addToMainArea(main);
      tracker.add(main);
    }
  });

  palette.addItem({ command, category: 'SQL', args: { isPalette: true } });

  if (launcher) {
    launcher.add({ command, category: 'Other' });
  }
}

/**
 * Initialization data for the jupyterlab-sql extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-sql',
  autoStart: true,
  requires: [ICommandPalette, ILauncher, IEditorServices, ILayoutRestorer],
  activate
};

export default extension;
