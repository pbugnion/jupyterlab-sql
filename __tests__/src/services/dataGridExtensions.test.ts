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

  const testEvent = (event: MouseEvent): DataGridExtensions.ClickEvent => {
    const model = new Fixtures.TestDataModel()
    const grid = new DataGrid();
    grid.model = model;
    const mockListener = jest.fn()
    DataGridExtensions.addClickEventListener(grid, mockListener)
    grid.node.dispatchEvent(event);
    expect(mockListener.mock.calls.length).toBe(1);
    const [args] = mockListener.mock.calls;
    expect(args.length).toBe(1)
    return args[0];
  }

  it('register an event listener', () => {
    testEvent(new MouseEvent('click', { clientX: 10, clientY: 5 }));
  })

  it('return that a RowSection is in the header', () => {
    const event = new MouseEvent('click', { clientX: 10, clientY: 5 });
    const { row } = testEvent(event)
    expect(row).toEqual({ section: 'column-header', index: 1 });
  })

  it('return that a RowSection is outside', () => {
    // total height = (101 rows) * (20px / row) = (20 * 101)px
    const event = new MouseEvent('click', { clientX: 10, clientY: 20 * 101 + 1 });
    const { row } = testEvent(event)
    expect(row).toEqual({ section: 'outside', index: null });
  })

  it('return a RowSection that is a row', () => {
    const event = new MouseEvent('click', { clientX: 10, clientY: 20 * 50 + 2 });
    const { row } = testEvent(event)
    expect(row).toEqual({ section: 'row', index: 49 });
  })

  })
})
