import { Widget } from '@phosphor/widgets';

import { ToolbarButton } from '@jupyterlab/apputils';

export namespace ToolbarItems {
  export class TextItem extends Widget {
    constructor(value: string) {
      super();
      this.node.innerText = value;
    }
  }

  export class BackButton extends ToolbarButton {
    constructor(options: BackButton.IOptions) {
      super({
        iconClassName: 'jp-UndoIcon jp-Icon jp-Icon-16',
        onClick: options.onClick
      });
    }
  }

  export namespace BackButton {
    export interface IOptions {
      onClick: () => void;
    }
  }

  export class RefreshButton extends ToolbarButton {
    constructor(options: RefreshButton.IOptions) {
      super({
        iconClassName: 'jp-RefreshIcon jp-Icon jp-Icon-16',
        onClick: options.onClick
      });
    }
  }

  export namespace RefreshButton {
    export interface IOptions {
      onClick: () => void;
    }
  }
}
