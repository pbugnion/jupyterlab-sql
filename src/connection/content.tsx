import * as React from 'react'

import classNames from 'classnames';

import { IDisposable } from '@phosphor/disposable'

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils'

import { ConnectionInformationEdit, ConnectionInformationHelper } from './connectionEditor'


// TODO: factor out common CSS classes
// TODO: factor out common components

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
    const presetItems = presets.map((presetName, i) => (
      <PresetListItem presetName={presetName} selected={false} key={i} />
    ));
    return (
      <ul className="p-Sql-TableList-content">
        <ListHeader headerText="Custom URL" />
        <li>
          <ConnectionInformationEdit
            initialConnectionUrl="hello"
            onConnectionUrlChanged={() => { }}
            onFinishEdit={() => { }}
          />
        </li>
        <ListHeader headerText="Presets" />
        {presetItems}
      </ul>
    );
  }
}

namespace PresetListItem {
  export interface Props {
    presetName: string;
    selected: boolean;
  }
}


class PresetListItem extends React.Component<PresetListItem.Props> {
  render() {
    const { presetName, selected } = this.props;
    const classes = classNames('jp-DirListing-item', {
      'jp-mod-selected': selected
    });
    return (
      <li
        className={classes}
        title={presetName}
      >
        <span className="jp-DirListing-itemText">{presetName}</span>
      </li>
    )
  }
}

namespace ListHeader {
  export interface Props {
    headerText: string;
  }
}

class ListHeader extends React.Component<ListHeader.Props> {
  render() {
    const { headerText } = this.props;
    return (
      <React.Fragment>
        <li className="p-Sql-TableList-header">
          <div className="p-Sql-TableList-HelpHeader-container">
            <span>{headerText}</span>
            <span>?</span>
          </div >
        </li >
        <ConnectionInformationHelper />
      </React.Fragment>
    );
  }
}
