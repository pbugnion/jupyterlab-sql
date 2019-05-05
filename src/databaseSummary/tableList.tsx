
import * as React from 'react';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

export class TableListModel extends VDomModel {

  constructor(tables: Array<string>) {
    super();
    this.tables = tables;
  }

  readonly tables: Array<string>
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
      return <TableList tableNames={this.model.tables} />
    }
  }
}

class TableList extends React.Component<{ tableNames: Array<string> }> {
  render() {
    const { tableNames } = this.props
    const items = tableNames.map((tableName, i) =>
      <TableListItem tableName={tableName} key={i} />
    )
    return (
      <ul>{items}</ul>
    );
  }
}

class TableListItem extends React.Component<{ tableName: string }> {
  render() {
    const { tableName } = this.props
    return <li>{tableName}</li>;
  }
}
