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
    const panel = new SingletonPanel()
    panel.widget = new Fixtures.TestWidget()
    const widgetNode = panel.node.querySelector('#test-widget-id')
    expect(widgetNode).toBeDefined();
    expect(widgetNode.innerHTML).toEqual('some text');
  })

  it('resize widgets based on its own size', () => {
    const panel = new SingletonPanel();
    // Set the node as having a fixed size (since jsdom does no layout)
    Object.defineProperties(panel.node, {
      offsetWidth: { get: () => 200 },
      offsetHeight: { get: () => 400 }
    })
    const widget = new Fixtures.TestWidget();
    const resizeSpy = jest.spyOn(widget, 'processMessage')
    panel.widget = widget;
    expect(resizeSpy).toBeCalledWith(new Widget.ResizeMessage(200, 400));
  })
})
