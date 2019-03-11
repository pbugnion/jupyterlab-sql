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
    DataGridExtensions.addMouseEventListener(
      'click',
      this._grid,
      this._onClick
    )
    this._updateRenderers()

    this._selectionManager.selectionChanged.connect(() => {
      this._updateRenderers()
    })

    const menu = this._createContextMenu();

    DataGridExtensions.addMouseEventListener(
      'contextmenu',
      this._grid,
      event => {
        const { row, column, rawEvent } = event;
        this._updateSelection(row, column)
        if (this._isInBody(row, column)) {
          menu.open(rawEvent.clientX, rawEvent.clientY)
          rawEvent.preventDefault()
        }
      }
    )
  }

  private _onClick(event: DataGridExtensions.GridMouseEvent) {
    const { row, column } = event;
    this._updateSelection(row, column)
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
      label: 'Copy',
      execute: () => { this._copySelectionToClipboard() }
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
}
