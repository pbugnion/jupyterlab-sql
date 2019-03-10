import { Widget } from '@phosphor/widgets';

import { DataGrid, DataModel, TextRenderer, CellRenderer } from '@phosphor/datagrid'

import { DataGridExtensions } from './services'

export class ResponseGrid {
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
  }

  _onClick(event: DataGridExtensions.MouseEvent) {
    const { row, column } = event;
    if (
      row.section === 'row' &&
        column.section === 'column' &&
        row.index !== null &&
        column.index !== null
    ) {
      this._selectionManager.selection = {
        rowIndex: row.index,
        columnIndex: column.index
      }
    } else {
      this._selectionManager.selection = null
    }
  }

  _updateRenderers(): void {
    const renderer = this._textRendererForSelection(this._selectionManager.selection)
    this._grid.cellRenderers.set('body', {}, renderer)
  }

  _textRendererForSelection(selectedCell: DataGridExtensions.BodyCellIndex | null): CellRenderer {
    let backgroundColor;
    if (selectedCell === null) {
      backgroundColor = 'blue'
    } else {
      const selectedRow = selectedCell.rowIndex
      const selectedColumn = selectedCell.columnIndex
      backgroundColor = ({ row, column }: CellRenderer.ICellConfig) => {
        if (row === selectedRow && column === selectedColumn) {
          return 'red'
        } else {
          return 'green'
        }
      }
    }
    return new TextRenderer({ backgroundColor })
  }

  get widget(): Widget {
    return this._grid
  }

  private readonly _grid: DataGrid;
  private readonly _selectionManager: DataGridExtensions.SelectionManager;
}
