import { InstanceTracker } from '@jupyterlab/apputils';

import { JupyterLabSqlWidget } from './widget';

export function createTracker(): InstanceTracker<JupyterLabSqlWidget> {
  const namespace: string = 'jupyterlab-sql';

  const tracker = new InstanceTracker<JupyterLabSqlWidget>({
    namespace
  });

  tracker.widgetAdded.connect((_, widget) => {
    widget.pageChanged.connect(() => {
      tracker.save(widget);
    })
    widget.connectionUrlChanged.connect(() => {
      tracker.save(widget);
    })
    widget.tableNameChanged.connect(() => {
      tracker.save(widget);
    })
    widget.sqlStatementChanged.connect(() => {
      tracker.save(widget);
    })
  })

  return tracker;
}
