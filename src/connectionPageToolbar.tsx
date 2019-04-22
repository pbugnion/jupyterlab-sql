import * as React from 'react';

import { ISignal, Signal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import classNames from 'classNames';

export interface IConnectionPageToolbarModel {
  readonly connectionString: string;
  readonly connect: ISignal<this, string>;
  readonly connectionUrlChanged: ISignal<this, string>;
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

  tryConnect(connectionString: string): void {
    this._connect.emit(connectionString)
  }

  get connectionString(): string {
    return this._connectionString;
  }

  set connectionString(newValue: string) {
    this._connectionString = newValue;
    this._connectionUrlChanged.emit(newValue);
  }

  get connect(): ISignal<this, string> {
    return this._connect;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  private _connectionString: string;
  private readonly _connectionUrlChanged = new Signal<this, string>(this);
  private readonly _connect = new Signal<this, string>(this);
}

class ToolbarContainer extends VDomRenderer<ConnectionPageToolbarModel> {
  render() {
    if (!this.model) {
      return null;
    } else {
      const connectionString = this.model.connectionString
      return (
        <div className="p-Sql-Toolbar">
          <ConnectionInformationEdit
            initialConnectionString={connectionString}
            onConnectionUrlChanged={newConnectionString => this.model.connectionString = newConnectionString}
            onFinishEdit={currentConnectionString => this.model.tryConnect(currentConnectionString)}
          />
        </div>
      );
    }
  }
}


class ConnectionInformationEdit extends React.Component<
  ConnectionInformationEdit.Props,
  ConnectionInformationEdit.State
  > {
  constructor(props: ConnectionInformationEdit.Props) {
    super(props);
    this.state = {
      connectionString: props.initialConnectionString,
      focused: false
    };
  }

  private inputRef = React.createRef<HTMLInputElement>();

  onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      this.inputRef.current!.blur();
    } else if (event.keyCode === 27) {
      // ESC key
      this.cancel();
    }
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newConnectionString = event.target.value;
    this.props.onConnectionUrlChanged(newConnectionString);
    this.setState({ connectionString: newConnectionString });
  }

  start() {
    this.setState({
      focused: true
      //value: this.props.connectionString
    });
  }

  finish() {
    this.props.onFinishEdit(this.state.connectionString);
    this.setState({
      focused: false
    });
  }

  cancel() {
    const newConnectionString = this.props.initialConnectionString;
    this.props.onConnectionUrlChanged(newConnectionString);
    this.setState({ connectionString: newConnectionString });
  }

  onInputFocus() {
    this.start();
  }

  onInputBlur() {
    this.finish();
  }

  componentDidMount() {
    this.inputRef.current!.focus();
  }

  render() {
    const { connectionString, focused } = this.state;
    const inputWrapperClass = classNames(
      'p-Sql-ConnectionInformation-input-wrapper',
      { 'p-mod-focused': focused }
    );
    return (
      <div className={inputWrapperClass}>
        <input
          className="p-Sql-ConnectionInformation-text p-Sql-ConnectionInformation-input"
          value={connectionString}
          ref={this.inputRef}
          onChange={event => this.onChange(event)}
          onKeyDown={event => this.onKeyDown(event)}
          onBlur={() => this.onInputBlur()}
          onFocus={() => this.onInputFocus()}
        />
      </div>
    );
  }
}

namespace ConnectionInformationEdit {
  export interface Props {
    initialConnectionString: string;
    onFinishEdit: (newConnectionString: string) => void;
    onConnectionUrlChanged: (newConnectionString: string) => void;
  }

  export interface State {
    connectionString: string;
    focused: boolean;
  }
}
