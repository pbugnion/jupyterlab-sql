import {
  IEditorFactoryService,
  CodeEditor,
  CodeEditorWrapper
} from '@jupyterlab/codeeditor';

import { ISignal, Signal } from '@lumino/signaling';

import { Widget } from '@lumino/widgets';

export interface IEditor {
  readonly widget: Widget;

  readonly value: string;
  readonly execute: ISignal<this, string>;
  readonly valueChanged: ISignal<this, string>;
}

export class Editor implements IEditor {
  constructor(initialValue: string, editorFactory: IEditorFactoryService) {
    this._model = new CodeEditor.Model({ value: initialValue });
    this._widget = new EditorWidget(this._model, editorFactory);
    this._model.value.changed.connect(() => {
      this._valueChanged.emit(this.value);
    });
    this._model.mimeType = 'text/x-sql';
    this._widget.executeCurrent.connect(() => {
      this._execute.emit(this.value);
    });
  }

  get value(): string {
    return this._model.value.text;
  }

  get widget(): Widget {
    return this._widget;
  }

  get execute(): ISignal<this, string> {
    return this._execute;
  }

  get valueChanged(): ISignal<this, string> {
    return this._valueChanged;
  }

  private _execute = new Signal<this, string>(this);
  private _valueChanged = new Signal<this, string>(this);
  private _widget: EditorWidget;
  private _model: CodeEditor.IModel;
}

export class EditorWidget extends CodeEditorWrapper {
  constructor(model: CodeEditor.IModel, editorFactory: IEditorFactoryService) {
    super({
      model,
      factory: editorFactory.newInlineEditor
    });
    this.editor.addKeydownHandler((_, evt) => this._onKeydown(evt));
    this.addClass('p-Sql-Editor');
  }

  get executeCurrent(): ISignal<this, void> {
    return this._executeCurrent;
  }

  _onKeydown(event: KeyboardEvent): boolean {
    if ((event.shiftKey || event.ctrlKey) && event.key === 'Enter') {
      this._executeCurrent.emit(void 0);
      return true;
    }
    return false;
  }

  private _executeCurrent = new Signal<this, void>(this);
}
