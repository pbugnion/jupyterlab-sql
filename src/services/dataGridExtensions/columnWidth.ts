
import { CellRenderer, TextRenderer, DataModel } from '@phosphor/datagrid'

import { getFontWidth } from './fontWidth';

export class ColumnWidthEstimator {

  constructor(model: DataModel, renderer: TextRenderer) {
    this._model = model
    this._renderer = renderer
  }

  getColumnWidth(column: number): number {
    // TODO: what if the column contains more than 10 elements?
    const data = Array.from({length: 10}, (_, idx) => this._model.data('body', idx + 1, column))
    return measureColumnWidth(data, this._renderer)
  }

  private readonly _model: DataModel;
  private readonly _renderer: TextRenderer;
}

function measureColumnWidth(columnContent: Array<any>, renderer: TextRenderer): number {
  // TODO: take first 100 elements
  const widths = columnContent.map(cellContent => measureRenderedWidth(cellContent, renderer))
  return Math.max(2, ...widths)
}


function measureRenderedWidth(content: any, renderer: TextRenderer): number {
  const config: CellRenderer.ICellConfig = { x: 1, y: 1, height: 100, width: 20, region: 'body', row: 10, column: 10, metadata: {}, value: content }
  const rendered: string = renderer.format(config)
  const width = getFontWidth('12px sans-serif');
  return rendered.length * width * 0.8;
}
