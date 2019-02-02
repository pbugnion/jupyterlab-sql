import {
  IEditorFactoryService, CodeEditor, CodeEditorWrapper
} from '@jupyterlab/codeeditor';

import { ISignal, Signal } from '@phosphor/signaling';

export class Editor extends CodeEditorWrapper {
  constructor(editorFactory: IEditorFactoryService) {
    super({
      model: new CodeEditor.Model(),
      factory: editorFactory.newInlineEditor,
    })
    this.editor.addKeydownHandler((_, evt) => this._onKeydown(evt))
  }

  get executeRequest(): ISignal<this, string> {
    return this._executeRequest;
  }

  _onKeydown(event: KeyboardEvent): boolean {
    if (event.shiftKey && event.key === "Enter") {
      this._executeRequest.emit(this.model.value.text);
      return true
    }
    return false
  }

  private _executeRequest = new Signal<this, string>(this);
}
