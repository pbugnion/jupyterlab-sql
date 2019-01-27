import {
  IEditorFactoryService, CodeEditor
} from '@jupyterlab/codeeditor';

import { ISignal, Signal } from '@phosphor/signaling';

import { IObservableString } from '@jupyterlab/observables';

import {
  Widget
} from '@phosphor/widgets';

export class Editor extends Widget {
  constructor(editorFactory: IEditorFactoryService) {
    super()
    const model = new CodeEditor.Model();
    this._value = model.value;
    const editor = editorFactory.newInlineEditor({model, host: this.node});

    editor.addKeydownHandler((_, evt) => this._onKeydown(evt))
  }

  readonly model: CodeEditor.IModel;
  private _value: IObservableString;

  get executeRequest(): ISignal<this, string> {
    return this._executeRequest;
  }

  _onKeydown(event: KeyboardEvent): boolean {
    if (event.shiftKey && event.key === "Enter") {
      this._executeRequest.emit(this._value.text);
      return true
    }
    return false
  }

  private _executeRequest = new Signal<this, string>(this);
}
