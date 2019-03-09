import 'jest-canvas-mock';

import { DataGrid, DataModel } from '@phosphor/datagrid';

import { DataGridExtensions } from '../../../src/services/dataGridExtensions';

namespace Fixtures {
  export class TestDataModel extends DataModel {

    rowCount(region: DataModel.RowRegion): number {
      return region === 'body' ? 100 : 1;
    }

    columnCount(region: DataModel.ColumnRegion): number {
      return region === 'body' ? 10 : 1;
    }

    data(region: DataModel.CellRegion, row: number, column: number): any {
      if (region === 'row-header') {
        return `R: ${row}, ${column}`;
      }
      if (region === 'column-header') {
        return `C: ${row}, ${column}`;
      }
      if (region === 'corner-header') {
        return `N: ${row}, ${column}`;
      }
      return `(${row}, ${column})`;
    }
  }
}

describe('dataGridExtensions.addClickEventListener', () => {
  it('register an event listener', () => {
    const model = new Fixtures.TestDataModel()
    const grid = new DataGrid();
    grid.model = model;
    const mockListener = jest.fn()
    DataGridExtensions.addClickEventListener(grid, mockListener)
    const event = new MouseEvent('click', { clientX: 10, clientY: 100 });
    grid.node.dispatchEvent(event);
    expect(mockListener).toHaveBeenCalled();
  })

  it('return that a RowSection is in the header', () => {
    const model = new Fixtures.TestDataModel()
    const grid = new DataGrid();
    grid.model = model;
    const mockListener = jest.fn()
    DataGridExtensions.addClickEventListener(grid, mockListener)
    const event = new MouseEvent('click', { clientX: 10, clientY: 5 });
    grid.node.dispatchEvent(event);
    expect(mockListener).toHaveBeenCalledWith({ rowSection: 'row-header' });
  })
})
