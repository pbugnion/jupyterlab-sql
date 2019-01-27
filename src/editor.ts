import {
  IEditorFactoryService, CodeEditor
} from '@jupyterlab/codeeditor';

import { CommandRegistry } from '@phosphor/commands';

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

  readonly commands: CommandRegistry

  _onKeydown(event: KeyboardEvent): boolean {
    if (event.shiftKey && event.key === "Enter") {
      console.log("trigger")
      return true
    }
    return false
  }
}
