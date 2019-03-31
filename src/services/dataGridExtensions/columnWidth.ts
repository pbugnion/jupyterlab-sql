
import { CellRenderer, TextRenderer, DataModel } from '@phosphor/datagrid'

import { getFontWidth } from './fontWidth';

export class ColumnWidthEstimator {

  constructor(model: DataModel, renderer: TextRenderer, options: ColumnWidthEstimator.IOptions = {}) {
    this._model = model
    this._renderer = renderer

    this._rowsToInspect = options.rowsToInspect || ColumnWidthEstimator.defaultRowsToInspect
    this._minWidth = options.minWidth || ColumnWidthEstimator.defaultMinWidth
    this._maxWidth = options.maxWidth || ColumnWidthEstimator.defaultMaxWidth
  }

  getColumnWidth(column: number): number {
    const headerData = this._getDataFromRegion('column-header', column)
    const bodyData = this._getDataFromRegion('body', column)
    const measuredWidth = measureColumnWidth(
      [...headerData, ...bodyData],
      this._renderer
    )
    return Math.max(Math.min(measuredWidth, this._maxWidth), this._minWidth)
  }

  private _getDataFromRegion(region: 'column-header' | 'body', column: number): Array<any> {
    const rowsToCheck = Math.min(this._model.rowCount(region), this._rowsToInspect)
    const data = Array.from(
      { length: rowsToCheck },
      (_, idx) => this._model.data(region, idx, column)
    )
    return data
  }

  private readonly _model: DataModel;
  private readonly _renderer: TextRenderer;

  private readonly _rowsToInspect: number;
  private readonly _minWidth: number;
  private readonly _maxWidth: number;
}

export namespace ColumnWidthEstimator {
  export interface IOptions {
    rowsToInspect?: number;
    minWidth?: number;
    maxWidth?: number;
  }

  export const defaultRowsToInspect: number = 100
  export const defaultMinWidth: number = 20
  export const defaultMaxWidth: number = 300
}

function measureColumnWidth(columnContent: Array<any>, renderer: TextRenderer): number {
  const widths = columnContent.map(cellContent => measureRenderedWidth(cellContent, renderer))
  if (widths.length === 0) {
    return 0
  } else {
    return Math.max(...widths)
  }
}


function measureRenderedWidth(content: any, renderer: TextRenderer): number {
  const config: CellRenderer.ICellConfig = { x: 1, y: 1, height: 100, width: 20, region: 'body', row: 10, column: 10, metadata: {}, value: content }
  const rendered: string = renderer.format(config)
  const width = getFontWidth('12px sans-serif');
  return rendered.length * width * 0.8;
}
