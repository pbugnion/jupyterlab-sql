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
        return this._columnHeaders[column];
      }
      if (region === 'corner-header') {
        return '';
      }
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
    const model = new Fixtures.TestDataModel([column], ['h'], ['r']);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(8)
  })

  it('return the longest width in the first 100 elements', () => {
    const column = Array.from({ length: 200 }, () => 'a')
    column[20] = 'bbb'
    const model = new Fixtures.TestDataModel([column], ['h'], ['r']);
    const estimator = new ColumnWidthEstimator(model, Fixtures.renderer);
    expect(estimator.getColumnWidth(0)).toEqual(24)
  })

})
