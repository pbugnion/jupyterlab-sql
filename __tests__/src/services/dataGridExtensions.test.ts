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

  const testEvent = (grid: DataGrid, event: MouseEvent): DataGridExtensions.ClickEvent => {
    const mockListener = jest.fn()
    DataGridExtensions.addClickEventListener(grid, mockListener)
    grid.node.dispatchEvent(event);
    expect(mockListener.mock.calls.length).toBe(1);
    const [args] = mockListener.mock.calls;
    expect(args.length).toBe(1)
    return args[0];
  }

  it('register an event listener', () => {
    testEvent(
      Fixtures.grid(),
      Fixtures.clickEvent({ clientX: 10, clientY: 5 })
    );
  })

  it.each([
    [5, { section: 'column-header', index: null }],
    [20 * 101 + 1, { section: 'outside', index: null }],
    [20 * 50 + 2, { section: 'row', index: 49 }]
  ])("row position %#: clientY: %i", (clientY, expected) => {
    const grid = Fixtures.grid()
    const event = Fixtures.clickEvent({ clientX: 10, clientY })
    const { row } = testEvent(grid, event);
    expect(row).toEqual(expected);
  })

  it('row position should be correct when scrolled', () => {
    const grid = Fixtures.grid()
    grid.scrollBy(0, 100);
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 32});
    const { row } = testEvent(grid, event)
    expect(row).toEqual({ section: 'row', index: 5 })
  })

  it('scroll should not affect header', () => {
    const grid = Fixtures.grid()
    grid.scrollBy(0, 100);
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 5});
    const { row } = testEvent(grid, event)
    expect(row).toEqual({ section: 'column-header', index: null })
  })

  it.each([
    [5, { section: 'row-header', index: null }],
    [64 * 11 + 1, { section: 'outside', index: null }],
    [64 + 2, { section: 'column', index: 0 }],
    [64 * 5 + 2, { section: 'column', index: 4 }],
    [64 * 10 + 2, { section: 'column', index: 9 }],
    [64 * 11 - 2, { section: 'column', index: 9 }]
  ])("column position %#: clientX: %i", (clientX, expected) => {
    const grid = Fixtures.grid()
    const event = Fixtures.clickEvent({ clientX, clientY: 100 });
    const { column } = testEvent(grid, event)
    expect(column).toEqual(expected)
  })

  it('column position should be correct when scrolled', () => {
    const grid = Fixtures.grid()
    grid.scrollBy(100, 0);
    const event = Fixtures.clickEvent({ clientX: 66, clientY: 5 });
    const { column } = testEvent(grid, event);
    expect(column).toEqual({ section: 'column', index: 1 })
  })

  it('should not affect the header', () => {
    const grid = Fixtures.grid()
    grid.scrollBy(100, 0);
    const event = Fixtures.clickEvent({ clientX: 2, clientY: 5 });
    const { column } = testEvent(grid, event);
    expect(column).toEqual({ section: 'row-header', index: null })
  })

})
