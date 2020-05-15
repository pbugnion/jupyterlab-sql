import { Widget } from '@lumino/widgets';

import { IDisposable } from '@lumino/disposable';

import { Toolbar } from '@jupyterlab/apputils';

export interface JupyterLabSqlPage extends IDisposable {
  readonly pageName: PageName;
  readonly content: Widget;
  readonly toolbar: Toolbar;
}

export enum PageName {
  Connection,
  DatabaseSummary,
  TableSummary,
  CustomQuery
}
