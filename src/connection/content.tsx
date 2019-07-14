import * as React from 'react'

import classNames from 'classnames';

import { IDisposable } from '@phosphor/disposable'

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils'

import { ConnectionInformationEdit, ConnectionInformationHelper } from './connectionEditor'

import { Preset } from '../api'


// TODO: factor out common CSS classes
// TODO: factor out common components
// TODO: style around help toggle
// TODO: style around rendered help
// TODO: help message for preset


export interface ConnectionsIModel extends IDisposable {
}

export class ConnectionsModel extends VDomModel implements ConnectionsIModel {
  constructor(presets: Array<Preset>) {
    super();
    this.presets = presets;
  }

  readonly presets: Array<Preset>;
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
    presets: Array<Preset>;
  }
}

class PresetList extends React.Component<PresetList.Props> {
  render() {
    const { presets } = this.props;
    const presetItems = presets.map((preset, i) => (
      <PresetListItem preset={preset} selected={false} key={i} />
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
    preset: Preset;
    selected: boolean;
  }
}


class PresetListItem extends React.Component<PresetListItem.Props> {
  render() {
    const { preset, selected } = this.props;
    const { name, description, url } = preset;
    const title = description || url;
    return (
      <MultiElementListItem title={title} selected={selected}>
        <div className="p-Sql-Listing-itemElement"><span className="c52">{name}</span><code className="c54">{url}</code></div>
      </MultiElementListItem>
    )
  }
}

namespace MultiElementListItem {
  export interface Props {
    selected: boolean;
    title: string;
    children: React.ReactNode;
  }
}

class MultiElementListItem extends React.Component<MultiElementListItem.Props> {
  render() {
    const { selected, title, children } = this.props;
    const classes = classNames('p-Sql-Listing-Item', {
      'jp-mod-selected': selected
    });
    return (
      <li className={classes} title={title}>
        <div className="jp-DirListing-itemIcon p-Sql-DatabaseIcon mod-in-listing" />
        <div className="p-Sql-Listing-Item-ElementContainer">
          {children}
        </div>
      </li>
    )
  }
}

namespace ListHeader {
  export interface Props {
    headerText: string;
  }

  export interface State {
    helpMenuDisplayed: boolean
  }
}

class ListHeader extends React.Component<ListHeader.Props, ListHeader.State> {
  constructor(props: ListHeader.Props) {
    super(props);
    this.state = {
      helpMenuDisplayed: false
    }
    this.onHelpToggleClick = this.onHelpToggleClick.bind(this)
  }

  onHelpToggleClick() {
    this.setState({
      helpMenuDisplayed: !this.state.helpMenuDisplayed
    })
  }

  render() {
    const { headerText } = this.props;
    return (
      <React.Fragment>
        <li className="p-Sql-TableList-header">
          <div className="p-Sql-TableList-HelpHeader-container">
            <span>{headerText}</span>
            <HelpToggle onClick={this.onHelpToggleClick} />
          </div >
        </li >
        {this.state.helpMenuDisplayed && <ConnectionInformationHelper />}
      </React.Fragment>
    );
  }
}


namespace HelpToggle {
  export interface Props {
    onClick: () => void;
  }
}


class HelpToggle extends React.Component<HelpToggle.Props> {
  render() {
    const { onClick } = this.props;
    return <span onClick={onClick}>?</span>;
  }
}
