import { Widget } from '@phosphor/widgets';

import { SingletonPanel } from '../../../src/components';


namespace Fixtures {
  export class TestWidget extends Widget {
    constructor() {
      super();
      const div = document.createElement('div')
      div.id = 'test-widget-id'
      div.innerHTML = 'some text'
      this.node.appendChild(div)
    }
  }
}

describe('SingletonPanel', () => {
  it('allow setting a widget', () => {
    const w = new Fixtures.TestWidget()
    const panel = new SingletonPanel()
    panel.widget = w
    const widgetNode = panel.node.querySelector('#test-widget-id')
    expect(widgetNode).toBeDefined();
    expect(widgetNode.innerHTML).toEqual('some text');
  })
})
