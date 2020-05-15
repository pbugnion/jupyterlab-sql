import { Widget } from '@lumino/widgets';

export class PreWidget extends Widget {
  constructor(content: string) {
    super();
    const element = document.createElement('div');
    const pre = document.createElement('pre');
    pre.innerHTML = content;
    element.appendChild(pre);
    this.node.appendChild(element);
  }
}
