import * as uuid from 'uuid';

import {
  JupyterLab,
  JupyterLabPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  InstanceTracker,
} from '@jupyterlab/apputils';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { ILauncher } from '@jupyterlab/launcher';

import { JupyterLabSqlWidget } from './widget';

import { createTracker } from './tracker';

import { PageName } from './page';

import '../style/index.css';

function activate(
  app: JupyterLab,
  palette: ICommandPalette,
  launcher: ILauncher | null,
  editorServices: IEditorServices,
  restorer: ILayoutRestorer
) {
  const tracker: InstanceTracker<JupyterLabSqlWidget> = createTracker();
  const command: string = 'jupyterlab-sql:open';

  restorer.restore(tracker, {
    command,
    args: widget => ({
      initialWidgetName: widget.name,
      initialPageName: widget.pageName,
      initialConnectionUrl: widget.connectionUrl,
      initialTableName: widget.tableName
    }),
    name: widget => widget.name
  })

  app.commands.addCommand(command, {
    label: ({ isPalette }) => (isPalette ? 'New SQL session' : 'SQL'),
    iconClass: 'p-Sql-DatabaseIcon',
    execute: ({ initialWidgetName, initialPageName, initialConnectionUrl, initialTableName }) => {
      const name = <string>(initialWidgetName || uuid.v4());
      const pageName = <PageName>(initialPageName || PageName.Connection);
      const connectionUrl = <string>(initialConnectionUrl || 'postgres://localhost:5432/postgres');
      const tableName = <string>(initialTableName || '');
      console.log({ tableName })
      const widget = new JupyterLabSqlWidget(editorServices.factoryService, {
        name,
        pageName,
        connectionUrl,
        tableName
      });
      app.shell.addToMainArea(widget);
      tracker.add(widget);
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
