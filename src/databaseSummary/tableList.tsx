
import * as React from 'react';

import classNames from 'classNames'

import { Signal, ISignal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

export class DatabaseSummaryModel extends VDomModel {
  constructor(tables: Array<string>) {
    super();
    this.tables = tables;
    this.onNavigateToTable = this.onNavigateToTable.bind(this)
    this.onNavigateToCustomQuery = this.onNavigateToCustomQuery.bind(this);
  }

  get navigateToTable(): ISignal<this, string> {
    return this._navigateToTable;
  }

  get navigateToCustomQuery(): ISignal<this, void> {
    return this._navigateToCustomQuery;
  }

  onNavigateToTable(tableName: string) {
    this._navigateToTable.emit(tableName)
  }

  onNavigateToCustomQuery() {
    this._navigateToCustomQuery.emit(void 0);
  }

  readonly tables: Array<string>
  private readonly _navigateToTable = new Signal<this, string>(this);
  private readonly _navigateToCustomQuery = new Signal<this, void>(this);
}

export class DatabaseSummaryWidget extends VDomRenderer<DatabaseSummaryModel> {
  static withModel(model: DatabaseSummaryModel): DatabaseSummaryWidget {
    const tableList = new DatabaseSummaryWidget();
    tableList.model = model;
    return tableList;
  }

  render() {
    if (!this.model) {
      return null;
    } else {
      const { tables, onNavigateToTable, onNavigateToCustomQuery } = this.model
      return (
        <TableList
          tableNames={tables}
          onNavigateToTable={onNavigateToTable}
          onNavigateToCustomQuery={onNavigateToCustomQuery}
        />
      )
    }
  }
}

namespace TableList {
  export interface Props {
    tableNames: Array<string>;
    onNavigateToTable: (tableName: string) => void;
    onNavigateToCustomQuery: () => void;
  }

  export interface State {
    selectedItem: number | null;
  }
}

class TableList extends React.Component<TableList.Props, TableList.State> {
  constructor(props: TableList.Props) {
    super(props);
    this.state = {
      selectedItem: null
    }
  }

  onItemClick(itemNumber: number) {
    this.setState({ selectedItem: itemNumber })
  }

  render() {
    const { tableNames, onNavigateToTable, onNavigateToCustomQuery } = this.props
    const { selectedItem } = this.state;
    const tableItems = tableNames.map((tableName, i) =>
      <TableListItem
        tableName={tableName}
        key={i}
        onClick={() => this.onItemClick(i)}
        onDoubleClick={() => onNavigateToTable(tableName)}
        selected={i === selectedItem}
      />
    )
    return (
      <div className="p-Sql-TableList-container">
        <ul className="p-Sql-TableList-content">
          <ListHeader headerText="Actions" />
          <CustomQueryItem onClick={onNavigateToCustomQuery} />
          <ListHeader headerText="Tables" />
          {tableItems}
        </ul>
      </div>
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

namespace CustomQueryItem {
  export interface Props {
    onClick: () => void;
  }
}

class CustomQueryItem extends React.Component<CustomQueryItem.Props> {
  render() {
    const { onClick } = this.props
    return (
      <li onClick={onClick} className="jp-DirListing-item" title="Custom SQL query">
        <span className="jp-DirListing-itemIcon jp-MaterialIcon jp-CodeConsoleIcon" />
        <span className="jp-DirListing-itemText">Custom SQL query</span>
      </li>
    )
  }
}

namespace ListHeader {
  export interface Props {
    headerText: string
  }
}

class ListHeader extends React.Component<ListHeader.Props> {
  render() {
    const { headerText } = this.props;
    return (
      <li className="p-Sql-TableList-header">
        {headerText}
      </li>
    );
  }
}
