import * as React from 'react';

import { ISignal, Signal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

export interface IConnectionPageToolbarModel {
  readonly connectionString: string;
  readonly connect: ISignal<this, string>;
}

export function newToolbar(model: ConnectionPageToolbarModel): ToolbarContainer {
  const container = new ToolbarContainer();
  container.model = model;
  return container;
}

export class ConnectionPageToolbarModel extends VDomModel implements IConnectionPageToolbarModel {
  constructor(initialConnectionString: string) {
    super();
    this._connectionString = initialConnectionString;
  }

  private _connectionString: string;

  private _connectionStringChanged = new Signal<this, string>(this);

  get connect(): ISignal<this, string> {
    return this._connectionStringChanged;
  }

  get connectionString(): string {
    return this._connectionString;
  }
}

class ToolbarContainer extends VDomRenderer<ConnectionPageToolbarModel> {
  render() {
    if (!this.model) {
      return null;
    } else {
      return (
        <div className="p-Sql-Toolbar">
          hello toolbar
        </div>
      );
    }
  }
}
