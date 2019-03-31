import 'jest-canvas-mock'

import { DataGrid, DataModel } from '@phosphor/datagrid';

import { SelectionManager } from '../../../../src/services/dataGridExtensions'

namespace Fixtures {
  export function grid(): DataGrid {
    const model = new TestDataModel();
    const grid = new DataGrid();
    grid.model = model;
    return grid;
  }

  export function selectionManager(): SelectionManager {
    const model = new TestDataModel();
    const manager = new SelectionManager(model);
    return manager;
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

describe('SelectionManager', () => {
  it('have null selection at construction', () => {
    const manager = Fixtures.selectionManager();
    expect(manager.selection).toBeNull();
  });

  it('support setting the selection', () => {
    const manager = Fixtures.selectionManager();
    const selection = { rowIndex: 2, columnIndex: 0 };
    manager.selection = selection;
    expect(manager.selection).toEqual(selection);
  });

  it('support unsetting the selection', () => {
    const manager = Fixtures.selectionManager();
    const selection = { rowIndex: 2, columnIndex: 0 };
    manager.selection = selection;
    manager.selection = null;
    expect(manager.selection).toBeNull();
  });

  it('trigger selectionChanged when the selection changes', () => {
    const manager = Fixtures.selectionManager();
    const selection = { rowIndex: 2, columnIndex: 0 };
    const mockListener = jest.fn();
    manager.selectionChanged.connect(mockListener);
    manager.selection = selection;
    expect(mockListener.mock.calls.length).toEqual(1);
    expect(mockListener.mock.calls[0][1]).toEqual(selection);
  });

  it('not trigger selectionChanged if the selection remains the same', () => {
    const manager = Fixtures.selectionManager();
    const selection = { rowIndex: 2, columnIndex: 0 };
    manager.selection = selection;
    const mockListener = jest.fn();
    manager.selectionChanged.connect(mockListener);
    manager.selection = selection;
    expect(mockListener.mock.calls.length).toEqual(0);
  });

  it('not trigger selectionChanged if the selection remains null', () => {
    const manager = Fixtures.selectionManager();
    const mockListener = jest.fn();
    manager.selectionChanged.connect(mockListener);
    manager.selection = null;
    expect(mockListener.mock.calls.length).toEqual(0);
  });

  it.each([
    ['row > model', { rowIndex: 500, columnIndex: 0 }],
    ['row < 0', { rowIndex: -1, columnIndex: 0 }],
    ['column > model', { rowIndex: 0, columnIndex: 100 }],
    ['column < 0', { rowIndex: 0, columnIndex: -1 }]
  ])('be null when outside boundaries: %s', (_: any, selection: any) => {
    const manager = Fixtures.selectionManager();
    manager.selection = selection;
    expect(manager.selection).toBeNull();
  });
});
