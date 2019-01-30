import {
  VDomModel,
  VDomRenderer
} from '@jupyterlab/apputils';

import * as React from 'react';

export class ConnectionInformationModel extends VDomModel {
}

export class ConnectionInformation extends VDomRenderer<ConnectionInformationModel> {
  render(): React.ReactElement<any> {
    return <pre>postgres://some-connection</pre>;
  }
}
