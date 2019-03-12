import { Clipboard } from '@jupyterlab/apputils';

import { Menu, Widget } from '@phosphor/widgets';

import { DataGrid, DataModel, TextRenderer, CellRenderer } from '@phosphor/datagrid'

import { CommandRegistry } from '@phosphor/commands';

import { DataGridExtensions } from './services'

namespace Options {
  export const unselectedBackgroundColor = 'white';
  export const selectedBackgroundColor = '#2196f3';
  export const unselectedTextColor = 'black';
  export const selectedTextColor = 'white';
}

namespace CommandIds {
  export const copyToClipboard = 'copy-selection-to-clipboard'
}

export class ResponseTable {
  constructor(model: DataModel) {
    this._grid = new DataGrid()
    this._grid.model = model
    this._selectionManager = new DataGridExtensions.SelectionManager(model)
    this._onClick = this._onClick.bind(this)
    this._onContextMenu = this._onContextMenu.bind(this)
    this._updateRenderers()

    this._selectionManager.selectionChanged.connect(() => {
      this._updateRenderers()
    })

    this._menu = this._createContextMenu();

    DataGridExtensions.addMouseEventListener(
      'click',
      this._grid,
      this._onClick
    )

    DataGridExtensions.addMouseEventListener(
      'contextmenu',
      this._grid,
      this._onContextMenu
    )
  }

  static fromKeysRows(keys: Array<string>, data: Array<Array<any>>): ResponseTable {
    const model = new ResponseTableDataModel(keys, data)
    return new ResponseTable(model);
  }

  private _onClick(event: DataGridExtensions.GridMouseEvent) {
    const { row, column } = event;
    this._updateSelection(row, column)
  }

  private _onContextMenu(event: DataGridExtensions.GridMouseEvent) {
    const { row, column, rawEvent } = event;
    this._updateSelection(row, column)
    if (this._isInBody(row, column)) {
      this._menu.open(rawEvent.clientX, rawEvent.clientY)
      rawEvent.preventDefault()
    }
  }

  private _updateSelection(row: DataGridExtensions.Row, column: DataGridExtensions.Column) {
    if (this._isInBody(row, column)) {
      this._selectionManager.selection = {
        rowIndex: row.index,
        columnIndex: column.index
      }
    } else {
      this._selectionManager.selection = null
    }
  }

  private _isInBody(row: DataGridExtensions.Row, column: DataGridExtensions.Column) {
    return (
      row.section === 'row' &&
        column.section === 'column' &&
        row.index !== null &&
        column.index !== null
    )
  }

  private _updateRenderers(): void {
    const renderer = this._textRendererForSelection(this._selectionManager.selection)
    this._grid.cellRenderers.set('body', {}, renderer)
  }

  private _textRendererForSelection(selectedCell: DataGridExtensions.BodyCellIndex | null): CellRenderer {
    let backgroundColor;
    let textColor;
    if (selectedCell === null) {
      backgroundColor = Options.unselectedBackgroundColor;
      textColor = Options.unselectedTextColor;
    } else {
      const selectedRow = selectedCell.rowIndex
      const selectedColumn = selectedCell.columnIndex
      backgroundColor = ({ row, column }: CellRenderer.ICellConfig) => {
        if (row === selectedRow && column === selectedColumn) {
          return Options.selectedBackgroundColor;
        } else {
          return Options.unselectedBackgroundColor;
        }
      }
      textColor = ({ row, column }: CellRenderer.ICellConfig) => {
        if (row === selectedRow && column === selectedColumn) {
          return Options.selectedTextColor;
        } else {
          return Options.unselectedTextColor;
        }
      }
    }
    return new TextRenderer({ backgroundColor, textColor })
  }

  get widget(): Widget {
    return this._grid
  }

  private _createContextMenu(): Menu {
    const commands = new CommandRegistry()
    commands.addCommand(CommandIds.copyToClipboard, {
      label: 'Copy cell',
      iconClass: 'jp-MaterialIcon jp-CopyIcon',
      execute: this._copySelectionToClipboard
    })
    const menu = new Menu({ commands })
    menu.addItem({ command: CommandIds.copyToClipboard })
    return menu
  }

  private _copySelectionToClipboard(): void {
    const selection = this._selectionManager.selection
    if (selection !== null) {
      const { rowIndex, columnIndex } = selection
      const value = this._grid.model.data('body', rowIndex, columnIndex)
      Clipboard.copyToSystem(value)
    }
  }

  private readonly _grid: DataGrid;
  private readonly _selectionManager: DataGridExtensions.SelectionManager;
  private readonly _menu: Menu
}

class ResponseTableDataModel extends DataModel {
  constructor(keys: Array<string>, data: Array<Array<any>>) {
    super();
    this._data = data;
    this._keys = keys;
  }

  readonly _data: Array<Array<any>>;
  readonly _keys: Array<string>;

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._data.length : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? this._keys.length : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return row;
    }
    if (region === 'column-header') {
      return this._keys[column];
    }
    if (region === 'corner-header') {
      return '';
    }
    return this._serializeData(this._data[row][column]);
  }

  _serializeData(data: any): any {
    const _type = typeof data;
    if (_type === 'object') {
      return JSON.stringify(data);
    }
    return data;
  }
}
