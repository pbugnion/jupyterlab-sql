import {
  VDomModel,
  VDomRenderer
} from '@jupyterlab/apputils';

import * as React from 'react';

export class ConnectionInformationModel extends VDomModel {
  constructor() {
    super()
    this.connectionString = "postgres://someconnection"
  }

  connectionString: string
}

export class ConnectionInformation extends VDomRenderer<ConnectionInformationModel> {
  render(): React.ReactElement<any> {
    if (!this.model) {
      return null
    }
    return (
      <div>
        <div className="p-Sql-ConnectionInformation-input-wrapper">
          <div className="p-Sql-ConnectionInformation-input-text">{this.model.connectionString}</div>
        </div>
        <div className="p-Sql-ConnectionInformation-edit-button"></div>
      </div>
    )
  }
}
