import {
  IEditorFactoryService,
  CodeEditor,
  CodeEditorWrapper
} from '@jupyterlab/codeeditor';

import { ISignal, Signal } from '@phosphor/signaling';

export class Editor extends CodeEditorWrapper {
  constructor(initialValue: string, editorFactory: IEditorFactoryService) {
    super({
      model: new CodeEditor.Model({ value: initialValue }),
      factory: editorFactory.newInlineEditor
    });
    this.editor.addKeydownHandler((_, evt) => this._onKeydown(evt));
    this.addClass('p-Sql-Editor');
    this.model.value.changed.connect(() => {
      this._valueChanged.emit(this.model.value.text);
    });
  }

  get executeRequest(): ISignal<this, string> {
    return this._executeRequest;
  }

  get valueChanged(): ISignal<this, string> {
    return this._valueChanged;
  }

  _onKeydown(event: KeyboardEvent): boolean {
    if (event.shiftKey && event.key === 'Enter') {
      this._executeRequest.emit(this.model.value.text);
      return true;
    }
    return false;
  }

  private _executeRequest = new Signal<this, string>(this);
  private _valueChanged = new Signal<this, string>(this);
}
