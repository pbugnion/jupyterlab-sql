
import { Menu, Widget, BoxPanel } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { IDisposable } from '@phosphor/disposable';

import { CommandRegistry } from '@phosphor/commands';

import { Clipboard } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel, Table } from '../components';

import { Api } from '../api'

namespace DatabaseSummaryPage {
  export interface IOptions {
    connectionUrl: string;
  }
}

export class DatabaseSummaryPage extends BoxPanel {
  constructor(options: DatabaseSummaryPage.IOptions) {
    super();
    this._responseWidget = new ResponseWidget()
    this._responseWidget.setLoading()
    const customQueryWidget = new CustomQueryWidget()
    customQueryWidget.clicked.connect(() => this._customQueryClicked.emit(void 0))
    this.addWidget(customQueryWidget);
    this.addWidget(this._responseWidget);
    BoxPanel.setSizeBasis(customQueryWidget, 30);
    BoxPanel.setStretch(this._responseWidget, 1)
    this._getStructure()
  }

  get customQueryClicked(): ISignal<this, void> {
    return this._customQueryClicked;
  }

  private async _getStructure(): Promise<void> {
    const response = await Api.getStructure()
    this._responseWidget.setResponse(response)
  }

  private readonly _responseWidget: ResponseWidget
  private readonly _customQueryClicked = new Signal<this, void>(this);
}

class CustomQueryWidget extends Widget {
  constructor() {
    super();
    const element = document.createElement('div');
    const button = document.createElement('button');
    button.innerHTML = 'Custom query';
    button.onclick = () => this._clicked.emit(void 0);
    element.appendChild(button);
    this.node.appendChild(element);
  }

  get clicked(): ISignal<this, void> {
    return this._clicked;
  }

  private readonly _clicked = new Signal<this, void>(this);
}

class ResponseWidget extends SingletonPanel {
  setResponse(response: Api.StructureResponse.Type) {
    Api.StructureResponse.match(
      response,
      tables => {
        const table = new DatabaseSummaryTable(tables)
        this.widget = table.widget
      },
      () => {
        this.widget = new PreWidget('oops')
      }
    )
  }

  setLoading() {
    this.widget = new PreWidget('Fetching database summary...')
  }
}

class DatabaseSummaryTable implements IDisposable {
  constructor(tables: Array<string>) {
    const contextMenu = this._createContextMenu()
    const data = tables.map(table => { return [table] });
    this._table = Table.fromKeysRows(['tables'], data, { contextMenu })
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

  private _createContextMenu(): Menu {
    const commands = new CommandRegistry();
    commands.addCommand(DatabaseSummaryTable.CommandIds.copyToClipboard, {
      label: 'Copy cell',
      iconClass: 'jp-MaterialIcon jp-CopyIcon',
      execute: () => this._copySelectionToClipboard()
    })
    const menu = new Menu({ commands });
    menu.addItem({ command: DatabaseSummaryTable.CommandIds.copyToClipboard })
    return menu
  }

  private _copySelectionToClipboard(): void {
    const selectionValue = this._table.selectionValue;
    if (selectionValue !== null) {
      Clipboard.copyToSystem(selectionValue)
    }
  }

  private readonly _table: Table;
  private _isDisposed: boolean = false;
}

namespace DatabaseSummaryTable {
  export namespace CommandIds {
    export const copyToClipboard = 'copy-selection-to-clipboard';
  }
}
