import { Message } from '@lumino/messaging';

import { Widget } from '@lumino/widgets';

import { SingletonPanel } from '../../../src/components';

namespace Fixtures {
  export class TestWidget extends Widget {
    constructor() {
      super();
      const div = document.createElement('div');
      div.id = 'test-widget-id';
      div.innerHTML = 'some text';
      this.node.appendChild(div);
    }
  }
}

describe('SingletonPanel', () => {
  it('allow setting a widget', () => {
    const panel = new SingletonPanel();
    panel.widget = new Fixtures.TestWidget();
    const widgetNode = panel.node.querySelector('#test-widget-id');
    expect(widgetNode).toBeDefined();
    expect(widgetNode.innerHTML).toEqual('some text');
  });

  it('set the layout to null and ignore new requests to set widget when disposed', () => {
    const panel = new SingletonPanel();
    panel.dispose();
    expect(panel.layout).toBeNull();

    // the following fails without the guard on disposal
    panel.widget = new Fixtures.TestWidget();
  });

  it('resize widgets based on its own size', () => {
    const panel = new SingletonPanel();
    // Set the node as having a fixed size (since jsdom does no layout)
    Object.defineProperties(panel.node, {
      offsetWidth: { get: () => 200 },
      offsetHeight: { get: () => 400 }
    });
    const widget = new Fixtures.TestWidget();
    const resizeSpy = jest.spyOn(widget, 'processMessage');
    panel.widget = widget;
    expect(resizeSpy).toBeCalledWith(new Widget.ResizeMessage(200, 400));
  });

  it('pass on its own resize requests', () => {
    const panel = new SingletonPanel();
    const widget = new Fixtures.TestWidget();
    panel.widget = widget;
    const resizeSpy = jest.spyOn(widget, 'processMessage');
    const resizeMessage = new Widget.ResizeMessage(300, 100);
    // Set the node size (since jsdom does no layout)
    Object.defineProperties(panel.node, {
      offsetWidth: { get: () => 300 },
      offsetHeight: { get: () => 100 }
    });
    panel.processMessage(resizeMessage);
    expect(resizeSpy).toBeCalledWith(resizeMessage);
  });

  it('pass on activate requests', () => {
    const panel = new SingletonPanel();
    const widget = new Fixtures.TestWidget();
    const activateSpy = jest.spyOn(widget, 'activate');
    const nodeFocusSpy = jest.spyOn(widget.node, 'focus');
    panel.widget = widget;
    const message = new Message('activate-request');
    panel.processMessage(message);
    expect(activateSpy).toBeCalledWith();
    expect(nodeFocusSpy).toBeCalledWith();
  });
});
