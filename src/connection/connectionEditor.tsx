import * as React from 'react';

import { ISignal, Signal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import classNames from 'classnames';

// TODO: remove unnused classes

export interface IConnectionEditorModel {
  readonly connectionUrl: string;
  readonly connect: ISignal<this, string>;
  readonly connectionUrlChanged: ISignal<this, string>;
}

export class ConnectionEditorModel extends VDomModel
  implements IConnectionEditorModel {
  constructor(initialConnectionUrl: string) {
    super();
    this._connectionUrl = initialConnectionUrl;
  }

  tryConnect(connectionUrl: string): void {
    this._connect.emit(connectionUrl);
  }

  get connectionUrl(): string {
    return this._connectionUrl;
  }

  set connectionUrl(newValue: string) {
    this._connectionUrl = newValue;
    this._connectionUrlChanged.emit(newValue);
  }

  get connect(): ISignal<this, string> {
    return this._connect;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  private _connectionUrl: string;
  private readonly _connectionUrlChanged = new Signal<this, string>(this);
  private readonly _connect = new Signal<this, string>(this);
}

export class ConnectionEditor extends VDomRenderer<ConnectionEditorModel> {
  static withModel(model: ConnectionEditorModel): ConnectionEditor {
    const editor = new ConnectionEditor();
    editor.model = model;
    return editor;
  }

  onActivateRequest() {
    this.node.querySelector('input').focus();
  }

  render() {
    if (!this.model) {
      return null;
    } else {
      const connectionUrl = this.model.connectionUrl;
      return (
        <div className="p-Sql-ConnectionInformation-container">
          <ConnectionInformationEdit
            initialConnectionUrl={connectionUrl}
            onConnectionUrlChanged={newConnectionUrl =>
              (this.model.connectionUrl = newConnectionUrl)
            }
            onFinishEdit={currentConnectionUrl =>
              this.model.tryConnect(currentConnectionUrl)
            }
          />
          <ConnectionInformationHelper />
        </div>
      );
    }
  }
}

export class ConnectionInformationEdit extends React.Component<
  ConnectionInformationEdit.Props,
  ConnectionInformationEdit.State
  > {
  constructor(props: ConnectionInformationEdit.Props) {
    super(props);
    this.state = {
      connectionUrl: props.initialConnectionUrl,
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
    const newConnectionUrl = event.target.value;
    this.props.onConnectionUrlChanged(newConnectionUrl);
    this.setState({ connectionUrl: newConnectionUrl });
  }

  start() {
    this.setState({
      focused: true
    });
  }

  finish() {
    this.props.onFinishEdit(this.state.connectionUrl);
    this.setState({
      focused: false
    });
  }

  cancel() {
    const newConnectionUrl = this.props.initialConnectionUrl;
    this.props.onConnectionUrlChanged(newConnectionUrl);
    this.setState({ connectionUrl: newConnectionUrl });
  }

  onInputFocus() {
    this.start();
  }

  onInputBlur() {
    this.setState({
      focused: false
    });
  }

  componentDidMount() {
    this.inputRef.current!.focus();
  }

  render() {
    const { connectionUrl, focused } = this.state;
    const inputWrapperClass = classNames(
      'p-Sql-ConnectionInformation-input-wrapper',
      { 'p-mod-focused': focused }
    );
    return (
      <div className="p-Sql-ConnectionInformation-wrapper">
        <div className={inputWrapperClass}>
          <input
            className="p-Sql-ConnectionInformation-text p-Sql-ConnectionInformation-input"
            value={connectionUrl}
            ref={this.inputRef}
            autoFocus={true}
            onChange={event => this.onChange(event)}
            onKeyDown={event => this.onKeyDown(event)}
            onBlur={() => this.onInputBlur()}
            onFocus={() => this.onInputFocus()}
          />
        </div>
      </div>
    );
  }
}

namespace ConnectionInformationEdit {
  export interface Props {
    initialConnectionUrl: string;
    onFinishEdit: (newConnectionUrl: string) => void;
    onConnectionUrlChanged: (newConnectionString: string) => void;
  }

  export interface State {
    connectionUrl: string;
    focused: boolean;
  }
}

export class ConnectionInformationHelper extends React.Component<{}> {
  render() {
    return (
      <div className="jp-RenderedHTMLCommon">
        <p>
          Press <code>Enter</code> to connect to the database.
        </p>
        <p>
          The URL must be a database URL. Follow the{' '}
          <a
            href="https://docs.sqlalchemy.org/en/13/core/engines.html#database-urls"
            target="_blank"
          >
            SQLAlchemy guide
          </a>{' '}
          on URLs. For instance:
        </p>
        <ul>
          <li>
            <pre>postgres://localhost:5432/postgres</pre>
          </li>
          <li>
            <pre>postgres://username:password@localhost:5432/postgres</pre>
          </li>
          <li>
            <pre>mysql://localhost/employees</pre>
          </li>
          <li>
            <pre>sqlite://</pre>
          </li>
          <li>
            <pre>sqlite:///myfile.db</pre>
          </li>
        </ul>
      </div>
    );
  }
}
