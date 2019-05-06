
import * as React from 'react';

import className from 'classNames'

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
}

class TableList extends React.Component<TableList.Props> {
  render() {
    const { tableNames, onNavigateToTable } = this.props
    const items = tableNames.map((tableName, i) =>
      <TableListItem
        tableName={tableName}
        key={i}
        onClick={() => onNavigateToTable(tableName)}
      />
    )
    const classes = className("jp-DirListing-content", "p-Sql-TableList-content")
    return (
      <ul className={classes}>{items}</ul>
    );
  }
}

namespace TableListItem {
  export interface Props {
    tableName: string;
    onClick: () => void;
  }
}

class TableListItem extends React.Component<TableListItem.Props> {
  render() {
    const { tableName, onClick } = this.props
    return (
      <li onClick={onClick} className="jp-DirListing-item" title={tableName}>
        <span className="jp-DirListing-itemText">{tableName}</span>
      </li>
    );
  }
}
