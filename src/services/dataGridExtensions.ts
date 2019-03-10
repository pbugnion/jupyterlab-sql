import { IDisposable, DisposableDelegate } from '@phosphor/disposable';
import { ISignal, Signal } from '@phosphor/signaling';
import { DataGrid, DataModel } from '@phosphor/datagrid';

export namespace DataGridExtensions {

  export type RowSection = 'outside' | 'column-header' | 'row'
  export type ColumnSection = 'outside' | 'row-header' | 'column'

  export interface Row {
    section: RowSection;
    index: number | null
  }

  export interface Column {
    section: ColumnSection;
    index: number | null
  }

  export interface MouseEvent {
    row: Row
    column: Column
  }

  export interface BodyCellIndex {
    rowIndex: number,
    columnIndex: number
  }

  export function addMouseEventListener(
    eventType: 'click' | 'contextmenu',
    grid: DataGrid,
    listener: (event: MouseEvent) => void
  ): IDisposable {
    const handler = ({ clientX, clientY }: MouseEventInit) => {
      const row = getRow(grid, clientY);
      const column = getColumn(grid, clientX);
      return listener({ row, column });
    }
    grid.node.addEventListener(eventType, handler)
    return new DisposableDelegate(() => {
      grid.node.removeEventListener(eventType, handler)
    })
  }

  export class SelectionManager {
    constructor(model: DataModel) {
      this._maxRow = model.rowCount('body') - 1;
      this._maxColumn = model.columnCount('body') - 1;
    }

    set selection(value: BodyCellIndex | null) {
      let newSelection = value;
      if (value !== null) {
        const { rowIndex, columnIndex } = value
        if (
          rowIndex > this._maxRow ||
            columnIndex > this._maxColumn ||
            rowIndex < 0 ||
            columnIndex < 0
        ) {
          newSelection = null;
        }
      }
      if (newSelection === this._selection) {
        return
      }
      this._selection = newSelection;
      this._selectionChanged.emit(value);
    }

    get selection(): BodyCellIndex | null {
      return this._selection
    }

    get selectionChanged(): ISignal<this, BodyCellIndex | null> {
      return this._selectionChanged
    }

    private readonly _maxRow: number;
    private readonly _maxColumn: number;
    private _selection: BodyCellIndex | null = null;
    private readonly _selectionChanged = new Signal<this, BodyCellIndex | null>(this);
  }

  function getRow(grid: DataGrid, clientY: number): Row {
    const { top } = grid.node.getBoundingClientRect();
    const y = clientY - top;
    let section: RowSection;
    let index: number;
    if (y >= grid.totalHeight) {
      section = 'outside';
      index = null;
    } else if (y < grid.headerHeight) {
      section = 'column-header';
      index = null;
    } else {
      section = 'row';
      const absY = y + grid.scrollY - grid.headerHeight;
      index = Math.floor(absY / grid.baseRowSize);
    }
    return { section, index }
  }

  function getColumn(grid: DataGrid, clientX: number): Column {
    const { left } = grid.node.getBoundingClientRect();
    const x = clientX - left;
    let section: ColumnSection = 'row-header';
    let index: number = null;
    if (x >= grid.totalWidth) {
      section = 'outside';
      index = null;
    } else if (x < grid.headerWidth) {
      section = 'row-header';
      index = null;
    } else {
      const absX = x + grid.scrollX - grid.headerWidth;
      let currentColumn = 0;
      let currentLeft = 0;
      let nextLeft = currentLeft + grid.sectionSize('column', currentColumn);
      while (absX >= nextLeft) {
        currentColumn++;
        currentLeft = nextLeft;
        nextLeft = currentLeft + grid.sectionSize('column', currentColumn);
      }
      index = currentColumn;
      section = 'column';
    }
    return { section, index };
  }
}
