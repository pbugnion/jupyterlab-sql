import { DataGrid } from '@phosphor/datagrid';

export namespace DataGridExtensions {
  export function addClickEventListener(grid: DataGrid, listener: () => void): void {
    grid.node.addEventListener('click', event => listener())
  }
}
