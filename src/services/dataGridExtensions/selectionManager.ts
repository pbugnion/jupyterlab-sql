import { ISignal, Signal } from '@phosphor/signaling';
import { DataModel } from '@phosphor/datagrid';

export interface BodyCellIndex {
  rowIndex: number;
  columnIndex: number;
}

export class SelectionManager {
  constructor(model: DataModel) {
    this._maxRow = model.rowCount('body') - 1;
    this._maxColumn = model.columnCount('body') - 1;
  }

  set selection(value: BodyCellIndex | null) {
    let newSelection = value;
    if (value !== null) {
      const { rowIndex, columnIndex } = value;
      if (
        rowIndex > this._maxRow ||
        columnIndex > this._maxColumn ||
        rowIndex < 0 ||
        columnIndex < 0
      ) {
        newSelection = null;
      }
    }
    if (newSelection === this._selection) {
      return;
    }
    this._selection = newSelection;
    this._selectionChanged.emit(value);
  }

  get selection(): BodyCellIndex | null {
    return this._selection;
  }

  get selectionChanged(): ISignal<this, BodyCellIndex | null> {
    return this._selectionChanged;
  }

  private readonly _maxRow: number;
  private readonly _maxColumn: number;
  private _selection: BodyCellIndex | null = null;
  private readonly _selectionChanged = new Signal<this, BodyCellIndex | null>(
    this
  );
}
