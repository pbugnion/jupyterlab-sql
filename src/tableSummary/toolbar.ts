import { Toolbar } from '@jupyterlab/apputils';

import { Signal, ISignal } from '@lumino/signaling';

import { ToolbarItems } from '../components';

export class TableSummaryToolbar extends Toolbar {
  constructor(connectionUrl: string, tableName: string) {
    super();
    this._onBackButtonClicked = this._onBackButtonClicked.bind(this);
    this._onRefreshButtonClicked = this._onRefreshButtonClicked.bind(this);
    this.addItem(
      'back',
      new ToolbarItems.BackButton({ onClick: this._onBackButtonClicked })
    );
    this.addItem(
      'refresh',
      new ToolbarItems.RefreshButton({ onClick: this._onRefreshButtonClicked })
    );
    this.addItem('spacer', Toolbar.createSpacerItem());
    this.addItem('url', new ToolbarItems.ConnectionUrlItem(connectionUrl));
    this.addItem('table', new ToolbarItems.TextItem(` ❯ ${tableName}`));
    this.addItem('loading', this._loadingIcon);
  }

  get backButtonClicked(): ISignal<this, void> {
    return this._backButtonClicked;
  }

  get refreshButtonClicked(): ISignal<this, void> {
    return this._refreshButtonClicked;
  }

  setLoading(isLoading: boolean) {
    this._loadingIcon.setLoading(isLoading);
  }

  private _onBackButtonClicked(): void {
    this._backButtonClicked.emit(void 0);
  }

  private _onRefreshButtonClicked(): void {
    this._refreshButtonClicked.emit(void 0);
  }

  private readonly _loadingIcon: ToolbarItems.LoadingIcon = new ToolbarItems.LoadingIcon();
  private readonly _backButtonClicked: Signal<this, void> = new Signal(this);
  private readonly _refreshButtonClicked: Signal<this, void> = new Signal(this);
}
