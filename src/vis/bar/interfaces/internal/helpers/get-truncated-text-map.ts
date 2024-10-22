export function getTruncatedTextMap(labels: string[], maxWidth: number): { map: Record<string, string>; longestLabelWidth: number } {
  const map: Record<string, string> = {};
  let longestLabelWidth = 0;

  const canvas = new OffscreenCanvas(0, 0);
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const ellipsis = '...';
    const ellipsisWidth = ctx.measureText(ellipsis).width;

    labels.forEach((value) => {
      const renderedTextWidth = ctx.measureText(value).width;
      longestLabelWidth = Math.max(longestLabelWidth, renderedTextWidth);
      let truncatedText = '';
      let currentWidth = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value[i];
        const charWidth = ctx.measureText(char as string).width;

        if (currentWidth + charWidth + ellipsisWidth > maxWidth) {
          truncatedText += ellipsis;
          break;
        } else {
          truncatedText += char;
          currentWidth += charWidth;
        }
      }
      map[value] = truncatedText;
    });
  }

  return { map, longestLabelWidth };
}
