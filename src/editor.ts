import {
  IEditorFactoryService, CodeEditor
} from '@jupyterlab/codeeditor';

import { ISignal, Signal } from '@phosphor/signaling';

import {
  Widget
} from '@phosphor/widgets';

export class Editor extends Widget {
  constructor(editorFactory: IEditorFactoryService) {
    super()
    const model = new CodeEditor.Model();
    const editor = editorFactory.newInlineEditor({model, host: this.node});

    editor.addKeydownHandler((_, evt) => this._onKeydown(evt))
  }

  get executeRequest(): ISignal<this, any> {
    return this._executeRequest;
  }

  _onKeydown(event: KeyboardEvent): boolean {
    if (event.shiftKey && event.key === "Enter") {
      console.log("trigger")
      this._executeRequest.emit(67);
      return true
    }
    return false
  }

  private _executeRequest = new Signal<this, any>(this);
}
