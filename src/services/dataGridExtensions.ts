import { DataGrid } from '@phosphor/datagrid';

export namespace DataGridExtensions {

  export type RowSection = 'outside' | 'row-header' | 'row'

  export interface ClickEvent {
    rowSection: RowSection,
    row: number | null,
  }

  export function addClickEventListener(grid: DataGrid, listener: (row: ClickEvent) => void): void {
    grid.node.addEventListener('click', ({ clientY }) => {
      const rectangle = grid.node.getBoundingClientRect();
      const y = clientY - rectangle.top;
      let rowSection: RowSection;
      let row: number;
      if (y > grid.totalHeight) {
        rowSection = 'outside';
        row = null;
      } else if (y <= grid.headerHeight) {
        rowSection = 'row-header';
        row = 1;
      } else {
        rowSection = 'row';
        const absY = y + grid.scrollY - grid.headerHeight;
        row = Math.floor(absY / grid.baseRowSize);
      }
      return listener({ rowSection, row });
    })
  }
}
