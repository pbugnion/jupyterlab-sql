import {
  VDomModel,
  VDomRenderer
} from '@jupyterlab/apputils';

import * as React from 'react';

interface ConnectionInformationProps {
  connectionString: string
}

interface ConnectionInformationState {
  editing: boolean
}

export class ConnectionInformationModel extends VDomModel {
  constructor() {
    super()
    this.connectionString = "postgres://someconnection"
  }

  connectionString: string
}

export class ConnectionInformationContainer extends VDomRenderer<ConnectionInformationModel> {
  render(): React.ReactElement<any> {
    if (!this.model) {
      return null
    } else {
      const connectionString = this.model.connectionString;
      return <ConnectionInformation connectionString={connectionString} />;
    }
  }
}

export class ConnectionInformation extends React.Component<ConnectionInformationProps, ConnectionInformationState> {

  constructor(props: ConnectionInformationProps) {
    super(props);
    this.state = { editing: false };
  }

  startEditing() {
    this.setState({ editing: true });
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

  render() {
    const { editing } = this.state
    if (editing) {
      return <p>Editing</p>
    } else {
      return this.renderDisplaying()
    }
  }
}
