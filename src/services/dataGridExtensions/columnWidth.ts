import {
  CellRenderer,
  TextRenderer,
  DataModel,
  DataGrid
} from '@lumino/datagrid';

import { getFontWidth } from './fontWidth';

export function fitColumnWidths(
  grid: DataGrid,
  renderer: TextRenderer,
  options: FitColumnWidths.IOptions = {}
) {
  const estimator = new ColumnWidthEstimator(grid.dataModel, renderer, options);

  const widths = estimator.getColumnWidths();
  widths.forEach((width, column) => {
    grid.resizeColumn('body', column, width);
  });
  const headerWidth = estimator.getRowHeaderWidth();
  grid.resizeColumn('row-header', 0, headerWidth);
}

export namespace FitColumnWidths {
  export interface IOptions {
    rowsToInspect?: number;
    minWidth?: number;
    maxWidth?: number;
    characterScaleFactor?: number;
  }

  export const defaultRowsToInspect: number = 100;
  export const defaultMinWidth: number = 40;
  export const defaultMaxWidth: number = 300;
  export const characterScaleFactor: number = 0.65;
}

class ColumnWidthEstimator {
  constructor(
    model: DataModel,
    renderer: TextRenderer,
    options: FitColumnWidths.IOptions = {}
  ) {
    this._model = model;
    this._renderer = renderer;

    this._rowsToInspect =
      options.rowsToInspect || FitColumnWidths.defaultRowsToInspect;
    this._minWidth = options.minWidth || FitColumnWidths.defaultMinWidth;
    this._maxWidth = options.maxWidth || FitColumnWidths.defaultMaxWidth;
    this._characterScaleFactor =
      options.characterScaleFactor || FitColumnWidths.characterScaleFactor;
  }

  getColumnWidths(): Array<number> {
    const numberColumns = this._model.columnCount('body');
    const widths = Array.from({ length: numberColumns }, (_, column) =>
      this._getColumnWidth(column)
    );
    return widths;
  }

  getRowHeaderWidth(): number {
    if (this._model.columnCount('row-header') !== 1) {
      throw new Error(
        'Unsupported grid: row header does not contain exactly one column'
      );
    }
    const headerData = this._getDataFromRegion('corner-header', 0);
    const bodyData = this._getDataFromRegion('row-header', 0);
    const width = this._measureArrayWidth([...headerData, ...bodyData]);
    return this._clampWidth(width);
  }

  private _getColumnWidth(column: number): number {
    const headerData = this._getDataFromRegion('column-header', column);
    const bodyData = this._getDataFromRegion('body', column);
    const width = this._measureArrayWidth([...headerData, ...bodyData]);
    return this._clampWidth(width);
  }

  private _getDataFromRegion(
    region: DataModel.CellRegion,
    column: number
  ): Array<any> {
    const rowsToCheck = Math.min(
      this._getRowCount(region),
      this._rowsToInspect
    );
    const data = Array.from({ length: rowsToCheck }, (_, idx) =>
      this._model.data(region, idx, column)
    );
    return data;
  }

  private _measureArrayWidth(content: Array<any>): number {
    const widths = content.map(elementContent =>
      this._measureElementWidth(elementContent)
    );
    if (widths.length === 0) {
      return 0;
    } else {
      return Math.max(...widths);
    }
  }

  private _measureElementWidth(content: any): number {
    const config: CellRenderer.CellConfig = {
      x: 1,
      y: 1,
      height: 100,
      width: 20,
      region: 'body',
      row: 10,
      column: 10,
      metadata: {},
      value: content
    };
    const rendered: string = this._renderer.format(config);
    const width = getFontWidth('12px sans-serif');
    return rendered.length * width * this._characterScaleFactor;
  }

  private _getRowCount(region: DataModel.CellRegion): number {
    if (region === 'corner-header' || region === 'column-header') {
      return this._model.rowCount('column-header');
    } else if (region === 'body' || region === 'row-header') {
      return this._model.rowCount('body');
    } else {
      throw 'unreachable';
    }
  }

  private _clampWidth(width: number): number {
    return Math.max(Math.min(width, this._maxWidth), this._minWidth);
  }

  private readonly _model: DataModel;
  private readonly _renderer: TextRenderer;

  private readonly _rowsToInspect: number;
  private readonly _minWidth: number;
  private readonly _maxWidth: number;
  private readonly _characterScaleFactor: number;
}
