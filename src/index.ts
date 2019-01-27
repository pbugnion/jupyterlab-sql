import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import {
  IEditorFactoryService, CodeEditor, IEditorServices
} from '@jupyterlab/codeeditor';

import {
  SplitPanel, Widget
} from '@phosphor/widgets';

import {
  Message
} from '@phosphor/messaging';

import {
  DataModel, DataGrid
} from '@phosphor/datagrid';

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


class JupyterLabSqlWidget extends SplitPanel {
  constructor(editorFactory: IEditorFactoryService) {
    super({orientation: 'vertical'});

    this.id = "jupyterlab-sql";
    this.title.label = "SQL";
    this.title.closable = true;
    this.editorFactory = editorFactory;
    const editorWidget = new Widget();
    const model = new CodeEditor.Model();
    this.editorFactory.newInlineEditor({model, host: editorWidget.node});
    this.addWidget(editorWidget);
    this.grid = new DataGrid();
    this.addWidget(this.grid);
    this.setRelativeSizes([1, 3]);
  }

  // readonly elem: HTMLElement
  readonly editorFactory: IEditorFactoryService
  grid: null | DataGrid

  onUpdateRequest(message: Message): void {
    fetch("/jupyterlab_sql")
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
