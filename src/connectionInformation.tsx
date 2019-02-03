import {
  VDomModel,
  VDomRenderer
} from '@jupyterlab/apputils';

import * as React from 'react';

export class ConnectionInformationModel extends VDomModel {
  constructor() {
    super()
    this._connectionString = "postgres://localhost:5432/postgres"
  }

  private _connectionString: string

  get connectionString(): string {
    return this._connectionString
  }

  set connectionString(newString: string) {
    this._connectionString = newString;
    this.stateChanged.emit(void 0);
  }
}

export class ConnectionInformationContainer extends VDomRenderer<ConnectionInformationModel> {
  onConnectionStringChanged(newString: string) {
    if (!this.model) {
      return
    }
    this.model.connectionString = newString;
  }

  render(): React.ReactElement<any> {
    if (!this.model) {
      return null
    } else {
      const connectionString = this.model.connectionString;
      return (
        <ConnectionInformation
          connectionString={connectionString}
          onConnectionStringChanged={newString => this.onConnectionStringChanged(newString)}
        />
      )
    }
  }
}

namespace ConnectionInformation {
  export interface Props {
    connectionString: string,
    onConnectionStringChanged: (newString: string) => void;
  }

  export interface State {
    editing: boolean
  }
}

export class ConnectionInformation extends React.Component<
  ConnectionInformation.Props,
  ConnectionInformation.State
> {

  constructor(props: ConnectionInformation.Props) {
    super(props);
    this.state = { editing: false };
  }

  startEditing() {
    this.setState({ editing: true });
  }

  saveEdit(newConnectionString: string) {
    this.setState({ editing: false }, () => {
      this.props.onConnectionStringChanged(newConnectionString)
    });
  }

  cancelEdit() {
    this.setState({ editing: false });
  }

  renderDisplaying() {
    const { connectionString } = this.props;
    return (
      <ConnectionInformationDisplay
        connectionString={connectionString}
        onStartEditing={() => this.startEditing()}
      />
    )
  }

  renderEditing() {
    const { connectionString } = this.props;
    return (
      <ConnectionInformationEdit
        connectionString={connectionString}
        onFinishEdit={
          (newConnectionString: string) => this.saveEdit(newConnectionString)
        }
        onCancelEdit={() => this.cancelEdit()}
      />
    )
  }

  render() {
    const { editing } = this.state
    if (editing) {
      return this.renderEditing();
    } else {
      return this.renderDisplaying()
    }
  }
}

class ConnectionInformationDisplay extends React.Component<{
  connectionString: string,
  onStartEditing: () => void
}, {}> {

  render() {
    const { connectionString, onStartEditing } = this.props;
    return (
      <div className="p-Sql-ConnectionInformation-wrapper">
        <div className="p-Sql-ConnectionInformation-input-wrapper">
          <div className="p-Sql-ConnectionInformation-input-text">
            {connectionString}
          </div>
        </div>
        <div
          className="p-Sql-ConnectionInformation-edit-button"
          onClick={onStartEditing}>
        </div>
      </div>
    )
  }
}

class ConnectionInformationEdit extends React.Component<
  ConnectionInformationEdit.Props,
  ConnectionInformationEdit.State
> {

  constructor(props: ConnectionInformationEdit.Props) {
    super(props);
    this.state = { value: this.props.connectionString }
  }

  onKeyDown(event: any) {
    if (event.key === "Enter") {
      this.finish()
    } else if (event.keyCode === 27) {
      // ESC key
      this.cancel()
    }
  }

  onChange(event: any) {
    this.setState({ value: event.target.value });
  }

  finish() {
    this.props.onFinishEdit(this.state.value);
  }

  cancel() {
    this.props.onCancelEdit();
  }

  render() {
    const { value } = this.state;
    return (
      <div className="p-Sql-ConnectionInformation-wrapper">
        <div className="p-Sql-ConnectionInformation-input-wrapper">
          <input
            className="p-Sql-ConnectionInformation-input-text p-Sql-ConnectionInformation-input"
            value={value}
            onChange={event => this.onChange(event)}
            onKeyDown={event => this.onKeyDown(event)}
          />
        </div>
      </div>
    )
  }
}

namespace ConnectionInformationEdit {
  export interface Props {
    connectionString: string;
    onFinishEdit: (newConnectionString: string) => void;
    onCancelEdit: () => void
  }

  export interface State {
    value: string;
  }
}
