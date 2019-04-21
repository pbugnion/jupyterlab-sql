import { Widget } from '@phosphor/widgets';

import { Toolbar } from '@jupyterlab/apputils';

export interface JupyterLabSqlPage {
  readonly content: Widget;
  readonly toolbar: Toolbar;
}
