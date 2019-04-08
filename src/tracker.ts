import { MainAreaWidget, InstanceTracker } from '@jupyterlab/apputils';

import { QueryPage } from './queryPage';

export function createTracker(): InstanceTracker<
  MainAreaWidget<QueryPage>
  > {
  const namespace: string = 'jupyterlab-sql';

  const tracker = new InstanceTracker<MainAreaWidget<QueryPage>>({
    namespace
  });

  tracker.widgetAdded.connect((_, widget) => {
    widget.content.connectionStringChanged.connect(() => {
      tracker.save(widget);
    });
    widget.content.sqlStatementChanged.connect(() => {
      tracker.save(widget);
    });
  });

  return tracker;
}
