
import * as React from 'react';

import classNames from 'classNames'

import { Signal, ISignal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

export class TableListModel extends VDomModel {
  constructor(tables: Array<string>) {
    super();
    this.tables = tables;
    this.onNavigateToTable = this.onNavigateToTable.bind(this)
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable;
  }

  onNavigateToTable(tableName: string) {
    this._navigateToTable.emit(tableName)
  }

  readonly tables: Array<string>
  private readonly _navigateToTable = new Signal<this, string>(this);
}

export class TableListWidget extends VDomRenderer<TableListModel> {
  static withModel(model: TableListModel): TableListWidget {
    const tableList = new TableListWidget();
    tableList.model = model;
    return tableList;
  }

  render() {
    if (!this.model) {
      return null;
    } else {
      const { tables, onNavigateToTable } = this.model
      return <TableList tableNames={tables} onNavigateToTable={onNavigateToTable} />
    }
  }
}

namespace TableList {
  export interface Props {
    tableNames: Array<string>;
    onNavigateToTable: (tableName: string) => void;
  }

  export interface State {
    selectedItem: number | null;
  }
}

class TableList extends React.Component<TableList.Props, TableList.State> {
  constructor(props: TableList.Props) {
    super(props);
    this.state = {
      selectedItem: 2
    }
  }

  onItemClick(itemNumber: number) {
    this.setState({ selectedItem: itemNumber })
  }

  render() {
    const { tableNames, onNavigateToTable } = this.props
    const { selectedItem } = this.state;
    const items = tableNames.map((tableName, i) =>
      <TableListItem
        tableName={tableName}
        key={i}
        onClick={() => this.onItemClick(i)}
        onDoubleClick={() => onNavigateToTable(tableName)}
        selected={i === selectedItem}
      />
    )
    return (
      <ul className="p-Sql-TableList-content">
        <li className="p-Sql-TableList-header">
          Tables
        </li>
          {items}
      </ul>
    );
  }
}

namespace TableListItem {
  export interface Props {
    tableName: string;
    selected: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
  }
}

class TableListItem extends React.Component<TableListItem.Props> {
  render() {
    const { tableName, onClick, onDoubleClick, selected } = this.props
    const classes = classNames(
      "jp-DirListing-item",
      { "jp-mod-selected": selected }
    )
    return (
      <li onClick={onClick} onDoubleClick={onDoubleClick} className={classes} title={tableName}>
        <span className="jp-DirListing-itemIcon jp-MaterialIcon jp-SpreadsheetIcon" />
        <span className="jp-DirListing-itemText">{tableName}</span>
      </li>
    );
  }
}
