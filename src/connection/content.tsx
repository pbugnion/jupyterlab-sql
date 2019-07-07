import * as React from 'react'

import { IDisposable } from '@phosphor/disposable'

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils'

export interface ConnectionsIModel extends IDisposable {
}

export class ConnectionsModel extends VDomModel implements ConnectionsIModel {
  constructor(presets: Array<string>) {
    super();
    this.presets = presets;
  }

  readonly presets: Array<string>;
}

export class ConnectionsWidget extends VDomRenderer<ConnectionsModel> {

  static withModel(model: ConnectionsModel): ConnectionsWidget {
    const widget = new ConnectionsWidget();
    widget.model = model;
    return widget;
  }

  render() {
    if (!this.model) {
      return null;
    } else {
      return <PresetList presets={this.model.presets} />;
    }
  }
}

namespace PresetList {
  export interface Props {
    presets: Array<string>;
  }
}

class PresetList extends React.Component<PresetList.Props> {
  render() {
    const { presets } = this.props;
    const presetItems = presets.map(presetName => (
      <li>
        <span className="jp-DirListing-itemText">{presetName}</span>
      </li>
    ));
    return (
      <ul className="p-Sql-TableList-content">
        {presetItems}
      </ul>
    );
  }
}
