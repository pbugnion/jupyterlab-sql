import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import {
  IEditorFactoryService, IEditorServices
} from '@jupyterlab/codeeditor';

import {
  ILauncher
} from '@jupyterlab/launcher';

import {
  BoxPanel
} from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

import {
  Editor
} from './Editor';

import {
  ConnectionInformationContainer, ConnectionInformationModel
} from './connectionInformation';

import {
  ResponseWidget
} from './response';


import '../style/index.css';


class JupyterLabSqlWidget extends BoxPanel {
  constructor(editorFactory: IEditorFactoryService) {
    super();
    this.id = "jupyterlab-sql";
    this.title.label = "SQL";
    this.title.closable = true;
    this.addClass("p-Sql-MainContainer");

    const connectionInformationModel = new ConnectionInformationModel();
    const connectionWidget = new ConnectionInformationContainer();
    connectionWidget.model = connectionInformationModel;

    this.editorWidget = new Editor(editorFactory);
    this.responseWidget = new ResponseWidget()
    
    this.editorWidget.executeRequest.connect((_, value) => {
      const connectionString = connectionInformationModel.connectionString;
      this.updateGrid(connectionString, value);
    })
    this.settings = ServerConnection.makeSettings();

    this.addWidget(connectionWidget);
    this.addWidget(this.editorWidget);
    this.addWidget(this.responseWidget);
    BoxPanel.setSizeBasis(connectionWidget, 50);
    BoxPanel.setStretch(this.editorWidget, 1);
    BoxPanel.setStretch(this.responseWidget, 3);
  }

  readonly editorFactory: IEditorFactoryService
  readonly editorWidget: Editor
  readonly settings: ServerConnection.ISettings
  readonly responseWidget: ResponseWidget

  updateGrid(connectionString: string, sql: string): void {
    console.log(sql)
    const url = URLExt.join(this.settings.baseUrl, "/jupyterlab-sql/query");
    const request: RequestInit = {
      method: 'POST',
      body: JSON.stringify({connectionString, "query": sql})
    }
    ServerConnection.makeRequest(url, request, this.settings)
      .then(response => response.json())
      .then(data => {
        this.responseWidget.setResponse(data);
      })
  }

  onActivateRequest(msg: Message) {
    this.editorWidget.activate()
  }
}


function activate(app: JupyterLab, palette: ICommandPalette, launcher: ILauncher | null, editorServices: IEditorServices) {
  const widget: JupyterLabSqlWidget = new JupyterLabSqlWidget(editorServices.factoryService)

  const command: string = "jupyterlab-sql:open";
  app.commands.addCommand(command, {
    label: ({ isPalette }) => isPalette ? "New SQL session" : "SQL",
    iconClass: "p-Sql-DatabaseIcon",
    execute: () => {
      if (!widget.isAttached) {
        app.shell.addToMainArea(widget);
      }
      widget.update();
      app.shell.activateById(widget.id);
    }
  })

  palette.addItem({ command, category: "SQL", args: { isPalette: true }});

  if (launcher) {
    launcher.add({ command, category: "Other" })
  }
}


/**
 * Initialization data for the jupyterlab-sql extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-sql',
  autoStart: true,
  requires: [ICommandPalette, ILauncher, IEditorServices],
  activate,
};

export default extension;
