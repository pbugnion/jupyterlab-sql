import * as uuid from "uuid";

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
  ToolbarContainer, ToolbarModel
} from './toolbar';

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

    this.toolbarModel = new ToolbarModel();
    const connectionWidget = new ToolbarContainer();
    connectionWidget.model = this.toolbarModel;

    this.editorWidget = new Editor(editorFactory);
    this.responseWidget = new ResponseWidget()
    
    this.editorWidget.executeRequest.connect((_, value) => {
      const connectionString = this.toolbarModel.connectionString;
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
  readonly toolbarModel: ToolbarModel
  private _lastRequestId: string

  async updateGrid(connectionString: string, sql: string): Promise<void> {
    const url = URLExt.join(this.settings.baseUrl, "/jupyterlab-sql/query");
    const request: RequestInit = {
      method: 'POST',
      body: JSON.stringify({connectionString, "query": sql})
    }
    const thisRequestId = uuid.v4();
    this._lastRequestId = thisRequestId;
    this.toolbarModel.isLoading = true;
    const response = await ServerConnection.makeRequest(url, request, this.settings)
    const data = await response.json()
    if (this._lastRequestId === thisRequestId) {
      // Only update the response widget if the current
      // query is the last query that was dispatched.
      this.responseWidget.setResponse(data);
    }
    this.toolbarModel.isLoading = false;
  }

  onActivateRequest(msg: Message) {
    this.editorWidget.activate()
  }
}


function activate(app: JupyterLab, palette: ICommandPalette, launcher: ILauncher | null, editorServices: IEditorServices) {

  const command: string = "jupyterlab-sql:open";
  app.commands.addCommand(command, {
    label: ({ isPalette }) => isPalette ? "New SQL session" : "SQL",
    iconClass: "p-Sql-DatabaseIcon",
    execute: () => {
      const widget: JupyterLabSqlWidget = new JupyterLabSqlWidget(
        editorServices.factoryService)
      app.shell.addToMainArea(widget);
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
