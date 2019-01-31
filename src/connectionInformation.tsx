import {
  VDomModel,
  VDomRenderer
} from '@jupyterlab/apputils';

import * as React from 'react';

interface ConnectionInformationProps {
  connectionString: string
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

export class ConnectionInformation extends React.Component<ConnectionInformationProps, {}> {
  render(): React.ReactElement<any> {
    const { connectionString } = this.props;
    return (
      <div>
        <div className="p-Sql-ConnectionInformation-input-wrapper">
          <div className="p-Sql-ConnectionInformation-input-text">{connectionString}</div>
        </div>
        <div className="p-Sql-ConnectionInformation-edit-button"></div>
      </div>
    )
  }
}
