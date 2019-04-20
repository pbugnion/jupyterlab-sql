import { InstanceTracker } from '@jupyterlab/apputils';

import { JupyterLabSqlWidget } from './widget';

export function createTracker(): InstanceTracker<JupyterLabSqlWidget> {
  const namespace: string = 'jupyterlab-sql';

  const tracker = new InstanceTracker<JupyterLabSqlWidget>({
    namespace
  });

  // tracker.widgetAdded.connect((_, widget) => {
  //   widget.content.connectionStringChanged.connect(() => {
  //     tracker.save(widget);
  //   });
  //   widget.content.sqlStatementChanged.connect(() => {
  //     tracker.save(widget);
  //   });
  // });

  return tracker;
}
