import * as React from 'react';

import { ISignal, Signal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import classNames from 'classNames';

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
      const connectionString = this.model.connectionString
      return (
        <div className="p-Sql-Toolbar">
          <ConnectionInformationEdit
            connectionString={connectionString}
            onFinishEdit={console.log}
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
      value: props.connectionString,
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
      value: this.props.connectionString
    });
  }

  finish() {
    this.props.onFinishEdit(this.state.value);
    this.setState({
      focused: false
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
