import { NormalizedWheelEvent } from './interfaces';

const DOM_DELTA_PIXEL = 0x00;
const DOM_DELTA_LINE = 0x01;
const DOM_DELTA_PAGE = 0x02;

const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

export function normalizeWheelEvent(
  event: WheelEvent & {
    wheelDelta?: number;
    wheelDeltaX?: number;
    wheelDeltaY?: number;
  },
): NormalizedWheelEvent {
  let spinX = 0;
  let spinY = 0;
  let pixelX = 0;
  let pixelY = 0;

  pixelX = event.deltaX;
  pixelY = event.deltaY;

  switch (event.deltaMode) {
    case DOM_DELTA_PIXEL:
      break;
    case DOM_DELTA_LINE:
      pixelX *= LINE_HEIGHT;
      pixelY *= LINE_HEIGHT;
      break;
    case DOM_DELTA_PAGE:
      pixelX *= PAGE_HEIGHT;
      pixelY *= PAGE_HEIGHT;
      break;
    default:
      break;
  }

  if (pixelX && !spinX) {
    spinX = pixelX < 1 ? -1 : 1;
  }
  if (pixelY && !spinY) {
    spinY = pixelY < 1 ? -1 : 1;
  }

  return {
    spinX,
    spinY,
    pixelX,
    pixelY,
    x: event.clientX,
    y: event.clientY,
  };
}
