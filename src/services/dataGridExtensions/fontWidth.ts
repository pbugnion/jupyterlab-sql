/*
 * Measure the width of an M for that font.
 */
export function getFontWidth(font: string): number {
  let width = Private.fontWidthCache[font];

  if (width !== undefined) {
    return width;
  }

  // Normalize the font.
  Private.fontMeasurementGC.font = font;
  let normFont = Private.fontMeasurementGC.font;

  // Set the font on the measurement node.
  Private.fontMeasurementNode.style.font = normFont;

  // Add the measurement node to the document.
  document.body.appendChild(Private.fontMeasurementNode);

  // Measure the node height.
  width = Private.fontMeasurementNode.offsetWidth;

  // Remove the measurement node from the document.
  document.body.removeChild(Private.fontMeasurementNode);

  // Cache the measured height for the font and norm font.
  Private.fontWidthCache[font] = width;
  Private.fontWidthCache[normFont] = width;

  // Return the measured height.
  return width;
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * A cache of measured font heights.
   */
  export const fontWidthCache: { [font: string]: number } = Object.create(null);

  /**
   * The DOM node used for font height measurement.
   */
  export const fontMeasurementNode = (() => {
    let node = document.createElement('div');
    node.style.position = 'absolute';
    node.style.top = '-99999px';
    node.style.left = '-99999px';
    node.style.visibility = 'hidden';
    node.textContent = 'M';
    return node;
  })();

  /**
   * The GC used for font measurement.
   */
  export const fontMeasurementGC = (() => {
    let canvas = document.createElement('canvas');
    canvas.width = 0;
    canvas.height = 0;
    return canvas.getContext('2d')!;
  })();
}
