import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import { Widget } from '@phosphor/widgets';

import '../style/index.css';


class JupyterLabSqlWidget extends Widget {
  constructor() {
    super();
    console.log('starting jupyterlab sql extension');
  }
}


function activate(app: JupyterLab) {
  new JupyterLabSqlWidget()
}


/**
 * Initialization data for the jupyterlab-sql extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-sql',
  autoStart: true,
  activate,
};

export default extension;
