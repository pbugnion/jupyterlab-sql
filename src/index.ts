import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette
} from '@jupyterlab/apputils';

import {
  Widget
} from '@phosphor/widgets';

import {
  Message
} from '@phosphor/messaging';

import '../style/index.css';


class JupyterLabSqlWidget extends Widget {
  constructor() {
    super();

    this.id = "jupyterlab-sql";
    this.title.label = "SQL";
    this.title.closable = true;
    this.elem = document.createElement("div");
    this.node.appendChild(this.elem);
  }

  readonly elem: HTMLElement

  onUpdateRequest(message: Message): void {
    fetch("/jupyterlab_sql")
      .then(response => response.json())
      .then(data => {
        const { result } = data;
        this.elem.innerHTML = result;
      })
  }
}


function activate(app: JupyterLab, palette: ICommandPalette) {
  const widget: JupyterLabSqlWidget = new JupyterLabSqlWidget()

  const command: string = "jupyterlab-sql:open";
  app.commands.addCommand(command, {
    label: "SQL",
    execute: () => {
      if (!widget.isAttached) {
        app.shell.addToMainArea(widget);
      }
      widget.update();
      app.shell.activateById(widget.id);
    }
  })

  palette.addItem({ command, category: "SQL" });
}


/**
 * Initialization data for the jupyterlab-sql extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-sql',
  autoStart: true,
  requires: [ICommandPalette],
  activate,
};

export default extension;
