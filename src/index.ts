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
  BoxPanel
} from '@phosphor/widgets';

import {
  DataModel, DataGrid
} from '@phosphor/datagrid';

import {
  Editor
} from './Editor';

import {
  ConnectionInformationContainer, ConnectionInformationModel
} from './connectionInformation';


import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

import '../style/index.css';


class SqlDataModel extends DataModel {
  constructor(keys: any, data: any) {
    super()
    this._data = data
    this._keys = keys
  }

  readonly _data: any
  readonly _keys: any

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._data.length : 1
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? this._keys.length : 1
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === "row-header") {
      return row;
    }
    if (region === "column-header") {
      return this._keys[column];
    }
    if (region === "corner-header") {
      return "c";
    }
    return this._data[row][column];
  }
}


class JupyterLabSqlWidget extends BoxPanel {
  constructor(editorFactory: IEditorFactoryService) {
    super();
    this.id = "jupyterlab-sql";
    this.title.label = "SQL";
    this.title.closable = true;

    const connectionInformationModel = new ConnectionInformationModel();
    const connectionWidget = new ConnectionInformationContainer();
    connectionWidget.model = connectionInformationModel;

    const editorWidget = new Editor(editorFactory);
    this.grid = new DataGrid();
    editorWidget.executeRequest.connect((sender, value) => {
      this.updateGrid(value);
    })
    this.settings = ServerConnection.makeSettings();

    this.addWidget(connectionWidget);
    this.addWidget(editorWidget);
    this.addWidget(this.grid);
    BoxPanel.setSizeBasis(connectionWidget, 50);
    BoxPanel.setStretch(editorWidget, 1);
    BoxPanel.setStretch(this.grid, 3);
  }

  // readonly elem: HTMLElement
  readonly editorFactory: IEditorFactoryService
  readonly settings: ServerConnection.ISettings
  grid: null | DataGrid

  updateGrid(sql: string): void {
    console.log(sql)
    const url = URLExt.join(this.settings.baseUrl, "/jupyterlab_sql");
    const request: RequestInit = {
      method: 'POST',
      body: JSON.stringify({"query": sql})
    }
    ServerConnection.makeRequest(url, request, this.settings)
      .then(response => response.json())
      .then(data => {
        const { result } = data;
        const { keys, rows } = result;
        const model = new SqlDataModel(keys, rows)
        this.grid.model = model;
      })
  }
}


function activate(app: JupyterLab, palette: ICommandPalette, editorServices: IEditorServices) {
  const widget: JupyterLabSqlWidget = new JupyterLabSqlWidget(editorServices.factoryService)

  const command: string = "jupyterlab-sql:open";
  app.commands.addCommand(command, {
    label: "SQL",
    execute: () => {
      if (!widget.isAttached) {
        app.shell.addToMainArea(widget);
      }
      widget.update();
      app.shell.activateById(widget.id);
    }
  })

  palette.addItem({ command, category: "SQL" });
}


/**
 * Initialization data for the jupyterlab-sql extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-sql',
  autoStart: true,
  requires: [ICommandPalette, IEditorServices],
  activate,
};

export default extension;
