import { Signal, ISignal } from '@phosphor/signaling';

import { Toolbar } from '@jupyterlab/apputils';

import { ToolbarItems } from '../components';

export class QueryToolbar extends Toolbar {
  constructor(connectionUrl: string) {
    super();
    this._onBackButtonClicked = this._onBackButtonClicked.bind(this);
    this.addItem(
      'back',
      new ToolbarItems.BackButton({ onClick: this._onBackButtonClicked })
    )
    this.addItem('spacer', Toolbar.createSpacerItem())
    this.addItem('url', new ToolbarItems.TextItem(connectionUrl))
  }

  get backButtonClicked(): ISignal<this, void> {
    return this._backButtonClicked;
  }

  private _onBackButtonClicked(): void {
    this._backButtonClicked.emit(void 0);
  }

  private readonly _backButtonClicked: Signal<this, void> = new Signal(this);
}
