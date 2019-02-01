import {
  VDomModel,
  VDomRenderer
} from '@jupyterlab/apputils';

import * as React from 'react';

interface ConnectionInformationProps {
  connectionString: string;
  onConnectionStringChanged: (newString: string) => void;
}

interface ConnectionInformationState {
  editing: boolean;
  value: string
}

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

export class ConnectionInformation extends React.Component<ConnectionInformationProps, ConnectionInformationState> {

  constructor(props: ConnectionInformationProps) {
    super(props);
    this.state = { editing: false, value: '' };
  }

  startEditing() {
    const {connectionString} = this.props;
    this.setState({ editing: true, value: connectionString });
  }

  onEditChange(event: any) {
    this.setState({ value: event.target.value });
  }

  onKeyDown(event: any) {
    if (event.key === "Enter") {
      this.saveEditing()
    } else if (event.keyCode === 27) {
      // ESC key
      this.cancelEditing()
    }
  }

  saveEditing() {
    this.setState({ editing: false }, () => {
      this.props.onConnectionStringChanged(this.state.value)
    });
  }

  cancelEditing() {
    this.setState({ editing: false });
  }

  renderDisplaying() {
    const { connectionString } = this.props;
    return (
      <div>
        <div className="p-Sql-ConnectionInformation-input-wrapper">
          <div className="p-Sql-ConnectionInformation-input-text">{connectionString}</div>
        </div>
        <div className="p-Sql-ConnectionInformation-edit-button" onClick={() => this.startEditing() }></div>
      </div>
    )
  }

  renderEditing() {
    const { value } = this.state;
    return (
      <div>
        <div className="p-Sql-ConnectionInformation-input-wrapper">
          <input
            className="p-Sql-ConnectionInformation-input-text"
            value={value}
            onChange={event => this.onEditChange(event)}
            onKeyDown={event => this.onKeyDown(event)}
          />
        </div>
        <div className="p-Sql-ConnectionInformation-edit-button" onClick={() => this.startEditing() }></div>
      </div>
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
