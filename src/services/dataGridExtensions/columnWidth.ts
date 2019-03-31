
import { CellRenderer, TextRenderer, DataModel } from '@phosphor/datagrid'

import { getFontWidth } from './fontWidth';

export class ColumnWidthEstimator {

  constructor(model: DataModel, renderer: TextRenderer) {
    this._model = model
    this._renderer = renderer
  }

  getColumnWidth(column: number): number {
    const headerData = this._getDataFromRegion('column-header', column)
    const bodyData = this._getDataFromRegion('body', column)
    const minSizeElement = 'a'
    const measuredWidth = measureColumnWidth(
      [minSizeElement, ...headerData, ...bodyData],
      this._renderer
    )
    return Math.min(measuredWidth, 100)
  }

  private _getDataFromRegion(region: 'column-header' | 'body', column: number): Array<any> {
    const rowsToCheck = Math.min(this._model.rowCount(region), 100)
    const data = Array.from(
      { length: rowsToCheck },
      (_, idx) => this._model.data(region, idx, column)
    )
    return data
  }

  private readonly _model: DataModel;
  private readonly _renderer: TextRenderer;
}

function measureColumnWidth(columnContent: Array<any>, renderer: TextRenderer): number {
  const widths = columnContent.map(cellContent => measureRenderedWidth(cellContent, renderer))
  const minWidth = measureRenderedWidth('a', renderer)
  return Math.max(minWidth, ...widths)
}


function measureRenderedWidth(content: any, renderer: TextRenderer): number {
  const config: CellRenderer.ICellConfig = { x: 1, y: 1, height: 100, width: 20, region: 'body', row: 10, column: 10, metadata: {}, value: content }
  const rendered: string = renderer.format(config)
  const width = getFontWidth('12px sans-serif');
  return rendered.length * width * 0.8;
}
