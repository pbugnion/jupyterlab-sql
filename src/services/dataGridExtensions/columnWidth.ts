
import { CellRenderer, TextRenderer } from '@phosphor/datagrid'

import { getFontWidth } from './fontWidth';

export function measureRenderedWidth(content: any, renderer: TextRenderer) {
  const config: CellRenderer.ICellConfig = { x: 1, y: 1, height: 100, width: 20, region: 'body', row: 10, column: 10, metadata: {}, value: content }
  const rendered: string = renderer.format(config)
  const width = getFontWidth('12px sans-serif');
  return rendered.length * width * 0.8;
}
