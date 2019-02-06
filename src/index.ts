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

import { Message } from '@phosphor/messaging';


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
      return "";
    }
    return this._serializeData(this._data[row][column]);
  }

  _serializeData(data: any): any {
    const _type = typeof data
    if (_type === "object") {
      return JSON.stringify(data)
    }
    return data
  }
}


class TextResponseWidget extends Widget {
  constructor(message: string) {
    super();
    const element = document.createElement("div")
    const pre = document.createElement("pre")
    pre.innerHTML = message
    element.appendChild(pre);
    this.node.appendChild(element);
  }
}


class ResponseWidget extends Widget {
  constructor() {
    super();
    this.layout = new SingletonLayout();
  }

  readonly layout: SingletonLayout;
  private item: LayoutItem

  setCurrentWidget(widget: Widget) {
    this.layout.widget = widget
    this.item = new LayoutItem(this.layout.widget);
    this.fitCurrentWidget();
  }

  onResize(msg: Message) {
    if (this.item) {
      this.fitCurrentWidget()
    }
  }

  fitCurrentWidget() {
    this.item.update(
      0, 0,
      this.node.offsetWidth,
      this.node.offsetHeight
    )
  }

  setResponse(response: any) {
    const { responseType, responseData } = response;
    if (responseType === "error") {
      const { message } = responseData;
      const errorResponseWidget = new TextResponseWidget(message);
      this.setCurrentWidget(errorResponseWidget);
    } else if (responseType === "success") {
      const { hasRows } = responseData;
      if (hasRows) {
        const { keys, rows } = responseData;
        const model = new SqlDataModel(keys, rows)
        const gridWidget = new DataGrid();
        gridWidget.model = model;
        this.setCurrentWidget(gridWidget);
      } else {
        const message = "Command executed successfully";
        const errorResponseWidget = new TextResponseWidget(message);
        this.setCurrentWidget(errorResponseWidget);
      }
    }
  }
}


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

  onActivateRequest(msg: Message) {
    this.editorWidget.activate()
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
