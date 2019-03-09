import 'jest-canvas-mock';

import { DataGrid, DataModel } from '@phosphor/datagrid';

import { DataGridExtensions } from '../../../src/services/dataGridExtensions';

namespace Fixtures {
  export function grid(): DataGrid {
    const model = new TestDataModel()
    const grid = new DataGrid()
    grid.model = model;
    return grid
  }

  export function clickEvent(args: MouseEventInit): MouseEvent {
    return new MouseEvent('click', args)
  }

  class TestDataModel extends DataModel {

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
    const grid = Fixtures.grid()
    const mockListener = jest.fn()
    DataGridExtensions.addClickEventListener(grid, mockListener)
    grid.node.dispatchEvent(event);
    expect(mockListener.mock.calls.length).toBe(1);
    const [args] = mockListener.mock.calls;
    expect(args.length).toBe(1)
    return args[0];
  }

  it('register an event listener', () => {
    testEvent(Fixtures.clickEvent({ clientX: 10, clientY: 5 }));
  })

  it('return that a RowSection is in the header', () => {
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 5 });
    const { row } = testEvent(event)
    expect(row).toEqual({ section: 'column-header', index: null });
  })

  it('return that a RowSection is outside', () => {
    // total height = (101 rows) * (20px / row) = (20 * 101)px
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 20 * 101 + 1 });
    const { row } = testEvent(event)
    expect(row).toEqual({ section: 'outside', index: null });
  })

  it('return a RowSection that is a row', () => {
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 20 * 50 + 2 });
    const { row } = testEvent(event)
    expect(row).toEqual({ section: 'row', index: 49 });
  })

  it('return that a column section is in the header', () => {
    const event = Fixtures.clickEvent({ clientX: 5, clientY: 100 });
    const { column } = testEvent(event)
    expect(column).toEqual({ section: 'row-header', index: null })
  })

  it('return that a column section is outside', () => {
    const event = Fixtures.clickEvent({ clientX: 11 * 64 + 1, clientY: 100 });
    const { column } = testEvent(event);
    expect(column).toEqual({ section: 'outside', index: null });
  })

  it('return that a column section is the first column', () => {
    const event = Fixtures.clickEvent({ clientX: 66, clientY: 100 });
    const { column } = testEvent(event);
    expect(column).toEqual({ section: 'column', index: 0 });
  })

  it('return that a column section is an intermediate column', () => {
    const event = Fixtures.clickEvent({ clientX: (64 * 5) + 2, clientY: 100 });
    const { column } = testEvent(event);
    expect(column).toEqual({ section: 'column', index: 4 });
  })

  it('return that a column section is the last column', () => {
    const event = Fixtures.clickEvent({ clientX: (64 * 10) + 2, clientY: 100 });
    const { column } = testEvent(event);
    expect(column).toEqual({ section: 'column', index: 9 });
  })

  it('return that a column section is the last column when click is towards right of column', () => {
    const event = Fixtures.clickEvent({ clientX: (64 * 11) - 2, clientY: 100 });
    const { column } = testEvent(event);
    expect(column).toEqual({ section: 'column', index: 9 });
  })
})
