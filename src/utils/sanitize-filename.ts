// NOTE: @dv-usama-ansari: Referenced from https://github.com/parshap/truncate-utf8-bytes/blob/master/lib/truncate.js
import { Buffer } from 'buffer';

function isHighSurrogate(codePoint: number) {
  return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint: number) {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

// Truncate string by size in bytes
function truncate(getLength: (str: string) => number, input: string, byteLength: number) {
  let curByteLength = 0;
  let codePoint = 0;
  let segment = '';

  for (let i = 0; i < input.length; i += 1) {
    codePoint = input.charCodeAt(i);
    segment = input[i] as string;

    if (isHighSurrogate(codePoint) && isLowSurrogate(input.charCodeAt(i + 1))) {
      i += 1;
      segment += input[i];
    }

    curByteLength += getLength(segment);

    if (curByteLength === byteLength) {
      return input.slice(0, i + 1);
    }
    if (curByteLength > byteLength) {
      return input.slice(0, i - segment.length + 1);
    }
  }

  return input;
}

// NOTE: @dv-usama-ansari: Referenced from https://github.com/parshap/truncate-utf8-bytes/blob/master/index.js
const getLength = Buffer.byteLength.bind(Buffer);
const boundTruncate = truncate.bind(null, getLength);

// NOTE: @dv-usama-ansari: Referenced from https://github.com/parshap/node-sanitize-filename/blob/master/index.js
const illegalRe = /[/?<>\\:*|"]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[. ]+$/;

function sanitizeHelper(input: string, replacement: string) {
  const sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return boundTruncate(sanitized, 255);
}

export function sanitize(input: string, options?: { replacement?: '' }) {
  const replacement = options?.replacement ?? '';
  const output = sanitizeHelper(input, replacement);
  if (replacement === '') {
    return output;
  }
  return sanitizeHelper(output, '');
}
