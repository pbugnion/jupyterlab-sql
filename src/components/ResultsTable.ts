import { Clipboard } from '@jupyterlab/apputils';

import { Menu, Widget } from '@lumino/widgets';

import { IDisposable } from '@lumino/disposable';

import { CommandRegistry } from '@lumino/commands';

import { Table } from './Table';

namespace CommandIds {
  export const copyToClipboard = 'copy-selection-to-clipboard';
}

export class ResultsTable implements IDisposable {
  constructor(keys: Array<string>, data: Array<Array<any>>) {
    const contextMenu = this._createContextMenu();
    this._table = Table.fromKeysRows(keys, data, { contextMenu });
  }

  get widget(): Widget {
    return this._table.widget;
  }

  dispose(): void {
    this._table.dispose();
    this._isDisposed = true;
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  private _createContextMenu(): Menu {
    const commands = new CommandRegistry();
    commands.addCommand(CommandIds.copyToClipboard, {
      label: 'Copy cell',
      iconClass: 'jp-MaterialIcon jp-CopyIcon',
      execute: () => this._copySelectionToClipboard()
    });
    const menu = new Menu({ commands });
    menu.addItem({ command: CommandIds.copyToClipboard });
    return menu;
  }

  private _copySelectionToClipboard(): void {
    const selectionValue = this._table.selectionValue;
    if (selectionValue !== null) {
      Clipboard.copyToSystem(selectionValue);
    }
  }

  private readonly _table: Table;
  private _isDisposed: boolean = false;
}
