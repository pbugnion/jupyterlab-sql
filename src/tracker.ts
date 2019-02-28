
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
    console.log("hello widget!")
  })

  return tracker;
}
