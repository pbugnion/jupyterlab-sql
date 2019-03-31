import 'jest-canvas-mock';

import { DataGrid, DataModel } from '@phosphor/datagrid';

import {
  addMouseEventListener,
  GridMouseEvent
} from '../../../../src/services/dataGridExtensions';

namespace Fixtures {
  export function grid(): DataGrid {
    const model = new TestDataModel();
    const grid = new DataGrid();
    grid.model = model;
    return grid;
  }

  export function clickEvent(args: MouseEventInit): MouseEvent {
    return new MouseEvent('click', args);
  }

  export function contextmenuEvent(args: MouseEventInit): MouseEvent {
    return new MouseEvent('contextmenu', args);
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

describe('addMouseEventListener', () => {
  const testEvent = (grid: DataGrid, event: MouseEvent): GridMouseEvent => {
    const mockListener = jest.fn();
    addMouseEventListener('click', grid, mockListener);
    grid.node.dispatchEvent(event);
    expect(mockListener.mock.calls.length).toBe(1);
    const [args] = mockListener.mock.calls;
    expect(args.length).toBe(1);
    return args[0];
  };

  it('register an event listener', () => {
    const grid = Fixtures.grid();
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 5 });
    testEvent(grid, event);
  });

  it.each([
    [5, { section: 'column-header', index: null }],
    [20 * 101 + 1, { section: 'outside', index: null }],
    [20 * 101, { section: 'outside', index: null }], // boundary with last row
    [20 * 50 + 2, { section: 'row', index: 49 }],
    [20 * 50, { section: 'row', index: 49 }], // boundary between two rows
    [20, { section: 'row', index: 0 }] // boundary with header
  ])('row position %#: clientY: %i', (clientY: any, expected: any) => {
    const grid = Fixtures.grid();
    const event = Fixtures.clickEvent({ clientX: 10, clientY });
    const { row } = testEvent(grid, event);
    expect(row).toEqual(expected);
  });

  it('row position should be correct when scrolled', () => {
    const grid = Fixtures.grid();
    grid.scrollBy(0, 100);
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 32 });
    const { row } = testEvent(grid, event);
    expect(row).toEqual({ section: 'row', index: 5 });
  });

  it('scroll should not affect header', () => {
    const grid = Fixtures.grid();
    grid.scrollBy(0, 100);
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 5 });
    const { row } = testEvent(grid, event);
    expect(row).toEqual({ section: 'column-header', index: null });
  });

  it('take row resizes into account', () => {
    const grid = Fixtures.grid();
    grid.resizeSection('row', 2, 200);
    const event = Fixtures.clickEvent({
      clientX: 5,
      clientY: 3 * 20 + 200 + 2
    });
    const { row } = testEvent(grid, event);
    expect(row).toEqual({ section: 'row', index: 3 });
  });

  it.each([
    [5, { section: 'row-header', index: null }],
    [64 * 11 + 1, { section: 'outside', index: null }],
    [64, { section: 'column', index: 0 }], // on boundary with header
    [64 + 2, { section: 'column', index: 0 }],
    [64 * 5 + 2, { section: 'column', index: 4 }],
    [64 * 5, { section: 'column', index: 4 }], // boundary between two columns
    [64 * 10 + 2, { section: 'column', index: 9 }],
    [64 * 11 - 2, { section: 'column', index: 9 }],
    [64 * 11, { section: 'outside', index: null }] // on boundary of last column
  ])('column position %#: clientX: %i', (clientX: any, expected: any) => {
    const grid = Fixtures.grid();
    const event = Fixtures.clickEvent({ clientX, clientY: 100 });
    const { column } = testEvent(grid, event);
    expect(column).toEqual(expected);
  });

  it('column position should be correct when scrolled', () => {
    const grid = Fixtures.grid();
    grid.scrollBy(100, 0);
    const event = Fixtures.clickEvent({ clientX: 66, clientY: 5 });
    const { column } = testEvent(grid, event);
    expect(column).toEqual({ section: 'column', index: 1 });
  });

  it('should not affect the header', () => {
    const grid = Fixtures.grid();
    grid.scrollBy(100, 0);
    const event = Fixtures.clickEvent({ clientX: 2, clientY: 5 });
    const { column } = testEvent(grid, event);
    expect(column).toEqual({ section: 'row-header', index: null });
  });

  it('take column resizes into account', () => {
    const grid = Fixtures.grid();
    grid.resizeSection('column', 2, 200);
    const event = Fixtures.clickEvent({
      clientX: 3 * 64 + 200 + 2,
      clientY: 5
    });
    const { column } = testEvent(grid, event);
    expect(column).toEqual({ section: 'column', index: 3 });
  });

  it('pass through the raw event', () => {
    const grid = Fixtures.grid();
    grid.resizeSection('column', 2, 200);
    const event = Fixtures.clickEvent({ clientX: 100, clientY: 60 });
    const { rawEvent } = testEvent(grid, event);
    expect(rawEvent).toEqual(event);
  });

  it('remove the event listener', () => {
    const grid = Fixtures.grid();
    const mockListener = jest.fn();
    const disposable = addMouseEventListener('click', grid, mockListener);
    disposable.dispose();
    const event = Fixtures.clickEvent({ clientX: 10, clientY: 5 });
    grid.node.dispatchEvent(event);
    expect(mockListener.mock.calls.length).toBe(0);
  });

  it('support adding contextmenu listeners', () => {
    const grid = Fixtures.grid();
    const event = Fixtures.contextmenuEvent({ clientX: 10, clientY: 5 });
    const mockListener = jest.fn();
    addMouseEventListener('contextmenu', grid, mockListener);
    grid.node.dispatchEvent(event);
    expect(mockListener.mock.calls.length).toBe(1);
    const [args] = mockListener.mock.calls;
    expect(args.length).toBe(1);
    const { row, column } = args[0];
    expect(row).toEqual({ section: 'column-header', index: null });
    expect(column).toEqual({ section: 'row-header', index: null });
  });

  it('support removing contextmenu listeners', () => {
    const grid = Fixtures.grid();
    const event = Fixtures.contextmenuEvent({ clientX: 10, clientY: 5 });
    const mockListener = jest.fn();
    const disposable = addMouseEventListener('contextmenu', grid, mockListener);
    disposable.dispose();
    grid.node.dispatchEvent(event);
    expect(mockListener.mock.calls.length).toBe(0);
  });
});
