
import {
  MainAreaWidget, InstanceTracker
} from '@jupyterlab/apputils';

import {
  JupyterLabSqlWidget
} from './widget';


export function createTracker(): InstanceTracker<MainAreaWidget<JupyterLabSqlWidget>> {
  const namespace: string = 'jupyterlab-sql';

  const tracker = new InstanceTracker<MainAreaWidget<JupyterLabSqlWidget>>({
    namespace
  });

  tracker.widgetAdded.connect((_, widget) => {
    widget.content.onConnectionStringChanged.connect((_, value: string) => {
      console.log(value)
    });
  })

  return tracker;
}
