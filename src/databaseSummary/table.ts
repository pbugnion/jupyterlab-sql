import { Menu, Widget } from '@phosphor/widgets';

import { CommandRegistry } from '@phosphor/commands';

import { IDisposable } from '@phosphor/disposable';

import { Clipboard } from '@jupyterlab/apputils';

import { Signal, ISignal } from '@phosphor/signaling';

import { Table } from '../components';

import * as DataGridExtensions from '../services/dataGridExtensions';

export class DatabaseSummaryTable implements IDisposable {
  constructor(tables: Array<string>) {
    const contextMenu = this._createContextMenu()
    const data = tables.map(table => { return [table] });
    this._table = Table.fromKeysRows(['tables'], data, { contextMenu })
    this._table.dblclickSignal.connect(this._onDoubleClick.bind(this))
  }

  dispose(): void {
    this._table.dispose();
    this._isDisposed = true;
  }

  get widget(): Widget {
    return this._table.widget;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable;
  }

  // TODO: Icons for context menu
  private _createContextMenu(): Menu {
    const commands = new CommandRegistry();
    commands.addCommand(DatabaseSummaryTable.CommandIds.viewTable, {
      label: 'View table',
      execute: () => this._navigateToSelectedTable()
    })
    commands.addCommand(DatabaseSummaryTable.CommandIds.copyToClipboard, {
      label: 'Copy cell',
      execute: () => this._copySelectionToClipboard()
    })
    const menu = new Menu({ commands });
    menu.addItem({ command: DatabaseSummaryTable.CommandIds.viewTable })
    menu.addItem({ command: DatabaseSummaryTable.CommandIds.copyToClipboard })
    return menu
  }

  private _copySelectionToClipboard(): void {
    const selectionValue = this._table.selectionValue;
    if (selectionValue !== null) {
      Clipboard.copyToSystem(selectionValue)
    }
  }

  private _navigateToSelectedTable(): void {
    const selectionValue = this._table.selectionValue;
    if (selectionValue !== null) {
      this._navigateToTable.emit(selectionValue);
    }
  }

  private _onDoubleClick(_: any, cellIndex: DataGridExtensions.BodyCellIndex): void {
    const value = this._table.getCellValue(cellIndex)
    this._navigateToTable.emit(value);
  }

  private readonly _table: Table;
  private readonly _navigateToTable = new Signal<this, string>(this)
  private _isDisposed: boolean = false;
}

export namespace DatabaseSummaryTable {
  export namespace CommandIds {
    export const copyToClipboard = 'copy-selection-to-clipboard';
    export const viewTable = 'view-table';
  }
}
