import { Widget } from '@phosphor/widgets';

import { Toolbar } from '@jupyterlab/apputils';

export interface JupyterLabSqlPage {
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
