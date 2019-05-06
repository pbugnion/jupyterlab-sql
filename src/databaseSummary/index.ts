
import { Widget, BoxPanel } from '@phosphor/widgets';

import { ISignal, Signal } from '@phosphor/signaling';

import { DisposableSet } from '@phosphor/disposable';

import { Toolbar } from '@jupyterlab/apputils';

import { PreWidget, SingletonPanel } from '../components';

import * as Api from '../api'

import { proxyFor } from '../services';

import { JupyterLabSqlPage, PageName } from '../page';

import { DatabaseSummaryToolbar } from './toolbar';

// import { DatabaseSummaryTable } from './table';

import { TableListWidget, TableListModel } from './tableList';

// TODO break up into multiple source files?
// TODO bind double click to navigating to table

namespace DatabaseSummaryPage {
  export interface IOptions {
    connectionUrl: string;
  }
}

// TODO dispose of toolbar
export class DatabaseSummaryPage implements JupyterLabSqlPage {
  constructor(options: DatabaseSummaryPage.IOptions) {
    this._onRefresh = this._onRefresh.bind(this)
    this._content = new Content(options);
    this._toolbar = new DatabaseSummaryToolbar(options.connectionUrl);
    this._navigateBack = proxyFor(this._toolbar.backButtonClicked, this);
    this._toolbar.refreshButtonClicked.connect(this._onRefresh)
    this._customQueryClicked = proxyFor(this._content.customQueryClicked, this);
    this._navigateToTable = proxyFor(this._content.navigateToTable, this);
    this._disposables = DisposableSet.from([this._content, this._toolbar])

    this._onRefresh();
  }

  get content(): Widget {
    return this._content
  }

  get toolbar(): Toolbar {
    return this._toolbar
  }

  get navigateBack(): ISignal<this, void> {
    return this._navigateBack;
  }

  get customQueryClicked(): ISignal<this, void> {
    return this._customQueryClicked;
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable
  }

  // TODO: Correct disposal implementation
  get isDisposed() {
    return this._disposables.isDisposed;
  }

  dispose() {
    return this._disposables.dispose()
  }

  private async _onRefresh(): Promise<void> {
    this._toolbar.setLoading(true)
    await this._content.refresh()
    // TODO: what if refresh fails?
    this._toolbar.setLoading(false)
  }

  readonly pageName: PageName = PageName.DatabaseSummary;
  private readonly _disposables: DisposableSet;
  private readonly _toolbar: DatabaseSummaryToolbar;
  private readonly _content: Content;
  private readonly _navigateBack: Signal<this, void>;
  private readonly _customQueryClicked: Signal<this, void>
  private readonly _navigateToTable: Signal<this, string>
}

class Content extends SingletonPanel {
  constructor(options: DatabaseSummaryPage.IOptions) {
    super();
    this._connectionUrl = options.connectionUrl;
    this._responseWidget = new ResponseWidget()
    this._responseWidget.navigateToTable.connect((_, tableName) => {
      this._navigateToTable.emit(tableName)
    })
    this.widget = this._responseWidget;
  }

  get customQueryClicked(): ISignal<this, void> {
    return this._customQueryClicked;
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable
  }

  async refresh(): Promise<void> {
    const response = await Api.getStructure(this._connectionUrl)
    this._responseWidget.setResponse(response)
  }

  private readonly _connectionUrl: string;
  private readonly _responseWidget: ResponseWidget
  private readonly _customQueryClicked = new Signal<this, void>(this);
  private readonly _navigateToTable = new Signal<this, string>(this);
}

class ResponseWidget extends SingletonPanel {

  // TODO: Dispose of signals

  dispose(): void {
    this._disposeTable();
    super.dispose();
  }

  setResponse(response: Api.StructureResponse.Type) {
    this._disposeTable();
    Api.StructureResponse.match(
      response,
      tables => {
        this._tableList = new SuccessfulResponseContent(tables)
        // this._tableList.navigateToTable.connect((_, tableName) => {
        //   this._navigateToTable.emit(tableName)
        // })
        this.widget = this._tableList;
      },
      () => {
        // TODO handle error
        this.widget = new PreWidget('oops')
      }
    )
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable;
  }

  private _disposeTable(): void {
    if (this._tableList) {
      Signal.disconnectBetween(this._tableList, this);
      this._tableList.dispose()
    }
    this._tableList = null;
  }

  private _tableList: SuccessfulResponseContent | null = null;
  private readonly _navigateToTable = new Signal<this, string>(this);
}


class SuccessfulResponseContent extends BoxPanel {
  constructor(tables: Array<string>) {
    super({ direction: 'left-to-right' })
    const tableListModel: TableListModel = new TableListModel(tables);
    const tableList = TableListWidget.withModel(tableListModel)
    const customQueryWidget = new CustomQueryWidget()
    this.addWidget(customQueryWidget)
    this.addWidget(tableList)
    BoxPanel.setSizeBasis(customQueryWidget, 100);
    BoxPanel.setStretch(tableList, 1);
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable;
  }

  private readonly _navigateToTable: Signal<this, string>;
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

// class TableListContainer extends BoxPanel {
//   constructor(tables: Array<string>) {
//     super();
//     // this._table = new DatabaseSummaryTable(tables)
//     this._navigateToTable = proxyFor(tableListModel.navigateToTable, this)
//     this.addWidget(tableList);
//     BoxPanel.setStretch(tableList, 1);
//   }

//   get navigateToTable(): ISignal<this, string> {
//     return this._navigateToTable;
//   }

//   dispose(): void {
//     // this._table.dispose();
//     super.dispose();
//   }

//   // private readonly _table: DatabaseSummaryTable;
//   private readonly _navigateToTable: Signal<this, string>;
// }


// class TitleWidget extends Widget {
//   constructor() {
//     super();
//     this.addClass('jp-RenderedHTMLCommon');
//     const title = document.createElement('h2');
//     title.innerHTML = 'Tables'
//     this.node.appendChild(title)
//   }
// }
