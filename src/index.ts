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
  BoxPanel, SingletonLayout, Widget, LayoutItem
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


// @ts-ignore
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


class ErrorResponseWidget extends Widget {
  constructor() {
    super();
    const element = document.createElement("div")
    this._pre = document.createElement("pre")
    element.appendChild(this._pre);
    this.node.appendChild(element);
  }

  private _pre: HTMLElement

  setValue(newValue: string): void {
    this._pre.innerHTML = newValue;
  }
}


class ResponseWidget extends Widget {
  constructor() {
    super();
    this.gridWidget = new DataGrid();
    this.errorResponseWidget = new ErrorResponseWidget();
    this.layout = new SingletonLayout();
    this.layout.widget = this.errorResponseWidget;
  }

  // @ts-ignore
  private readonly gridWidget: DataGrid;
  // @ts-ignore
  private readonly errorResponseWidget: ErrorResponseWidget;
  readonly layout: SingletonLayout;

  setResponse(response: any) {
    const { responseType, responseData } = response;
    if (responseType === "error") {
      this.errorResponseWidget.setValue(JSON.stringify(response))
    } else if (responseType === "success") {
      const { keys, rows } = responseData;
      const model = new SqlDataModel(keys, rows)
      this.gridWidget.model = model;
      this.layout.widget = this.gridWidget;
      const item = new LayoutItem(this.layout.widget);
      item.update(
        0, 0,
        this.parent!.node.offsetWidth,
        this.parent!.node.offsetHeight
      );
    }
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
    this.responseWidget = new ResponseWidget()
    
    editorWidget.executeRequest.connect((_, value) => {
      const connectionString = connectionInformationModel.connectionString;
      this.updateGrid(connectionString, value);
    })
    this.settings = ServerConnection.makeSettings();

    this.addWidget(connectionWidget);
    this.addWidget(editorWidget);
    this.addWidget(this.responseWidget);
    BoxPanel.setSizeBasis(connectionWidget, 50);
    BoxPanel.setStretch(editorWidget, 1);
    BoxPanel.setStretch(this.responseWidget, 3);
  }

  readonly editorFactory: IEditorFactoryService
  readonly settings: ServerConnection.ISettings
  readonly responseWidget: ResponseWidget

  updateGrid(connectionString: string, sql: string): void {
    console.log(sql)
    const url = URLExt.join(this.settings.baseUrl, "/jupyterlab_sql");
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
