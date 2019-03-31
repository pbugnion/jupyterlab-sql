import 'jest-canvas-mock';
import { TextRenderer, DataModel } from '@phosphor/datagrid';
import { ColumnWidthEstimator } from '../../../../src/services/dataGridExtensions';

import * as fontWidth from '../../../../src/services/dataGridExtensions/fontWidth';

jest.mock('../../../../src/services/dataGridExtensions/fontWidth', () => ({
  getFontWidth: jest.fn()
}))

namespace Fixtures {
  export class TestDataModel extends DataModel {
    constructor(data: Array<Array<any>>, columnHeaders: Array<any>, rowHeaders: Array<any>) {
      super();
      this._data = data
      this._columnHeaders = columnHeaders
      this._rowHeaders = rowHeaders
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
        return '';
      }

      // in body
      console.assert(row < this._rowHeaders.length)
      console.assert(column < this._columnHeaders.length)
      return this._data[column][row]
    }

    private readonly _data: Array<Array<any>>
    private readonly _rowHeaders: Array<any>
    private readonly _columnHeaders: Array<any>
  }

  export const renderer = new TextRenderer()
}

describe('ColumnWidthestimator', () => {
  beforeEach(() => {
    (fontWidth.getFontWidth as jest.Mock<any>).mockImplementation(jest.fn(() => 10)).mockClear()
  })

  it('measure the column width', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    const model = new Fixtures.TestDataModel([column], ['h'], column);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(8)
  })

  it('return the longest width in the first 100 elements', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    column[20] = 'bbb'
    const model = new Fixtures.TestDataModel([column], ['h'], column);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(24)
  })

  it('ignore values beyond the first 100', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    column[100] = 'bbb'
    const model = new Fixtures.TestDataModel([column], ['h'], column);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(8)
  })

  it('return a default min value', () => {
    const model = new Fixtures.TestDataModel([[]], [''], []);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(8)
  })

  it('include the header column', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    const model = new Fixtures.TestDataModel([column], ['aaa'], column);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(24);
  })

  it('not return values greater than a maximum size', () => {
    const column = Array.from({ length: 200 }, () => 'a');
    column[20] = 'b'.repeat(1000)
    const model = new Fixtures.TestDataModel([column], ['h'], column);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(100);

  })

})
