import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { DataGrid } from '@lumino/datagrid';

export type RowSection = 'outside' | 'column-header' | 'row';
export type ColumnSection = 'outside' | 'row-header' | 'column';

export interface GridMouseEvent {
  row: Row;
  column: Column;
  rawEvent: MouseEvent;
}

export interface Row {
  section: RowSection;
  index: number | null;
}

export interface Column {
  section: ColumnSection;
  index: number | null;
}

export function addMouseEventListener(
  eventType: 'click' | 'contextmenu' | 'dblclick',
  grid: DataGrid,
  listener: (event: GridMouseEvent) => void
): IDisposable {
  const handler = (rawEvent: MouseEvent) => {
    const { clientX, clientY } = rawEvent;
    const row = getRow(grid, clientY);
    const column = getColumn(grid, clientX);
    return listener({ row, column, rawEvent });
  };
  grid.node.addEventListener(eventType, handler);
  return new DisposableDelegate(() => {
    grid.node.removeEventListener(eventType, handler);
  });
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
    const absY = y + grid.scrollY - grid.headerHeight;
    let currentRow = 0;
    let currentTop = 0;
    let nextTop = currentTop + grid.rowSize('body', currentRow);
    while (absY >= nextTop) {
      currentRow++;
      currentTop = nextTop;
      nextTop = currentTop + grid.rowSize('body', currentRow);
    }
    index = currentRow;
    section = 'row';
  }
  return { section, index };
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
    let nextLeft = currentLeft + grid.columnSize('body', currentColumn);
    while (absX >= nextLeft) {
      currentColumn++;
      currentLeft = nextLeft;
      nextLeft = currentLeft + grid.columnSize('body', currentColumn);
    }
    index = currentColumn;
    section = 'column';
  }
  return { section, index };
}
