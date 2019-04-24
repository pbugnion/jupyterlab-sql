import { ISignal, Signal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import * as React from 'react';

import classNames from 'classNames';

import { ConnectionUrl } from './services';

export interface IToolbarModel {
  readonly connectionUrl: string;
  readonly connectionUrlChanged: ISignal<this, string>;
  isLoading: boolean;
}

export function newToolbar(model: ToolbarModel): ToolbarContainer {
  const container = new ToolbarContainer();
  container.model = model;
  return container;
}

export class ToolbarModel extends VDomModel implements IToolbarModel {
  constructor(initialConnectionUrl: string) {
    super();
    this._connectionUrl = initialConnectionUrl;
  }

  private _connectionUrl: string;
  private _isLoading: boolean = false;
  private _connectionUrlChanged = new Signal<this, string>(this);

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  get connectionUrl(): string {
    return this._connectionUrl;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set connectionUrl(newString: string) {
    this._connectionUrl = newString;
    this.stateChanged.emit(void 0);
    this._connectionUrlChanged.emit(newString);
  }

  set isLoading(newValue: boolean) {
    this._isLoading = newValue;
    this.stateChanged.emit(void 0);
  }
}

class ToolbarContainer extends VDomRenderer<ToolbarModel> {
  onConnectionUrlChanged(newString: string) {
    if (!this.model) {
      return;
    }
    this.model.connectionUrl = newString;
  }

  render() {
    if (!this.model) {
      return null;
    } else {
      const connectionUrl = this.model.connectionUrl;
      const isLoading = this.model.isLoading;
      return (
        <div className="p-Sql-Toolbar">
          <ConnectionInformation
            connectionUrl={connectionUrl}
            onConnectionUrlChanged={newUrl =>
              this.onConnectionUrlChanged(newUrl)
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
    connectionUrl: string;
    onConnectionUrlChanged: (newUrl: string) => void;
  }
}

class ConnectionInformation extends React.Component<
  ConnectionInformation.Props
  > {
  constructor(props: ConnectionInformation.Props) {
    super(props);
  }

  saveEdit(newConnectionUrl: string) {
    this.props.onConnectionUrlChanged(newConnectionUrl);
  }

  render() {
    const { connectionUrl } = this.props;
    return (
      <ConnectionInformationEdit
        connectionUrl={connectionUrl}
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
      value: ConnectionUrl.sanitize(props.connectionUrl),
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
    this.setState({ value: event.target.value });
  }

  start() {
    this.setState({
      focused: true,
      value: this.props.connectionUrl
    });
  }

  finish() {
    this.props.onFinishEdit(this.state.value);
    this.setState({
      focused: false,
      value: ConnectionUrl.sanitize(this.state.value)
    });
  }

  cancel() {
    this.setState({ value: this.props.connectionUrl });
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
    connectionUrl: string;
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
