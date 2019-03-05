import { ISignal, Signal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import * as React from 'react';

import classNames from 'classnames';

import { ConnectionUrl } from './services';

export interface IToolbarModel {
  readonly connectionString: string;
  readonly connectionStringChanged: ISignal<this, string>;
  isLoading: boolean;
}

export function newToolbar(model: ToolbarModel): ToolbarContainer {
  const container = new ToolbarContainer();
  container.model = model;
  return container;
}

export class ToolbarModel extends VDomModel implements IToolbarModel {
  constructor(initialConnectionString: string) {
    super();
    this._connectionString = initialConnectionString;
  }

  private _connectionString: string;
  private _isLoading: boolean = false;
  private _connectionStringChanged = new Signal<this, string>(this);

  get connectionStringChanged(): ISignal<this, string> {
    return this._connectionStringChanged;
  }

  get connectionString(): string {
    return this._connectionString;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set connectionString(newString: string) {
    this._connectionString = newString;
    this.stateChanged.emit(void 0);
    this._connectionStringChanged.emit(newString);
  }

  set isLoading(newValue: boolean) {
    this._isLoading = newValue;
    this.stateChanged.emit(void 0);
  }
}

class ToolbarContainer extends VDomRenderer<ToolbarModel> {
  onConnectionStringChanged(newString: string) {
    if (!this.model) {
      return;
    }
    this.model.connectionString = newString;
  }

  render() {
    if (!this.model) {
      return null;
    } else {
      const connectionString = this.model.connectionString;
      const isLoading = this.model.isLoading;
      return (
        <div className="p-Sql-Toolbar">
          <ConnectionInformation
            connectionString={connectionString}
            onConnectionStringChanged={newString =>
              this.onConnectionStringChanged(newString)
            }
          />
          {isLoading && <LoadingIcon />}
        </div>
      );
    }
  }
}

namespace ConnectionInformation {
  export interface Props {
    connectionString: string;
    onConnectionStringChanged: (newString: string) => void;
  }
}

class ConnectionInformation extends React.Component<
  ConnectionInformation.Props
> {
  constructor(props: ConnectionInformation.Props) {
    super(props);
  }

  saveEdit(newConnectionString: string) {
    this.props.onConnectionStringChanged(newConnectionString);
  }

  render() {
    const { connectionString } = this.props;
    return (
      <ConnectionInformationEdit
        connectionString={connectionString}
        onFinishEdit={(newConnectionString: string) =>
          this.saveEdit(newConnectionString)
        }
      />
    );
  }
}

class ConnectionInformationEdit extends React.Component<
  ConnectionInformationEdit.Props,
  ConnectionInformationEdit.State
> {
  constructor(props: ConnectionInformationEdit.Props) {
    super(props);
    this.state = {
      value: ConnectionUrl.sanitize(props.connectionString),
      focused: false
    };
  }

  private inputRef = React.createRef<HTMLInputElement>();

  onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      this.finish();
    } else if (event.keyCode === 27) {
      // ESC key
      this.cancel();
    }
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ value: event.target.value });
  }

  start() {
    this.setState({
      focused: true,
      value: this.props.connectionString
    })
  }

  finish() {
    this.props.onFinishEdit(this.state.value);
    this.setState({
      focused: false,
      value: ConnectionUrl.sanitize(this.state.value)
    });
  }

  cancel() {
    this.setState({ value: this.props.connectionString });
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
    const { value, focused } = this.state;
    const inputWrapperClass = classNames(
      'p-Sql-ConnectionInformation-input-wrapper',
      { 'p-mod-focused': focused }
    );
    return (
      <div className={inputWrapperClass}>
        <input
          className="p-Sql-ConnectionInformation-text p-Sql-ConnectionInformation-input"
          value={value}
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
    connectionString: string;
    onFinishEdit: (newConnectionString: string) => void;
  }

  export interface State {
    value: string;
    focused: boolean;
  }
}

class LoadingIcon extends React.Component<{}> {
  render() {
    return (
      <div className="p-Sql-LoadingIcon">
        <div className="p-Sql-LoadingIcon-Spinner" />
      </div>
    );
  }
}
