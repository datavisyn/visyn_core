/**
 * Class that can measure text for a given font very efficiently (about ~1000 times faster than canvas measuretext).
 * It uses a precomputed table of character widths for a given font and size.
 *
 * Also supports utility functions like ellipsis.
 */
export class FastTextMeasure {
  table = new Float32Array(127);

  meanWidth = 0;

  constructor(private font: string) {
    this.computeTable();
  }

  // Computes the whole size table
  computeTable() {
    const textWidthCanvas = document.createElement('canvas');
    const textWidthContext = textWidthCanvas.getContext('2d');

    if (!textWidthContext) {
      throw new Error('Could not get 2d context');
    }

    textWidthContext.font = this.font;

    for (let i = 1; i < 127; i++) {
      this.table[i] = textWidthContext.measureText(String.fromCharCode(i)).width;
      this.meanWidth += this.table[i]!;
    }

    this.meanWidth /= 127;
  }

  // Measures the width of a given text
  fastMeasureText(text: string) {
    let width = 0;

    for (let i = 0; i < text.length; i++) {
      const ascii = text.charCodeAt(i);
      if (ascii < 127) {
        width += this.table[ascii]!;
      } else {
        width += this.meanWidth;
      }
    }

    return width;
  }

  // Cuts off text and adds ellipsis if it exceeds the given width
  textEllipsis(text: string, maxWidth: number) {
    let width = this.fastMeasureText(text);

    if (width <= maxWidth) {
      return text;
    }

    const ellipsisWidth = this.fastMeasureText('...');
    let ellipsisCount = 0;

    while (width + ellipsisWidth > maxWidth) {
      ellipsisCount++;
      width -= this.table[text.charCodeAt(text.length - ellipsisCount)]!;
    }

    return `${text.slice(0, text.length - ellipsisCount)}...`;
  }
}
