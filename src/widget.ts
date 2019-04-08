import { SingletonLayout, Widget, LayoutItem } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { IEditorFactoryService } from '@jupyterlab/codeeditor';

import { QueryPage } from './queryPage';


namespace JupyterLabSqlWidget {
  export interface IOptions {
    name: string;
    initialConnectionString: string;
    initialSqlStatement: string
  }
}


export class JupyterLabSqlWidget extends Widget {
  constructor(editorFactory: IEditorFactoryService, options: JupyterLabSqlWidget.IOptions) {
    super();
    this.name = options.name;
    this.id = 'jupyterlab-sql';
    this.title.label = 'SQL';
    this.title.closable = true;

    this.layout = new SingletonLayout();

    this.editorFactory = editorFactory;
    const widget = new QueryPage(editorFactory, {
      initialConnectionString: options.initialConnectionString,
      initialSqlStatement: options.initialSqlStatement
    })
    this._setCurrentWidget(widget);
  }

  private _setCurrentWidget(widget: Widget) {
    this.layout.widget = widget;
    this._item = new LayoutItem(this.layout.widget);
    this._fitCurrentWidget();
  }

  private _fitCurrentWidget() {
    this._item.update(0, 0, this.node.offsetWidth, this.node.offsetHeight);
  }

  onResize(_: Message) {
    if (this._item) {
      this._fitCurrentWidget();
    }
  }

  readonly editorFactory: IEditorFactoryService;
  readonly name: string;
  readonly layout: SingletonLayout;
  private _item: LayoutItem;
}
