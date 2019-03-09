import { DataGrid } from '@phosphor/datagrid';

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

  export interface ClickEvent {
    row: Row
    column: Column
  }

  export function addClickEventListener(grid: DataGrid, listener: (row: ClickEvent) => void): void {
    grid.node.addEventListener('click', ({ clientX, clientY }) => {
      const row = getRow(grid, clientY);
      const column = getColumn(grid, clientX);
      return listener({ row, column });
    })
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
