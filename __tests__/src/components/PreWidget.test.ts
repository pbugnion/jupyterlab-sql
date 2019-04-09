import { PreWidget } from '../../../src/components';

describe('PreWidget', () => {
  it('contain a pre with the message', () => {
    const widget = new PreWidget('hello')
    const pre = widget.node.querySelector('pre')
    expect(pre).toBeDefined();
    expect(pre.innerHTML).toEqual('hello')
  })
})
