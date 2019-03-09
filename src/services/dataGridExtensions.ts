import { DataGrid } from '@phosphor/datagrid';

export namespace DataGridExtensions {

  export type RowSection = 'outside' | 'row-header' | 'row'

  export interface ClickEvent {
    rowSection: RowSection
  }

  export function addClickEventListener(grid: DataGrid, listener: (row: ClickEvent) => void): void {
    grid.node.addEventListener('click', ({ clientY }) => {
      let rowSection: RowSection = 'row';
      if (clientY > grid.totalHeight) {
        rowSection = 'outside';
      } else if (clientY <= grid.headerHeight) {
        rowSection = 'row-header';
      }
      return listener({ rowSection });
    })
  }
}
