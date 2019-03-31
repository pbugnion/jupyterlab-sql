import 'jest-canvas-mock';
import { TextRenderer, DataModel, DataGrid } from '@phosphor/datagrid';
import { fitColumnWidths, FitColumnWidths } from '../../../../src/services/dataGridExtensions';

import * as fontWidth from '../../../../src/services/dataGridExtensions/fontWidth';

jest.mock('../../../../src/services/dataGridExtensions/fontWidth', () => ({
  getFontWidth: jest.fn()
}))

namespace Fixtures {
  export class TestDataModel extends DataModel {
    constructor(data: Array<Array<any>>, columnHeaders: Array<any>, rowHeaders: Array<any>, cornerHeader: any) {
      super();
      this._data = data
      this._columnHeaders = columnHeaders
      this._rowHeaders = rowHeaders
      this._cornerHeader = cornerHeader
    }

    rowCount(region: DataModel.RowRegion): number {
      return region === 'body' ? this._rowHeaders.length : 1;
    }

    columnCount(region: DataModel.ColumnRegion): number {
      return region === 'body' ? this._columnHeaders.length : 1;
    }

    data(region: DataModel.CellRegion, row: number, column: number): any {
      if (region === 'row-header') {
        return this._rowHeaders[row];
      }
      if (region === 'column-header') {
        console.assert(row === 0)
        console.assert(column < this._columnHeaders.length)
        return this._columnHeaders[column];
      }
      if (region === 'corner-header') {
        console.assert(row === 0)
        console.assert(column === 0)
        return this._cornerHeader;
      }

      // in body
      console.assert(row < this._rowHeaders.length)
      console.assert(column < this._columnHeaders.length)
      return this._data[column][row]
    }

    private readonly _data: Array<Array<any>>
    private readonly _rowHeaders: Array<any>
    private readonly _columnHeaders: Array<any>
    private readonly _cornerHeader: any
  }

  export const renderer = new TextRenderer()

  export const options: FitColumnWidths.IOptions = {
    rowsToInspect: 100,
    minWidth: 5,
    maxWidth: 60,
    characterScaleFactor: 0.8
  };

  export function newGrid(model: DataModel) {
    const grid = new DataGrid()
    grid.model = model;
    jest.spyOn(grid, 'resizeSection')
    return grid;
  }
}

describe('ColumnWidthestimator', () => {
  beforeEach(() => {
    (fontWidth.getFontWidth as jest.Mock<any>)
      .mockImplementation(jest.fn(() => 10))
      .mockClear()
  })

  it('set the column width', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    const model = new Fixtures.TestDataModel([column], ['h'], column, '');
    const grid = Fixtures.newGrid(model)
    fitColumnWidths(grid, Fixtures.renderer, Fixtures.options)
    expect(grid.resizeSection).toHaveBeenCalledTimes(2);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 0, 8);
    expect(grid.resizeSection).toHaveBeenCalledWith('row-header', 0, 8);
  })

  it('use the longest width in the first 100 elements', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    column[20] = 'bbb'
    const model = new Fixtures.TestDataModel([column], ['h'], column, '');
    const grid = Fixtures.newGrid(model);
    fitColumnWidths(grid, Fixtures.renderer, Fixtures.options)
    expect(grid.resizeSection).toHaveBeenCalledTimes(2);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 0, 24);
    expect(grid.resizeSection).toHaveBeenCalledWith('row-header', 0, 24);
  })

  it('ignore values beyond the first 100', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    column[100] = 'bbb'
    const model = new Fixtures.TestDataModel([column], ['h'], column, '');
    const grid = Fixtures.newGrid(model)
    fitColumnWidths(grid, Fixtures.renderer, Fixtures.options)
    expect(grid.resizeSection).toHaveBeenCalledTimes(2);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 0, 8)
    expect(grid.resizeSection).toHaveBeenCalledWith('row-header', 0, 8);
  })

  it('set a default min value', () => {
    const model = new Fixtures.TestDataModel([[]], [''], [], '');
    const grid = Fixtures.newGrid(model)
    fitColumnWidths(grid, Fixtures.renderer, Fixtures.options)
    expect(grid.resizeSection).toHaveBeenCalledTimes(2);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 0, 5);
    expect(grid.resizeSection).toHaveBeenCalledWith('row-header', 0, 5);
  })

  it('include the header in the column width', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    const model = new Fixtures.TestDataModel([column], ['aaa'], column, 'aaa');
    const grid = Fixtures.newGrid(model)
    fitColumnWidths(grid, Fixtures.renderer, Fixtures.options)
    expect(grid.resizeSection).toHaveBeenCalledTimes(2);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 0, 24);
    expect(grid.resizeSection).toHaveBeenCalledWith('row-header', 0, 24);
  })

  it('not use values greater than a maximum size', () => {
    const column = Array.from({ length: 200 }, () => 'a');
    column[20] = 'b'.repeat(1000)
    const model = new Fixtures.TestDataModel([column], ['h'], column, '');
    const grid = Fixtures.newGrid(model);
    fitColumnWidths(grid, Fixtures.renderer, Fixtures.options);
    expect(grid.resizeSection).toHaveBeenCalledTimes(2);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 0, 60);
    expect(grid.resizeSection).toHaveBeenCalledWith('row-header', 0, 60);
  })

  it('work for mulitple columns', () => {
    const first = Array.from({ length: 200 }, () => 'a')
    const second = Array.from({ length: 200 }, () => 'bb')
    const model = new Fixtures.TestDataModel([first, second], ['h', 'h'], first, '')
    const grid = Fixtures.newGrid(model);
    fitColumnWidths(grid, Fixtures.renderer, Fixtures.options)
    expect(grid.resizeSection).toHaveBeenCalledTimes(3);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 0, 8);
    expect(grid.resizeSection).toHaveBeenCalledWith('column', 1, 16);
    expect(grid.resizeSection).toHaveBeenCalledWith('row-header', 0, 8);
  })

})
