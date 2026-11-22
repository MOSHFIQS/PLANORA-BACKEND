exports.id = 698;
exports.ids = [698];
exports.modules = {

/***/ 18785:
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.L = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.M = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ 80698:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  fileTypeFromBuffer: () => (/* binding */ fileTypeFromBuffer)
});

// UNUSED EXPORTS: FileTypeParser, fileTypeFromBlob, fileTypeFromFile, fileTypeFromStream, fileTypeFromTokenizer, fileTypeStream, normalizeSampleSize, reasonableDetectionSizeInBytes, supportedExtensions, supportedMimeTypes

;// CONCATENATED MODULE: ./node_modules/.pnpm/@borewit+text-codec@0.2.3/node_modules/@borewit/text-codec/lib/index.js
const WINDOWS_1252_EXTRA = {
    0x80: '€',
    0x82: '‚',
    0x83: 'ƒ',
    0x84: '„',
    0x85: '…',
    0x86: '†',
    0x87: '‡',
    0x88: 'ˆ',
    0x89: '‰',
    0x8a: 'Š',
    0x8b: '‹',
    0x8c: 'Œ',
    0x8e: 'Ž',
    0x91: '‘',
    0x92: '’',
    0x93: '“',
    0x94: '”',
    0x95: '•',
    0x96: '–',
    0x97: '—',
    0x98: '˜',
    0x99: '™',
    0x9a: 'š',
    0x9b: '›',
    0x9c: 'œ',
    0x9e: 'ž',
    0x9f: 'Ÿ'
};
const WINDOWS_1252_REVERSE = {};
for (const [code, char] of Object.entries(WINDOWS_1252_EXTRA)) {
    WINDOWS_1252_REVERSE[char] = Number.parseInt(code, 10);
}
let _utf8Decoder;
let _utf8Encoder;
function utf8Decoder() {
    if (_utf8Decoder === undefined) {
        try {
            _utf8Decoder = typeof globalThis.TextDecoder === 'undefined' ? null : new globalThis.TextDecoder('utf-8');
        }
        catch {
            _utf8Decoder = null;
        }
    }
    return _utf8Decoder !== null && _utf8Decoder !== void 0 ? _utf8Decoder : undefined;
}
function utf8Encoder() {
    if (_utf8Encoder === undefined) {
        try {
            _utf8Encoder = typeof globalThis.TextEncoder === 'undefined' ? null : new globalThis.TextEncoder();
        }
        catch {
            _utf8Encoder = null;
        }
    }
    return _utf8Encoder !== null && _utf8Encoder !== void 0 ? _utf8Encoder : undefined;
}
const CHUNK = 32 * 1024;
const REPLACEMENT = 0xfffd;
/**
 * Decode text from binary data
 */
function textDecode(bytes, encoding = 'utf-8') {
    switch (encoding.toLowerCase()) {
        case 'utf-8':
        case 'utf8': {
            const dec = utf8Decoder();
            return dec ? dec.decode(bytes) : decodeUTF8(bytes);
        }
        case 'utf-16le':
            return decodeUTF16LE(bytes);
        case 'us-ascii':
        case 'ascii':
            return decodeASCII(bytes);
        case 'latin1':
        case 'iso-8859-1':
            return decodeLatin1(bytes);
        case 'windows-1252':
            return decodeWindows1252(bytes);
        default:
            throw new RangeError(`Encoding '${encoding}' not supported`);
    }
}
function textEncode(input = '', encoding = 'utf-8') {
    switch (encoding.toLowerCase()) {
        case 'utf-8':
        case 'utf8': {
            const enc = utf8Encoder();
            return enc ? enc.encode(input) : encodeUTF8(input);
        }
        case 'utf-16le':
            return encodeUTF16LE(input);
        case 'us-ascii':
        case 'ascii':
            return encodeASCII(input);
        case 'latin1':
        case 'iso-8859-1':
            return encodeLatin1(input);
        case 'windows-1252':
            return encodeWindows1252(input);
        default:
            throw new RangeError(`Encoding '${encoding}' not supported`);
    }
}
function flushChunk(parts, chunk) {
    if (chunk.length === 0) {
        return;
    }
    parts.push(String.fromCharCode.apply(null, chunk));
    chunk.length = 0;
}
function pushCodeUnit(parts, chunk, codeUnit) {
    chunk.push(codeUnit);
    if (chunk.length >= CHUNK) {
        flushChunk(parts, chunk);
    }
}
function pushCodePoint(parts, chunk, cp) {
    if (cp <= 0xffff) {
        pushCodeUnit(parts, chunk, cp);
        return;
    }
    cp -= 0x10000;
    pushCodeUnit(parts, chunk, 0xd800 + (cp >> 10));
    pushCodeUnit(parts, chunk, 0xdc00 + (cp & 0x3ff));
}
function decodeUTF8(bytes) {
    const parts = [];
    const chunk = [];
    let i = 0;
    // Match TextDecoder("utf-8") default BOM handling
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        i = 3;
    }
    while (i < bytes.length) {
        const b1 = bytes[i];
        if (b1 <= 0x7f) {
            pushCodeUnit(parts, chunk, b1);
            i++;
            continue;
        }
        // Invalid leading bytes: continuation byte or impossible prefixes
        if (b1 < 0xc2 || b1 > 0xf4) {
            pushCodeUnit(parts, chunk, REPLACEMENT);
            i++;
            continue;
        }
        const length = b1 <= 0xdf ? 2 : b1 <= 0xef ? 3 : 4;
        let cp = b1 & (0x7f >> length);
        let lower = b1 === 0xe0 ? 0xa0 : b1 === 0xf0 ? 0x90 : 0x80;
        let upper = b1 === 0xed ? 0x9f : b1 === 0xf4 ? 0x8f : 0xbf;
        let consumed = 1;
        i++;
        // Consume only the valid prefix. An interrupting byte starts a new sequence.
        while (consumed < length && i < bytes.length) {
            const next = bytes[i];
            if (next < lower || next > upper) {
                break;
            }
            cp = (cp << 6) | (next & 0x3f);
            consumed++;
            i++;
            lower = 0x80;
            upper = 0xbf;
        }
        pushCodePoint(parts, chunk, consumed === length ? cp : REPLACEMENT);
    }
    flushChunk(parts, chunk);
    return parts.join('');
}
function decodeUTF16LE(bytes) {
    const parts = [];
    const chunk = [];
    const len = bytes.length;
    let i = 0;
    // Match TextDecoder("utf-16le") default BOM handling
    if (len >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        i = 2;
    }
    while (i + 1 < len) {
        const u1 = bytes[i] | (bytes[i + 1] << 8);
        i += 2;
        // High surrogate
        if (u1 >= 0xd800 && u1 <= 0xdbff) {
            if (i + 1 < len) {
                const u2 = bytes[i] | (bytes[i + 1] << 8);
                if (u2 >= 0xdc00 && u2 <= 0xdfff) {
                    pushCodeUnit(parts, chunk, u1);
                    pushCodeUnit(parts, chunk, u2);
                    i += 2;
                }
                else {
                    pushCodeUnit(parts, chunk, REPLACEMENT);
                }
            }
            else {
                pushCodeUnit(parts, chunk, REPLACEMENT);
            }
            continue;
        }
        // Lone low surrogate
        if (u1 >= 0xdc00 && u1 <= 0xdfff) {
            pushCodeUnit(parts, chunk, REPLACEMENT);
            continue;
        }
        pushCodeUnit(parts, chunk, u1);
    }
    // Odd trailing byte
    if (i < len) {
        pushCodeUnit(parts, chunk, REPLACEMENT);
    }
    flushChunk(parts, chunk);
    return parts.join('');
}
function decodeASCII(bytes) {
    const parts = [];
    for (let i = 0; i < bytes.length; i += CHUNK) {
        const end = Math.min(bytes.length, i + CHUNK);
        const codes = new Array(end - i);
        for (let j = i, k = 0; j < end; j++, k++) {
            codes[k] = bytes[j] & 0x7f;
        }
        parts.push(String.fromCharCode.apply(null, codes));
    }
    return parts.join('');
}
function decodeLatin1(bytes) {
    const parts = [];
    for (let i = 0; i < bytes.length; i += CHUNK) {
        const end = Math.min(bytes.length, i + CHUNK);
        const codes = new Array(end - i);
        for (let j = i, k = 0; j < end; j++, k++) {
            codes[k] = bytes[j];
        }
        parts.push(String.fromCharCode.apply(null, codes));
    }
    return parts.join('');
}
function decodeWindows1252(bytes) {
    const parts = [];
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        const extra = b >= 0x80 && b <= 0x9f ? WINDOWS_1252_EXTRA[b] : undefined;
        out += extra !== null && extra !== void 0 ? extra : String.fromCharCode(b);
        if (out.length >= CHUNK) {
            parts.push(out);
            out = '';
        }
    }
    if (out) {
        parts.push(out);
    }
    return parts.join('');
}
function encodeUTF8(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
        let cp = str.charCodeAt(i);
        // Valid surrogate pair
        if (cp >= 0xd800 && cp <= 0xdbff) {
            if (i + 1 < str.length) {
                const lo = str.charCodeAt(i + 1);
                if (lo >= 0xdc00 && lo <= 0xdfff) {
                    cp = 0x10000 + ((cp - 0xd800) << 10) + (lo - 0xdc00);
                    i++;
                }
                else {
                    cp = REPLACEMENT;
                }
            }
            else {
                cp = REPLACEMENT;
            }
        }
        else if (cp >= 0xdc00 && cp <= 0xdfff) {
            // Lone low surrogate
            cp = REPLACEMENT;
        }
        if (cp < 0x80) {
            out.push(cp);
        }
        else if (cp < 0x800) {
            out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
        }
        else if (cp < 0x10000) {
            out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        }
        else {
            out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        }
    }
    return new Uint8Array(out);
}
function encodeUTF16LE(str) {
    // Preserve JS string code units, but do not emit non-well-formed UTF-16.
    // Replace lone surrogates with U+FFFD.
    const units = [];
    for (let i = 0; i < str.length; i++) {
        const u = str.charCodeAt(i);
        if (u >= 0xd800 && u <= 0xdbff) {
            if (i + 1 < str.length) {
                const lo = str.charCodeAt(i + 1);
                if (lo >= 0xdc00 && lo <= 0xdfff) {
                    units.push(u, lo);
                    i++;
                }
                else {
                    units.push(REPLACEMENT);
                }
            }
            else {
                units.push(REPLACEMENT);
            }
            continue;
        }
        if (u >= 0xdc00 && u <= 0xdfff) {
            units.push(REPLACEMENT);
            continue;
        }
        units.push(u);
    }
    const out = new Uint8Array(units.length * 2);
    for (let i = 0; i < units.length; i++) {
        const code = units[i];
        const o = i * 2;
        out[o] = code & 0xff;
        out[o + 1] = code >>> 8;
    }
    return out;
}
function encodeASCII(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        out[i] = str.charCodeAt(i) & 0x7f;
    }
    return out;
}
function encodeLatin1(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        out[i] = str.charCodeAt(i) & 0xff;
    }
    return out;
}
function encodeWindows1252(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        const code = ch.charCodeAt(0);
        if (WINDOWS_1252_REVERSE[ch] !== undefined) {
            out[i] = WINDOWS_1252_REVERSE[ch];
            continue;
        }
        if ((code >= 0x00 && code <= 0x7f) || (code >= 0xa0 && code <= 0xff)) {
            out[i] = code;
            continue;
        }
        out[i] = 0x3f; // '?'
    }
    return out;
}

// EXTERNAL MODULE: ./node_modules/.pnpm/ieee754@1.2.1/node_modules/ieee754/index.js
var ieee754 = __webpack_require__(18785);
;// CONCATENATED MODULE: ./node_modules/.pnpm/token-types@6.2.0/node_modules/token-types/dist/lib/index.js


// Primitive types
function dv(array) {
    return new DataView(array.buffer, array.byteOffset);
}
/*
 * 8-bit unsigned integer
 */
const UINT8 = {
    len: 1,
    get(array, offset) {
        return dv(array).getUint8(offset);
    },
    put(array, offset, value) {
        dv(array).setUint8(offset, value);
        return offset + 1;
    }
};
/**
 * 16-bit unsigned integer, Little Endian byte order
 */
const UINT16_LE = {
    len: 2,
    get(array, offset) {
        return dv(array).getUint16(offset, true);
    },
    put(array, offset, value) {
        dv(array).setUint16(offset, value, true);
        return offset + 2;
    }
};
/**
 * 16-bit unsigned integer, Big Endian byte order
 */
const UINT16_BE = {
    len: 2,
    get(array, offset) {
        return dv(array).getUint16(offset);
    },
    put(array, offset, value) {
        dv(array).setUint16(offset, value);
        return offset + 2;
    }
};
/**
 * 24-bit unsigned integer, Little Endian byte order
 */
const UINT24_LE = {
    len: 3,
    get(array, offset) {
        const dataView = dv(array);
        return dataView.getUint8(offset) + (dataView.getUint16(offset + 1, true) << 8);
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint8(offset, value & 0xff);
        dataView.setUint16(offset + 1, value >> 8, true);
        return offset + 3;
    }
};
/**
 * 24-bit unsigned integer, Big Endian byte order
 */
const UINT24_BE = {
    len: 3,
    get(array, offset) {
        const dataView = dv(array);
        return (dataView.getUint16(offset) << 8) + dataView.getUint8(offset + 2);
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint16(offset, value >> 8);
        dataView.setUint8(offset + 2, value & 0xff);
        return offset + 3;
    }
};
/**
 * 32-bit unsigned integer, Little Endian byte order
 */
const UINT32_LE = {
    len: 4,
    get(array, offset) {
        return dv(array).getUint32(offset, true);
    },
    put(array, offset, value) {
        dv(array).setUint32(offset, value, true);
        return offset + 4;
    }
};
/**
 * 32-bit unsigned integer, Big Endian byte order
 */
const UINT32_BE = {
    len: 4,
    get(array, offset) {
        return dv(array).getUint32(offset);
    },
    put(array, offset, value) {
        dv(array).setUint32(offset, value);
        return offset + 4;
    }
};
/**
 * 8-bit signed integer
 */
const INT8 = {
    len: 1,
    get(array, offset) {
        return dv(array).getInt8(offset);
    },
    put(array, offset, value) {
        dv(array).setInt8(offset, value);
        return offset + 1;
    }
};
/**
 * 16-bit signed integer, Big Endian byte order
 */
const INT16_BE = {
    len: 2,
    get(array, offset) {
        return dv(array).getInt16(offset);
    },
    put(array, offset, value) {
        dv(array).setInt16(offset, value);
        return offset + 2;
    }
};
/**
 * 16-bit signed integer, Little Endian byte order
 */
const INT16_LE = {
    len: 2,
    get(array, offset) {
        return dv(array).getInt16(offset, true);
    },
    put(array, offset, value) {
        dv(array).setInt16(offset, value, true);
        return offset + 2;
    }
};
/**
 * 24-bit signed integer, Little Endian byte order
 */
const INT24_LE = {
    len: 3,
    get(array, offset) {
        const unsigned = UINT24_LE.get(array, offset);
        return unsigned > 0x7fffff ? unsigned - 0x1000000 : unsigned;
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint8(offset, value & 0xff);
        dataView.setUint16(offset + 1, value >> 8, true);
        return offset + 3;
    }
};
/**
 * 24-bit signed integer, Big Endian byte order
 */
const INT24_BE = {
    len: 3,
    get(array, offset) {
        const unsigned = UINT24_BE.get(array, offset);
        return unsigned > 0x7fffff ? unsigned - 0x1000000 : unsigned;
    },
    put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint16(offset, value >> 8);
        dataView.setUint8(offset + 2, value & 0xff);
        return offset + 3;
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
const INT32_BE = {
    len: 4,
    get(array, offset) {
        return dv(array).getInt32(offset);
    },
    put(array, offset, value) {
        dv(array).setInt32(offset, value);
        return offset + 4;
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
const INT32_LE = {
    len: 4,
    get(array, offset) {
        return dv(array).getInt32(offset, true);
    },
    put(array, offset, value) {
        dv(array).setInt32(offset, value, true);
        return offset + 4;
    }
};
/**
 * 64-bit unsigned integer, Little Endian byte order
 */
const UINT64_LE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigUint64(offset, true);
    },
    put(array, offset, value) {
        dv(array).setBigUint64(offset, value, true);
        return offset + 8;
    }
};
/**
 * 64-bit signed integer, Little Endian byte order
 */
const INT64_LE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigInt64(offset, true);
    },
    put(array, offset, value) {
        dv(array).setBigInt64(offset, value, true);
        return offset + 8;
    }
};
/**
 * 64-bit unsigned integer, Big Endian byte order
 */
const UINT64_BE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigUint64(offset);
    },
    put(array, offset, value) {
        dv(array).setBigUint64(offset, value);
        return offset + 8;
    }
};
/**
 * 64-bit signed integer, Big Endian byte order
 */
const INT64_BE = {
    len: 8,
    get(array, offset) {
        return dv(array).getBigInt64(offset);
    },
    put(array, offset, value) {
        dv(array).setBigInt64(offset, value);
        return offset + 8;
    }
};
/**
 * IEEE 754 16-bit (half precision) float, big endian
 */
const Float16_BE = {
    len: 2,
    get(dataView, offset) {
        return ieee754/* read */.L(dataView, offset, false, 10, this.len);
    },
    put(dataView, offset, value) {
        ieee754/* write */.M(dataView, value, offset, false, 10, this.len);
        return offset + this.len;
    }
};
/**
 * IEEE 754 16-bit (half precision) float, little endian
 */
const Float16_LE = {
    len: 2,
    get(array, offset) {
        return ieee754/* read */.L(array, offset, true, 10, this.len);
    },
    put(array, offset, value) {
        ieee754/* write */.M(array, value, offset, true, 10, this.len);
        return offset + this.len;
    }
};
/**
 * IEEE 754 32-bit (single precision) float, big endian
 */
const Float32_BE = {
    len: 4,
    get(array, offset) {
        return dv(array).getFloat32(offset);
    },
    put(array, offset, value) {
        dv(array).setFloat32(offset, value);
        return offset + 4;
    }
};
/**
 * IEEE 754 32-bit (single precision) float, little endian
 */
const Float32_LE = {
    len: 4,
    get(array, offset) {
        return dv(array).getFloat32(offset, true);
    },
    put(array, offset, value) {
        dv(array).setFloat32(offset, value, true);
        return offset + 4;
    }
};
/**
 * IEEE 754 64-bit (double precision) float, big endian
 */
const Float64_BE = {
    len: 8,
    get(array, offset) {
        return dv(array).getFloat64(offset);
    },
    put(array, offset, value) {
        dv(array).setFloat64(offset, value);
        return offset + 8;
    }
};
/**
 * IEEE 754 64-bit (double precision) float, little endian
 */
const Float64_LE = {
    len: 8,
    get(array, offset) {
        return dv(array).getFloat64(offset, true);
    },
    put(array, offset, value) {
        dv(array).setFloat64(offset, value, true);
        return offset + 8;
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, big endian
 */
const Float80_BE = {
    len: 10,
    get(array, offset) {
        return ieee754/* read */.L(array, offset, false, 63, this.len);
    },
    put(array, offset, value) {
        ieee754/* write */.M(array, value, offset, false, 63, this.len);
        return offset + this.len;
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, little endian
 */
const Float80_LE = {
    len: 10,
    get(array, offset) {
        return ieee754/* read */.L(array, offset, true, 63, this.len);
    },
    put(array, offset, value) {
        ieee754/* write */.M(array, value, offset, true, 63, this.len);
        return offset + this.len;
    }
};
/**
 * Ignore a given number of bytes
 */
class IgnoreType {
    /**
     * @param len number of bytes to ignore
     */
    constructor(len) {
        this.len = len;
    }
    get(_array, _off) {
        // ToDo: don't read, but skip data
    }
}
/**
 * Fixed-size byte array
 */
class Uint8ArrayType {
    constructor(len) {
        this.len = len;
    }
    get(array, offset) {
        return array.subarray(offset, offset + this.len);
    }
    put(array, offset, value) {
        if (value.length !== this.len) {
            throw new RangeError(`Expected a value of ${this.len} byte(s), got ${value.length}`);
        }
        array.set(value, offset);
        return offset + this.len;
    }
}
/**
 * Decode or encode a fixed number of bytes as a string with a specified encoding.
 * Supports all encodings supported by TextDecoder, plus 'windows-1252'.
 */
class StringType {
    constructor(len, encoding) {
        this.len = len;
        this.encoding = encoding;
    }
    get(data, offset = 0) {
        const bytes = data.subarray(offset, offset + this.len);
        return textDecode(bytes, this.encoding);
    }
    put(array, offset, value) {
        const bytes = textEncode(value, this.encoding);
        if (bytes.length !== this.len) {
            throw new RangeError(`Expected an encoded value of ${this.len} byte(s), got ${bytes.length}`);
        }
        array.set(bytes, offset);
        return offset + this.len;
    }
}
/**
 * ANSI Latin 1 String using Windows-1252 (Code Page 1252)
 * Windows-1252 is a superset of ISO 8859-1 / Latin-1.
 */
class AnsiStringType extends StringType {
    constructor(len) {
        super(len, 'windows-1252');
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/Errors.js
const defaultMessages = 'End-Of-Stream';
/**
 * Thrown on read operation of the end of file or stream has been reached
 */
class EndOfStreamError extends Error {
    constructor() {
        super(defaultMessages);
        this.name = 'EndOfStreamError';
    }
}
class AbortError extends Error {
    constructor(message = 'The operation was aborted') {
        super(message);
        this.name = 'AbortError';
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/AbortSignal.js

/** Reject an already-cancelled operation before acquiring tokenizer resources. */
function AbortSignal_throwIfAborted(signal) {
    if (signal?.aborted) {
        throw new AbortError();
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/BufferSizeError.js
/** Thrown before a tokenizer or writer buffer exceeds its configured limit. */
class BufferSizeError_BufferSizeError extends RangeError {
    /**
     * Create an error describing an allocation that exceeds the configured limit.
     * @param requestedSize - Requested buffer size in bytes
     * @param maxBufferSize - Configured maximum buffer size in bytes
     */
    constructor(requestedSize, maxBufferSize) {
        super(`Requested buffer size ${requestedSize} exceeds maxBufferSize ${maxBufferSize}`);
        this.requestedSize = requestedSize;
        this.maxBufferSize = maxBufferSize;
        this.name = 'BufferSizeError';
    }
}
/**
 * Validate options before acquiring file handles or stream readers.
 * @param options - Tokenizer options containing the optional allocation limit
 * @returns Configured buffer limit in bytes, or Infinity when the limit is disabled
 * @throws RangeError if maxBufferSize is neither a positive safe integer nor Infinity
 */
function BufferSizeError_getMaxBufferSize(options) {
    const limit = options?.maxBufferSize ?? Number.POSITIVE_INFINITY;
    if (limit !== Number.POSITIVE_INFINITY && (!Number.isSafeInteger(limit) || limit <= 0)) {
        throw new RangeError('maxBufferSize must be a positive safe integer or Infinity');
    }
    return limit;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/AbstractStreamReader.js

class AbstractStreamReader {
    constructor(options) {
        this.endOfStream = false;
        this.interrupted = false;
        /**
         * Store peeked data
         * @type {Array}
         */
        this.peekQueue = [];
        this.onCloseCallback = options?.onClose;
    }
    async peek(uint8Array, mayBeLess = false) {
        const bytesRead = await this.read(uint8Array, mayBeLess);
        this.peekQueue.push(uint8Array.subarray(0, bytesRead)); // Put read data back to peek buffer
        return bytesRead;
    }
    async read(buffer, mayBeLess = false) {
        if (buffer.length === 0) {
            return 0;
        }
        let bytesRead = this.readFromPeekBuffer(buffer);
        if (!this.endOfStream) {
            bytesRead += await this.readRemainderFromStream(buffer.subarray(bytesRead), mayBeLess);
        }
        if (bytesRead === 0 && !mayBeLess) {
            throw new EndOfStreamError();
        }
        return bytesRead;
    }
    /**
     * Read chunk from stream
     * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
     * @returns Number of bytes read
     */
    readFromPeekBuffer(buffer) {
        let remaining = buffer.length;
        let bytesRead = 0;
        // consume peeked data first
        while (this.peekQueue.length > 0 && remaining > 0) {
            const peekData = this.peekQueue.pop(); // Front of queue
            if (!peekData) {
                throw new Error('peekData should be defined');
            }
            const lenCopy = Math.min(peekData.length, remaining);
            buffer.set(peekData.subarray(0, lenCopy), bytesRead);
            bytesRead += lenCopy;
            remaining -= lenCopy;
            if (lenCopy < peekData.length) {
                // remainder back to queue
                this.peekQueue.push(peekData.subarray(lenCopy));
            }
        }
        return bytesRead;
    }
    async readRemainderFromStream(buffer, mayBeLess) {
        let bytesRead = 0;
        // Continue reading from stream if required
        while (bytesRead < buffer.length && !this.endOfStream) {
            if (this.interrupted) {
                throw new AbortError();
            }
            const chunkLen = await this.readFromStream(buffer.subarray(bytesRead), mayBeLess);
            if (chunkLen === 0) {
                break;
            }
            bytesRead += chunkLen;
        }
        if (!mayBeLess && bytesRead < buffer.length) {
            throw new EndOfStreamError();
        }
        return bytesRead;
    }
    /** Share resource cleanup, callback completion and failures across close calls. */
    close() {
        this.closePromise ?? (this.closePromise = Promise.resolve().then(async () => {
            await this.closeResource();
            await this.onCloseCallback?.();
        }));
        return this.closePromise;
    }
    /** Backend cleanup completes before the optional close callback. */
    closeResource() {
        return this.abort();
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/Deferred.js
class Deferred {
    constructor() {
        this.resolve = () => null;
        this.reject = () => null;
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/StreamReader.js



function handlePostEndError() {
    this.removeListener('close', removePostEndErrorHandler);
}
function removePostEndErrorHandler() {
    this.removeListener('error', handlePostEndError);
}
/**
 * Node.js Readable Stream Reader
 * Ref: https://nodejs.org/api/stream.html#readable-streams
 */
class StreamReader_StreamReader extends AbstractStreamReader {
    constructor(s, options) {
        super(options);
        this.s = s;
        /**
         * Pending requests waiting for data, tracked until completion or cancellation
         */
        this.pendingRequests = new Set();
        this.onEnd = () => {
            this.endOfStream = true;
            this.removeLifecycleListeners();
            // Auto-destruction may emit an error after `end`. These shared handlers do
            // not retain this reader when `emitClose` is disabled.
            this.s.once('error', handlePostEndError);
            this.s.once('close', removePostEndErrorHandler);
            for (const request of this.pendingRequests) {
                this.removeRequest(request);
                request.deferred.resolve(0);
            }
        };
        this.onError = (err) => this.reject(err);
        this.onClose = () => {
            this.removeLifecycleListeners();
            // Normal EOF may leave peeked bytes that the caller still needs to consume.
            if (!this.endOfStream) {
                void this.abort();
            }
        };
        if (!s.read || !s.once) {
            throw new Error('Expected an instance of stream.Readable');
        }
        this.s.once('end', this.onEnd);
        this.s.once('error', this.onError);
        this.s.once('close', this.onClose);
    }
    /**
     * Read chunk from stream
     * @param buffer Target Uint8Array (or Buffer) to store data read from stream in
     * @param mayBeLess - If true, may fill the buffer partially
     * @returns Number of bytes read
     */
    async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0) {
            return 0;
        }
        const readBuffer = this.s.read(buffer.length);
        if (readBuffer) {
            buffer.set(readBuffer);
            return readBuffer.length;
        }
        const request = {
            buffer,
            mayBeLess,
            deferred: new Deferred(),
            onReadable: () => this.readDeferred(request)
        };
        this.pendingRequests.add(request);
        this.s.once('readable', request.onReadable);
        return request.deferred.promise;
    }
    /**
     * Process deferred read request
     * @param request Deferred read request
     */
    readDeferred(request) {
        if (this.interrupted || !this.pendingRequests.has(request)) {
            return;
        }
        try {
            const readBuffer = this.s.read(request.buffer.length);
            // Reading may synchronously emit an error or close event that cancels the request.
            if (!this.pendingRequests.has(request)) {
                return;
            }
            if (readBuffer) {
                request.buffer.set(readBuffer);
                this.removeRequest(request);
                request.deferred.resolve(readBuffer.length);
            }
            else {
                this.s.once('readable', request.onReadable);
            }
        }
        catch (error) {
            this.reject(error instanceof Error ? error : new Error(String(error)));
        }
    }
    removeRequest(request) {
        this.s.removeListener('readable', request.onReadable);
        this.pendingRequests.delete(request);
    }
    removeLifecycleListeners() {
        this.s.removeListener('end', this.onEnd);
        this.s.removeListener('error', this.onError);
        this.s.removeListener('close', this.onClose);
    }
    reject(err) {
        this.removeLifecycleListeners();
        this.interrupted = true;
        this.peekQueue = [];
        for (const request of this.pendingRequests) {
            this.removeRequest(request);
            request.deferred.reject(err);
        }
    }
    async abort() {
        this.reject(new AbortError());
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/WebStreamReader.js

class WebStreamReader extends AbstractStreamReader {
    constructor(reader, options) {
        super(options);
        this.reader = reader;
        this.released = false;
    }
    async abort() {
        if (!this.released) {
            this.reader.releaseLock();
            this.released = true;
        }
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/WebStreamByobReader.js

/**
 * Read from a WebStream using a BYOB reader
 * Reference: https://nodejs.org/api/webstreams.html#class-readablestreambyobreader
 */
class WebStreamByobReader extends WebStreamReader {
    /**
     * Read from stream
     * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
     * @param mayBeLess - If true, may fill the buffer partially
     * @protected Bytes read
     */
    async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0) {
            return 0;
        }
        const result = await this.reader.read(new Uint8Array(buffer.length), {
            min: mayBeLess ? undefined : buffer.length
        });
        if (result.done) {
            this.endOfStream = result.done;
        }
        if (result.value) {
            buffer.set(result.value);
            return result.value.length;
        }
        return 0;
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/WebStreamDefaultReader.js


class WebStreamDefaultReader extends AbstractStreamReader {
    constructor(reader, options) {
        super(options);
        this.reader = reader;
        this.buffer = null; // Internal buffer to store excess data
    }
    /**
     * Copy chunk to target, and store the remainder in this.buffer
     */
    writeChunk(target, chunk) {
        const written = Math.min(chunk.length, target.length);
        target.set(chunk.subarray(0, written));
        // Adjust the remainder of the buffer
        if (written < chunk.length) {
            this.buffer = chunk.subarray(written);
        }
        else {
            this.buffer = null;
        }
        return written;
    }
    /**
     * Read from stream
     * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
     * @param mayBeLess - If true, may fill the buffer partially
     * @protected Bytes read
     */
    async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0) {
            return 0;
        }
        let totalBytesRead = 0;
        // Serve from the internal buffer first
        if (this.buffer) {
            totalBytesRead += this.writeChunk(buffer, this.buffer);
        }
        // Continue reading from the stream if more data is needed
        while (totalBytesRead < buffer.length && !this.endOfStream) {
            const result = await this.reader.read();
            if (result.done) {
                this.endOfStream = true;
                break;
            }
            if (result.value) {
                totalBytesRead += this.writeChunk(buffer.subarray(totalBytesRead), result.value);
            }
        }
        if (!mayBeLess && totalBytesRead === 0 && this.endOfStream) {
            throw new EndOfStreamError();
        }
        return totalBytesRead;
    }
    abort() {
        this.interrupted = true;
        return this.reader.cancel();
    }
    async closeResource() {
        try {
            await this.abort();
        }
        finally {
            this.reader.releaseLock();
        }
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/WebStreamReaderFactory.js


function makeWebStreamReader(stream, options) {
    try {
        const reader = stream.getReader({ mode: 'byob' });
        if (reader instanceof ReadableStreamDefaultReader) {
            // Fallback to default reader in case `mode: byob` is ignored
            return new WebStreamDefaultReader(reader, options);
        }
        return new WebStreamByobReader(reader, options);
    }
    catch (error) {
        if (error instanceof TypeError) {
            // Fallback to default reader in case `mode: byob` rejected by a `TypeError`
            return new WebStreamDefaultReader(stream.getReader(), options);
        }
        throw error;
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/stream/index.js






;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/AbstractTokenizer.js



/**
 * Core tokenizer
 */
class AbstractTokenizer {
    /**
     * Constructor
     * @param options Tokenizer options
     * @protected
     */
    constructor(options) {
        this.numBuffer = new Uint8Array(10); // Includes the 80-bit floating-point tokens.
        /**
         * Tokenizer-stream position
         */
        this.position = 0;
        this.maxBufferSize = BufferSizeError_getMaxBufferSize(options);
        AbortSignal_throwIfAborted(options?.abortSignal);
        this.onClose = options?.onClose;
        if (options?.abortSignal) {
            this.addAbortListener(options.abortSignal, () => {
                void this.abort().catch(() => {
                    // Signal events cannot propagate cancellation errors; explicit abort/close calls still reject.
                });
            });
        }
    }
    addAbortListener(signal, listener) {
        this.abortSignal = signal;
        this.abortListener = listener;
        signal.addEventListener('abort', listener, { once: true });
    }
    removeAbortListener() {
        if (this.abortListener) {
            this.abortSignal?.removeEventListener('abort', this.abortListener);
        }
        this.abortSignal = undefined;
        this.abortListener = undefined;
    }
    /**
     * Read a token from the tokenizer-stream
     * @param token - The token to read
     * @param position - If provided, the desired position in the tokenizer-stream
     * @returns Promise with token data
     */
    async readToken(token, position = this.position) {
        this.validateTokenRead(token.len, position);
        const uint8Array = new Uint8Array(token.len);
        const len = await this.readBuffer(uint8Array, { position });
        if (len < token.len) {
            throw new EndOfStreamError();
        }
        return token.get(uint8Array, 0);
    }
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @returns Promise with token data
     */
    async peekToken(token, position = this.position) {
        const peekPosition = position ?? this.position;
        this.validateTokenRead(token.len, peekPosition, true);
        const uint8Array = new Uint8Array(token.len);
        const len = await this.peekBuffer(uint8Array, { position: peekPosition });
        if (len < token.len) {
            throw new EndOfStreamError();
        }
        return token.get(uint8Array, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async readNumber(token) {
        const len = await this.readBuffer(this.numBuffer, { length: token.len });
        if (len < token.len) {
            throw new EndOfStreamError();
        }
        return token.get(this.numBuffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async peekNumber(token) {
        const len = await this.peekBuffer(this.numBuffer, { length: token.len });
        if (len < token.len) {
            throw new EndOfStreamError();
        }
        return token.get(this.numBuffer, 0);
    }
    /**
     * Ignore number of bytes, advances the pointer in under tokenizer-stream.
     * @param length - Number of bytes to ignore.  Must be ≥ 0.
     * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
     */
    async ignore(length) {
        if (length < 0) {
            throw new RangeError('ignore length must be ≥ 0 bytes');
        }
        this.validateLength(length, 'ignore length');
        this.validateLength(this.position + length, 'end position');
        if (this.fileInfo.size !== undefined) {
            const bytesLeft = Math.max(0, this.fileInfo.size - this.position);
            if (length > bytesLeft) {
                this.position += bytesLeft;
                return bytesLeft;
            }
        }
        this.position += length;
        return length;
    }
    close() {
        if (!this.closePromise) {
            this.removeAbortListener();
            // Cache completion before invoking cleanup hooks or caller callbacks.
            this.closePromise = Promise.resolve().then(() => this.closeOnce());
        }
        return this.closePromise;
    }
    /** Perform cleanup once, sharing completion and the first error across close calls. */
    async closeOnce() {
        await this.abort();
        await this.onClose?.();
    }
    /**
     * Validate a byte length or position before using it in buffer calculations.
     * @param value - Value that must be a non-negative safe integer
     * @param name - Label used in the validation error
     * @throws RangeError if the value is negative or not a safe integer
     */
    validateLength(value, name) {
        if (!Number.isSafeInteger(value) || value < 0) {
            throw new RangeError(`${name} must be a non-negative safe integer`);
        }
    }
    /**
     * Validate a requested buffer size against the configured allocation limit.
     * @param length - Requested buffer size in bytes
     * @throws RangeError if the length is negative or not a safe integer
     * @throws BufferSizeError if the length exceeds maxBufferSize
     */
    validateBufferSize(length) {
        this.validateLength(length, 'buffer length');
        if (length > this.maxBufferSize) {
            throw new BufferSizeError_BufferSizeError(length, this.maxBufferSize);
        }
    }
    /**
     * Validate a token request before allocating a buffer or consuming input.
     * @param length - Token length in bytes
     * @param position - Byte offset where the token starts
     * @param peek - Whether to include skipped stream bytes in the lookahead limit
     * @throws RangeError if a length or position is negative or not a safe integer
     * @throws BufferSizeError if the token buffer or stream lookahead exceeds maxBufferSize
     * @throws Error if a stream request starts before the current position
     * @throws EndOfStreamError if the token extends beyond the known input size
     */
    validateTokenRead(length, position, peek = false) {
        this.validateBufferSize(length);
        this.validateLength(position, 'position');
        this.validateLength(position + length, 'end position');
        if (!this.supportsRandomAccess() && position < this.position) {
            throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
        }
        if (peek && !this.supportsRandomAccess()) {
            this.validateBufferSize(length + position - this.position);
        }
        if (this.fileInfo.size !== undefined && length > this.fileInfo.size - position) {
            throw new EndOfStreamError();
        }
    }
    /**
     * Apply defaults and validate buffer read or peek options.
     * @param uint8Array - Target buffer whose length is the default read length
     * @param options - Requested length, position and partial-read behavior
     * @returns Validated options with an explicit length, position and mayBeLess flag
     * @throws RangeError if a length or position is invalid, or the length exceeds the target buffer
     * @throws Error if a stream request starts before the current position
     */
    normalizeOptions(uint8Array, options) {
        const length = options?.length ?? uint8Array.length;
        const position = options?.position ?? this.position;
        this.validateLength(length, 'length');
        this.validateLength(position, 'position');
        this.validateLength(position + length, 'end position');
        if (length > uint8Array.length) {
            throw new RangeError('length must not exceed the target buffer length');
        }
        if (!this.supportsRandomAccess() && position < this.position) {
            throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
        }
        return { length, position, mayBeLess: options?.mayBeLess ?? false };
    }
    abort() {
        this.removeAbortListener();
        return Promise.resolve(); // Ignore abort signal
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/BlobTokenizer.js


class BlobTokenizer extends AbstractTokenizer {
    /**
     * Construct BufferTokenizer
     * @param blob - Uint8Array to tokenize
     * @param options Tokenizer options
     */
    constructor(blob, options) {
        super(options);
        this.blob = blob;
        this.fileInfo = { ...(options?.fileInfo ?? {}), ...{ size: blob.size, mimeType: blob.type } };
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async readBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const bytesRead = await this.peekBuffer(uint8Array, normOptions);
        this.position = normOptions.position + bytesRead;
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async peekBuffer(buffer, options) {
        const normOptions = this.normalizeOptions(buffer, options);
        const bytes2read = Math.max(0, Math.min(this.blob.size - normOptions.position, normOptions.length));
        if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
            throw new EndOfStreamError();
        }
        for (let offset = 0; offset < bytes2read;) {
            const chunkLength = Math.min(this.maxBufferSize, bytes2read - offset);
            const position = normOptions.position + offset;
            const arrayBuffer = await this.blob.slice(position, position + chunkLength).arrayBuffer();
            buffer.set(new Uint8Array(arrayBuffer), offset);
            offset += chunkLength;
        }
        return bytes2read;
    }
    close() {
        return super.close();
    }
    supportsRandomAccess() {
        return true;
    }
    setPosition(position) {
        this.validateLength(position, 'position');
        this.position = position;
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/BufferTokenizer.js


class BufferTokenizer extends AbstractTokenizer {
    /**
     * Construct BufferTokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options Tokenizer options
     */
    constructor(uint8Array, options) {
        super(options);
        this.uint8Array = uint8Array;
        this.fileInfo = { ...(options?.fileInfo ?? {}), ...{ size: uint8Array.length } };
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async readBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const bytesRead = await this.peekBuffer(uint8Array, normOptions);
        this.position = normOptions.position + bytesRead;
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param uint8Array
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const bytes2read = Math.max(0, Math.min(this.uint8Array.length - normOptions.position, normOptions.length));
        if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
            throw new EndOfStreamError();
        }
        uint8Array.set(this.uint8Array.subarray(normOptions.position, normOptions.position + bytes2read));
        return bytes2read;
    }
    close() {
        return super.close();
    }
    supportsRandomAccess() {
        return true;
    }
    setPosition(position) {
        this.validateLength(position, 'position');
        this.position = position;
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/ReadStreamTokenizer.js


const ignoreChunkSize = 256000;
class ReadStreamTokenizer_ReadStreamTokenizer extends AbstractTokenizer {
    /**
     * Constructor
     * @param streamReader stream-reader to read from
     * @param options Tokenizer options
     */
    constructor(streamReader, options) {
        super(options);
        this.streamReader = streamReader;
        this.fileInfo = options?.fileInfo ?? {};
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Target Uint8Array to fill with data read from the tokenizer-stream
     * @param options - Read behaviour options
     * @returns Promise with number of bytes read
     */
    async readBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const skipBytes = normOptions.position - this.position;
        if (skipBytes > 0) {
            await this.ignore(skipBytes);
            return this.readBuffer(uint8Array, options);
        }
        if (skipBytes < 0) {
            throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
        }
        if (normOptions.length === 0) {
            return 0;
        }
        let bytesRead = 0;
        // Account for partial input before reporting an exact-read failure.
        while (bytesRead < normOptions.length) {
            const chunkLength = Math.min(this.maxBufferSize, normOptions.length - bytesRead);
            const count = await this.streamReader.read(uint8Array.subarray(bytesRead, bytesRead + chunkLength), true);
            bytesRead += count;
            this.position += count;
            if (count < chunkLength) {
                break;
            }
        }
        if (!normOptions.mayBeLess && bytesRead < normOptions.length) {
            throw new EndOfStreamError();
        }
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param uint8Array - Uint8Array (or Buffer) to write data to
     * @param options - Read behaviour options
     * @returns Promise with number of bytes peeked
     */
    async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        if (normOptions.length === 0) {
            return 0;
        }
        // A known-empty range needs neither lookahead allocation nor source I/O.
        if (this.fileInfo.size !== undefined && normOptions.position >= this.fileInfo.size) {
            if (normOptions.mayBeLess) {
                return 0;
            }
            throw new EndOfStreamError();
        }
        const lookaheadSize = normOptions.length + normOptions.position - this.position;
        this.validateBufferSize(lookaheadSize);
        let bytesRead = 0;
        if (normOptions.position) {
            const skipBytes = normOptions.position - this.position;
            if (skipBytes > 0) {
                const skipBuffer = new Uint8Array(normOptions.length + skipBytes);
                bytesRead = await this.peekBuffer(skipBuffer, { mayBeLess: normOptions.mayBeLess });
                const bytesPeeked = Math.max(0, bytesRead - skipBytes);
                uint8Array.set(skipBuffer.subarray(skipBytes, skipBytes + bytesPeeked));
                return bytesPeeked;
            }
            if (skipBytes < 0) {
                throw new Error('Cannot peek from a negative offset in a stream');
            }
        }
        if (normOptions.length > 0) {
            try {
                // The reader retains this buffer. Keep it independent of caller-owned memory,
                // including partial bytes retained when an exact peek encounters truncation.
                const peekBuffer = new Uint8Array(normOptions.length);
                bytesRead = await this.streamReader.peek(peekBuffer, true);
                uint8Array.set(peekBuffer.subarray(0, bytesRead));
            }
            catch (err) {
                if (options?.mayBeLess && err instanceof EndOfStreamError) {
                    return 0;
                }
                throw err;
            }
            if (!normOptions.mayBeLess && bytesRead < normOptions.length) {
                throw new EndOfStreamError();
            }
        }
        return bytesRead;
    }
    /**
     * @param length Number of bytes to ignore. Must be ≥ 0.
     */
    async ignore(length) {
        if (length < 0) {
            throw new RangeError('ignore length must be ≥ 0 bytes');
        }
        this.validateLength(length, 'ignore length');
        this.validateLength(this.position + length, 'end position');
        if (length > 0 && this.fileInfo.size !== undefined && length > this.fileInfo.size - this.position) {
            throw new EndOfStreamError();
        }
        const bufSize = Math.min(ignoreChunkSize, this.maxBufferSize, length);
        const buf = new Uint8Array(bufSize);
        let totBytesRead = 0;
        while (totBytesRead < length) {
            const remaining = length - totBytesRead;
            const bytesRead = await this.readBuffer(buf, { length: Math.min(bufSize, remaining) });
            if (bytesRead < 0) {
                return bytesRead;
            }
            totBytesRead += bytesRead;
        }
        return totBytesRead;
    }
    abort() {
        this.removeAbortListener();
        return this.streamReader.abort();
    }
    async close() {
        this.removeAbortListener();
        return this.streamReader.close();
    }
    supportsRandomAccess() {
        return false;
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/TokenizerBoundaryError.js
/** A request exceeds a tokenizer view, rather than encountering truncated input. */
class TokenizerBoundaryError extends RangeError {
    constructor(position, length, size) {
        super(`Range at position ${position} with length ${length} exceeds tokenizer view size ${size}`);
        this.position = position;
        this.length = length;
        this.size = size;
        this.name = 'TokenizerBoundaryError';
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/isRandomAccessTokenizer.js
/**
 * Check for random-access capability, position control and a known file size.
 * A known size alone does not imply random access.
 */
function isRandomAccessTokenizer(tokenizer) {
    return (tokenizer.supportsRandomAccess() &&
        'setPosition' in tokenizer &&
        typeof tokenizer.setPosition === 'function' &&
        typeof tokenizer.fileInfo.size === 'number');
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/TokenizerView.js



function validateOffset(value, name) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError(`${name} must be a non-negative safe integer`);
    }
}
function createTokenizerView(source, length) {
    return isRandomAccessTokenizer(source)
        ? new RandomAccessTokenizerView(source, length)
        : new TokenizerView(source, length);
}
class TokenizerView {
    constructor(source, size) {
        this.source = source;
        this.size = size;
        this.closed = false;
        this.closedPosition = 0;
        this.busy = false;
        validateOffset(size, 'length');
        validateOffset(source.position, 'source position');
        validateOffset(source.position + size, 'end position');
        if (source instanceof TokenizerView) {
            source.assertAvailable();
            source.translateRange(size, source.position);
        }
        this.start = source.position;
        // A chunk has its own size; the outer file's MIME type/path need not describe it.
        this.fileInfo = { size };
    }
    get position() {
        return this.closed ? this.closedPosition : this.source.position - this.start;
    }
    get remaining() {
        return this.size - this.position;
    }
    supportsRandomAccess() {
        return false;
    }
    createView(length) {
        this.assertAvailable();
        return createTokenizerView(this, length);
    }
    async readBuffer(buffer, options) {
        return this.bufferOperation('readBuffer', buffer, options);
    }
    async peekBuffer(buffer, options) {
        return this.bufferOperation('peekBuffer', buffer, options);
    }
    async bufferOperation(method, buffer, options) {
        this.assertAvailable();
        const length = options?.length ?? buffer.length;
        const position = options?.position ?? this.position;
        const absolutePosition = this.translateRange(length, position);
        if (length > buffer.length) {
            throw new RangeError('length must not exceed the target buffer length');
        }
        return this.run(() => this.source[method](buffer, { ...options, length, position: absolutePosition }));
    }
    async readToken(token, position = this.position) {
        this.assertAvailable();
        const absolutePosition = this.translateRange(token.len, position);
        return this.run(() => this.source.readToken(token, absolutePosition));
    }
    async peekToken(token, position = this.position) {
        this.assertAvailable();
        const absolutePosition = this.translateRange(token.len, position ?? this.position);
        return this.run(() => this.source.peekToken(token, absolutePosition));
    }
    async readNumber(token) {
        this.assertAvailable();
        this.translateRange(token.len, this.position);
        return this.run(() => this.source.readNumber(token));
    }
    async peekNumber(token) {
        this.assertAvailable();
        this.translateRange(token.len, this.position);
        return this.run(() => this.source.peekNumber(token));
    }
    async ignore(length) {
        this.assertAvailable();
        this.translateRange(length, this.position);
        return this.run(() => this.source.ignore(length));
    }
    async consumeRemainder() {
        this.assertAvailable();
        const length = this.remaining;
        const end = this.translateRange(length, this.position) + length;
        return this.run(async () => {
            if (length === 0) {
                return 0;
            }
            if (isRandomAccessTokenizer(this.source)) {
                // Unlike ignore()/setPosition(), this verifies that the final byte exists,
                // including a file that was truncated after its initial stat. No large read.
                if ((await this.source.peekBuffer(new Uint8Array(1), { position: end - 1 })) !== 1) {
                    throw new EndOfStreamError();
                }
                this.source.setPosition(end);
            }
            else {
                const ignored = await this.source.ignore(length);
                if (ignored !== length) {
                    throw new EndOfStreamError();
                }
            }
            return length;
        });
    }
    /** Release this view only. Never drain, close or abort the borrowed source. */
    async close() {
        if (this.closed) {
            return;
        }
        if (this.busy) {
            throw new Error('Cannot close a tokenizer view during an active operation');
        }
        this.closedPosition = this.position;
        this.closed = true;
    }
    /** Explicit cancellation propagates to the shared source and affects its other users. */
    async abort() {
        if (this.closed) {
            return;
        }
        try {
            await this.source.abort();
        }
        finally {
            this.closedPosition = this.position;
            this.closed = true;
        }
    }
    assertAvailable() {
        if (this.closed) {
            throw new Error('Tokenizer view is closed');
        }
        if (this.busy) {
            throw new Error('Tokenizer views require sequential operations');
        }
        if (this.source instanceof TokenizerView) {
            this.source.assertAvailable();
        }
    }
    /** Validate the whole request before delegating or allowing a token allocation. */
    translateRange(length, position) {
        validateOffset(length, 'length');
        validateOffset(position, 'position');
        validateOffset(position + length, 'end position');
        if (position > this.size || length > this.size - position) {
            throw new TokenizerBoundaryError(position, length, this.size);
        }
        if (!this.supportsRandomAccess() && position < this.position) {
            throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
        }
        return this.start + position;
    }
    async run(operation) {
        this.busy = true;
        try {
            return await operation();
        }
        finally {
            this.busy = false;
        }
    }
}
class RandomAccessTokenizerView extends TokenizerView {
    constructor(source, size) {
        super(source, size);
    }
    supportsRandomAccess() {
        return true;
    }
    setPosition(position) {
        this.assertAvailable();
        this.source.setPosition(this.translateRange(0, position));
    }
    createView(length) {
        this.assertAvailable();
        return createTokenizerView(this, length);
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/TokenWriter.js

const DEFAULT_INITIAL_CAPACITY = 1024;
const MINIMUM_CAPACITY = 16;
/**
 * Growable byte buffer for serializing tokens.
 *
 * Numeric and structured tokens are written through their `IToken.put`
 * implementation, so encoding and decoding share the same token definition.
 * Encoders must write synchronously within their declared token region and
 * must not retain the destination buffer.
 */
class TokenWriter {
    /**
     * Create a token writer.
     * @param initialCapacity - Initial buffer size in bytes. The writer grows as needed.
     * Defaults to 1024, reduced to maxBufferSize when a smaller cap is configured.
     * @param options - Optional output and backing-buffer limit.
     */
    constructor(initialCapacity, options) {
        this.offset = 0;
        this.maxBufferSize = getMaxBufferSize(options);
        const capacity = initialCapacity === undefined ? Math.min(DEFAULT_INITIAL_CAPACITY, this.maxBufferSize) : initialCapacity;
        this.validateCapacity(capacity, 'initialCapacity');
        this.buffer = new Uint8Array(Math.min(this.maxBufferSize, Math.max(MINIMUM_CAPACITY, capacity)));
    }
    /**
     * Number of bytes written so far.
     */
    get length() {
        return this.offset;
    }
    /**
     * Reserve a zero-filled region and advance the write position.
     * @param length - Number of bytes to reserve.
     * @returns Offset of the reserved region.
     */
    reserve(length) {
        this.validateLength(length, 'length');
        const start = this.offset;
        this.ensureCapacity(length);
        this.offset += length;
        return start;
    }
    /**
     * Encode a token at the current write position.
     * If encoding throws, the written bytes and length remain unchanged.
     * @param token - Token providing the byte length and encoder.
     * @param value - Value to encode.
     * @returns Number of bytes written, equal to token.len.
     */
    writeToken(token, value) {
        const length = token.len;
        this.validateLength(length, 'token length');
        this.ensureCapacity(length);
        const start = this.offset;
        try {
            token.put(this.buffer, start, value);
        }
        catch (error) {
            this.buffer.fill(0, start, start + length);
            throw error;
        }
        this.offset += length;
        return length;
    }
    /**
     * Append raw bytes.
     * @param value - Bytes to append. The data is copied.
     * @returns Number of bytes written.
     */
    writeBuffer(value) {
        this.validateLength(value.length, 'value length');
        const start = this.offset;
        this.ensureCapacity(value.length);
        this.buffer.set(value, start);
        this.offset += value.length;
        return value.length;
    }
    /**
     * Alias for writeBuffer. The data is copied.
     * @param value - Bytes to append.
     * @returns Number of bytes written.
     */
    writeBytes(value) {
        return this.writeBuffer(value);
    }
    /**
     * Append zero bytes.
     * @param length - Number of zero bytes to append.
     * @returns Number of bytes written.
     */
    writeZeros(length) {
        const start = this.reserve(length);
        this.buffer.fill(0, start, start + length);
        return length;
    }
    /**
     * Overwrite a previously reserved or written region with an encoded token.
     * If encoding throws, the original bytes are restored and length is unchanged.
     * @param token - Token providing the byte length and encoder.
     * @param offset - Absolute offset of the region.
     * @param value - Value to encode.
     */
    patchToken(token, offset, value) {
        this.validateLength(offset, 'offset');
        const length = token.len;
        this.validateLength(length, 'token length');
        if (offset + length > this.offset) {
            throw new RangeError(`Invalid patch range: offset=${offset}, length=${length}, written=${this.offset}`);
        }
        const original = this.buffer.slice(offset, offset + length);
        try {
            token.put(this.buffer, offset, value);
        }
        catch (error) {
            this.buffer.set(original, offset);
            throw error;
        }
    }
    /**
     * Return a copy of the written bytes.
     */
    toUint8Array() {
        return this.buffer.slice(0, this.offset);
    }
    ensureCapacity(extra) {
        const required = this.offset + extra;
        this.validateCapacity(required, 'required capacity');
        if (required <= this.buffer.length) {
            return;
        }
        let capacity = this.buffer.length;
        while (capacity < required) {
            capacity = Math.min(capacity * 2, this.maxBufferSize);
        }
        const next = new Uint8Array(capacity);
        next.set(this.buffer.subarray(0, this.offset));
        this.buffer = next;
    }
    validateCapacity(value, name) {
        this.validateLength(value, name);
        if (value > this.maxBufferSize) {
            throw new BufferSizeError(value, this.maxBufferSize);
        }
    }
    validateLength(value, name) {
        if (!Number.isSafeInteger(value) || value < 0) {
            throw new RangeError(`${name} must be a non-negative safe integer`);
        }
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/strtok3@10.8.0/node_modules/strtok3/lib/core.js













/**
 * Construct ReadStreamTokenizer from given Stream.
 * Will set fileSize, if provided given Stream has set the .path property/
 * @param stream - Read from Node.js Stream.Readable
 * @param options - Tokenizer options
 * @returns ReadStreamTokenizer
 */
function fromStream(stream, options) {
    getMaxBufferSize(options);
    throwIfAborted(options?.abortSignal);
    const streamReader = new StreamReader(stream);
    return new ReadStreamTokenizer(streamReader, options);
}
/**
 * Construct ReadStreamTokenizer from given ReadableStream (WebStream API).
 * Will set fileSize, if provided given Stream has set the .path property/
 * @param webStream - Read from Node.js Stream.Readable (must be a byte stream)
 * @param options - Tokenizer options
 * @returns ReadStreamTokenizer
 */
function fromWebStream(webStream, options) {
    BufferSizeError_getMaxBufferSize(options);
    AbortSignal_throwIfAborted(options?.abortSignal);
    const webStreamReader = makeWebStreamReader(webStream);
    return new ReadStreamTokenizer_ReadStreamTokenizer(webStreamReader, options);
}
/**
 * Construct ReadStreamTokenizer from given Buffer.
 * @param uint8Array - Uint8Array to tokenize
 * @param options - Tokenizer options
 * @returns BufferTokenizer
 */
function fromBuffer(uint8Array, options) {
    return new BufferTokenizer(uint8Array, options);
}
/**
 * Construct ReadStreamTokenizer from given Blob.
 * @param blob - Uint8Array to tokenize
 * @param options - Tokenizer options
 * @returns BufferTokenizer
 */
function fromBlob(blob, options) {
    return new BlobTokenizer(blob, options);
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@tokenizer+inflate@0.6.1/node_modules/@tokenizer/inflate/lib/GzipHandler.js
class GzipHandler {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
    }
    inflate() {
        const tokenizer = this.tokenizer;
        return new ReadableStream({
            async pull(controller) {
                const buffer = new Uint8Array(1024);
                const size = await tokenizer.readBuffer(buffer, { mayBeLess: true });
                if (size === 0) {
                    controller.close();
                    return;
                }
                controller.enqueue(buffer.subarray(0, size));
            }
        }).pipeThrough(new DecompressionStream('gzip'));
    }
}

// EXTERNAL MODULE: ./node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/index.js
var src = __webpack_require__(66835);
;// CONCATENATED MODULE: ./node_modules/.pnpm/@tokenizer+inflate@0.6.1/node_modules/@tokenizer/inflate/lib/ZipLimitError.js
/** A configured ZIP processing limit was exceeded. */
class ZipLimitError extends RangeError {
    constructor(limit, requestedSize, maxSize) {
        super(`ZIP ${limit} exceeded: ${requestedSize} exceeds limit of ${maxSize}`);
        this.limit = limit;
        this.requestedSize = requestedSize;
        this.maxSize = maxSize;
        this.name = 'ZipLimitError';
    }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@tokenizer+inflate@0.6.1/node_modules/@tokenizer/inflate/lib/ZipToken.js
/**
 * Ref https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
 */

const Signature = {
    LocalFileHeader: 0x04034b50,
    DataDescriptor: 0x08074b50,
    CentralFileHeader: 0x02014b50,
    EndOfCentralDirectory: 0x06054b50
};
const DataDescriptor = {
    get(array) {
        return {
            signature: UINT32_LE.get(array, 0),
            compressedSize: UINT32_LE.get(array, 8),
            uncompressedSize: UINT32_LE.get(array, 12)
        };
    },
    len: 16
};
/**
 * First part of the ZIP Local File Header
 * Offset | Bytes| Description
 * -------|------+-------------------------------------------------------------------
 *      0 |    4 | Signature (0x04034b50)
 *      4 |    2 | Minimum version needed to extract
 *      6 |    2 | Bit flag
 *      8 |    2 | Compression method
 *     10 |    2 | File last modification time (MS-DOS format)
 *     12 |    2 | File last modification date (MS-DOS format)
 *     14 |    4 | CRC-32 of uncompressed data
 *     18 |    4 | Compressed size
 *     22 |    4 | Uncompressed size
 *     26 |    2 | File name length (n)
 *     28 |    2 | Extra field length (m)
 *     30 |    n | File name
 * 30 + n |    m | Extra field
 */
const LocalFileHeaderToken = {
    get(array) {
        const flags = UINT16_LE.get(array, 6);
        return {
            signature: UINT32_LE.get(array, 0),
            minVersion: UINT16_LE.get(array, 4),
            dataDescriptor: !!(flags & 0x0008),
            compressedMethod: UINT16_LE.get(array, 8),
            compressedSize: UINT32_LE.get(array, 18),
            uncompressedSize: UINT32_LE.get(array, 22),
            filenameLength: UINT16_LE.get(array, 26),
            extraFieldLength: UINT16_LE.get(array, 28),
            filename: null
        };
    },
    len: 30
};
/**
 * 4.3.16  End of central directory record:
 *  end of central dir signature (0x06064b50)                                      4 bytes
 *  number of this disk                                                            2 bytes
 *  number of the disk with the start of the central directory                     2 bytes
 *  total number of entries in the central directory on this disk                  2 bytes
 *  total number of entries in the size of the central directory                   2 bytes
 *  sizeOfTheCentralDirectory                                                      4 bytes
 *  offset of start of central directory with respect to the starting disk number  4 bytes
 *  .ZIP file comment length                                                       2 bytes
 *  .ZIP file comment       (variable size)
 */
const EndOfCentralDirectoryRecordToken = {
    get(array) {
        return {
            signature: UINT32_LE.get(array, 0),
            nrOfThisDisk: UINT16_LE.get(array, 4),
            nrOfThisDiskWithTheStart: UINT16_LE.get(array, 6),
            nrOfEntriesOnThisDisk: UINT16_LE.get(array, 8),
            nrOfEntriesOfSize: UINT16_LE.get(array, 10),
            sizeOfCd: UINT32_LE.get(array, 12),
            offsetOfStartOfCd: UINT32_LE.get(array, 16),
            zipFileCommentLength: UINT16_LE.get(array, 20)
        };
    },
    len: 22
};
/**
 * File header:
 *    central file header signature   4 bytes   0 (0x02014b50)
 *    version made by                 2 bytes   4
 *    version needed to extract       2 bytes   6
 *    general purpose bit flag        2 bytes   8
 *    compression method              2 bytes  10
 *    last mod file time              2 bytes  12
 *    last mod file date              2 bytes  14
 *    crc-32                          4 bytes  16
 *    compressed size                 4 bytes  20
 *    uncompressed size               4 bytes  24
 *    file name length                2 bytes  28
 *    extra field length              2 bytes  30
 *    file comment length             2 bytes  32
 *    disk number start               2 bytes  34
 *    internal file attributes        2 bytes  36
 *    external file attributes        4 bytes  38
 *    relative offset of local header 4 bytes  42
 */
const FileHeader = {
    get(array) {
        const flags = UINT16_LE.get(array, 8);
        return {
            signature: UINT32_LE.get(array, 0),
            minVersion: UINT16_LE.get(array, 6),
            dataDescriptor: !!(flags & 0x0008),
            compressedMethod: UINT16_LE.get(array, 10),
            compressedSize: UINT32_LE.get(array, 20),
            uncompressedSize: UINT32_LE.get(array, 24),
            filenameLength: UINT16_LE.get(array, 28),
            extraFieldLength: UINT16_LE.get(array, 30),
            fileCommentLength: UINT16_LE.get(array, 32),
            relativeOffsetOfLocalHeader: UINT32_LE.get(array, 42),
            filename: null
        };
    },
    len: 46
};

;// CONCATENATED MODULE: ./node_modules/.pnpm/@tokenizer+inflate@0.6.1/node_modules/@tokenizer/inflate/lib/ZipHandler.js





function signatureToArray(signature) {
    const signatureBytes = new Uint8Array(UINT32_LE.len);
    UINT32_LE.put(signatureBytes, 0, signature);
    return signatureBytes;
}
const debug = src('tokenizer:inflate');
const syncBufferSize = 256 * 1024;
const eocdSignatureBytes = signatureToArray(Signature.EndOfCentralDirectory);
class ZipHandler {
    constructor(tokenizer, options = {}) {
        this.tokenizer = tokenizer;
        this.syncBuffer = new Uint8Array(syncBufferSize);
        this.scannedBytes = 0;
        this.descriptorScannedBytes = 0;
        this.limits = {
            maxEntryCount: options.maxEntryCount ?? Number.POSITIVE_INFINITY,
            maxTotalScanBytes: options.maxTotalScanBytes ?? Number.POSITIVE_INFINITY,
            maxTotalDataDescriptorScanBytes: options.maxTotalDataDescriptorScanBytes ?? Number.POSITIVE_INFINITY,
            maxSkippedEntrySize: options.maxSkippedEntrySize ?? Number.POSITIVE_INFINITY,
            maxDataDescriptorScanBytes: options.maxDataDescriptorScanBytes ?? Number.POSITIVE_INFINITY,
            maxCompressedSize: options.maxCompressedSize ?? Number.POSITIVE_INFINITY,
            maxUncompressedSize: options.maxUncompressedSize ?? Number.POSITIVE_INFINITY
        };
        this.useCentralDirectory = options.useCentralDirectory ?? true;
        this.allowTruncatedDataDescriptor = options.allowTruncatedDataDescriptor ?? false;
        if (typeof this.useCentralDirectory !== 'boolean') {
            throw new TypeError('useCentralDirectory must be a boolean');
        }
        if (typeof this.allowTruncatedDataDescriptor !== 'boolean') {
            throw new TypeError('allowTruncatedDataDescriptor must be a boolean');
        }
        for (const [name, limit] of Object.entries(this.limits)) {
            if (limit !== Number.POSITIVE_INFINITY && (!Number.isSafeInteger(limit) || limit <= 0)) {
                throw new RangeError(`${name} must be a positive safe integer or Infinity`);
            }
        }
    }
    /** Reject oversized entries before retaining data or allocating a combined buffer. */
    checkLimit(limit, size) {
        if (size > this.limits[limit]) {
            throw new ZipLimitError(limit, size, this.limits[limit]);
        }
    }
    resetTraversal() {
        this.scannedBytes = 0;
        this.descriptorScannedBytes = 0;
    }
    consumeBytes(length) {
        this.checkLimit('maxTotalScanBytes', this.scannedBytes + length);
        this.scannedBytes += length;
    }
    readToken(token, input = this.tokenizer) {
        this.consumeBytes(token.len);
        return input.readToken(token);
    }
    ignore(length, input = this.tokenizer) {
        this.consumeBytes(length);
        return input.ignore(length);
    }
    readData(length) {
        this.consumeBytes(length);
        const data = new Uint8Array(length);
        return this.tokenizer.readBuffer(data).then(() => data);
    }
    checkEntrySize(header) {
        this.checkLimit('maxCompressedSize', header.compressedSize);
        this.checkLimit('maxUncompressedSize', header.uncompressedSize);
        if (header.compressedMethod === 0) {
            this.checkLimit('maxUncompressedSize', header.compressedSize);
        }
    }
    async isZip() {
        const signature = await this.peekSignature();
        return signature === Signature.LocalFileHeader || signature === Signature.EndOfCentralDirectory;
    }
    peekSignature() {
        return this.tokenizer.peekToken(UINT32_LE);
    }
    async findEndOfCentralDirectoryLocator() {
        const randomReadTokenizer = this.tokenizer;
        const chunkLength = Math.min(16 * 1024, randomReadTokenizer.fileInfo.size);
        const buffer = this.syncBuffer.subarray(0, chunkLength);
        this.consumeBytes(chunkLength);
        await this.tokenizer.readBuffer(buffer, { position: randomReadTokenizer.fileInfo.size - chunkLength });
        // Search the buffer from end to beginning for EOCD signature
        // const signature = 0x06054b50;
        for (let i = buffer.length - 4; i >= 0; i--) {
            // Compare 4 bytes directly without calling readUInt32LE
            if (buffer[i] === eocdSignatureBytes[0] &&
                buffer[i + 1] === eocdSignatureBytes[1] &&
                buffer[i + 2] === eocdSignatureBytes[2] &&
                buffer[i + 3] === eocdSignatureBytes[3]) {
                return randomReadTokenizer.fileInfo.size - chunkLength + i;
            }
        }
        return -1;
    }
    async readCentralDirectory() {
        this.resetTraversal();
        const entries = await this.centralDirectoryEntries();
        if (!entries) {
            return;
        }
        const files = [];
        for await (const entry of entries) {
            files.push(entry);
        }
        return files;
    }
    async centralDirectoryEntries() {
        if (!this.tokenizer.supportsRandomAccess()) {
            debug('Cannot reading central-directory without random-read support');
            return;
        }
        debug('Reading central-directory...');
        const pos = this.tokenizer.position;
        try {
            const offset = await this.findEndOfCentralDirectoryLocator();
            if (offset >= 0) {
                debug('Central-directory 32-bit signature found');
                this.tokenizer.setPosition(offset);
                const eocdHeader = await this.readToken(EndOfCentralDirectoryRecordToken);
                return this.iterateDirectory(eocdHeader.offsetOfStartOfCd, eocdHeader.sizeOfCd, eocdHeader.nrOfEntriesOfSize);
            }
        }
        finally {
            this.tokenizer.setPosition(pos);
        }
    }
    async *iterateDirectory(offset, size, count) {
        const source = this.tokenizer;
        const pos = source.position;
        let directory;
        let position = 0;
        try {
            source.setPosition(offset);
            directory = createTokenizerView(source, size);
            for (let n = 0; n < count; ++n) {
                this.checkLimit('maxEntryCount', n + 1);
                // Extraction between yields can move the source to a local header.
                directory.setPosition(position);
                const entry = await this.readToken(FileHeader, directory);
                if (entry.signature !== Signature.CentralFileHeader) {
                    throw new Error('Expected Central-File-Header signature');
                }
                entry.filename = await this.readToken(new StringType(entry.filenameLength, 'utf-8'), directory);
                await this.ignore(entry.extraFieldLength, directory);
                await this.ignore(entry.fileCommentLength, directory);
                position = directory.position;
                yield entry;
            }
        }
        finally {
            try {
                await directory?.close();
            }
            finally {
                source.setPosition(pos);
            }
        }
    }
    async unzip(fileCb) {
        this.resetTraversal();
        const entries = this.useCentralDirectory ? await this.centralDirectoryEntries() : undefined;
        if (entries) {
            // Use Central Directory to iterate over files
            return this.iterateOverCentralDirectory(entries, fileCb);
        }
        // Scan Zip files for local-file-header
        let stop = false;
        let entryCount = 0;
        do {
            const zipHeader = await this.readLocalFileHeader();
            if (!zipHeader) {
                break;
            }
            this.checkLimit('maxEntryCount', ++entryCount);
            const next = fileCb(zipHeader);
            stop = !!next.stop;
            let fileData;
            await this.ignore(zipHeader.extraFieldLength);
            if (next.handler) {
                this.checkEntrySize(zipHeader);
            }
            else {
                this.checkLimit('maxSkippedEntrySize', zipHeader.compressedSize);
            }
            if (zipHeader.dataDescriptor && zipHeader.compressedSize === 0) {
                const chunks = [];
                let totalSize = 0;
                const scanLimit = Math.min(this.limits.maxDataDescriptorScanBytes, this.limits.maxTotalDataDescriptorScanBytes - this.descriptorScannedBytes, this.limits.maxTotalScanBytes - this.scannedBytes, next.handler ? Number.POSITIVE_INFINITY : this.limits.maxSkippedEntrySize, next.handler ? this.limits.maxCompressedSize : Number.POSITIVE_INFINITY, next.handler && zipHeader.compressedMethod === 0 ? this.limits.maxUncompressedSize : Number.POSITIVE_INFINITY);
                debug('Compressed-file-size unknown, scanning for next data-descriptor-signature....');
                while (true) {
                    // Retain a full descriptor overlap so its compressed-size field can be validated.
                    const peekLength = Math.min(syncBufferSize, scanLimit - totalSize + DataDescriptor.len);
                    const len = await this.tokenizer.peekBuffer(this.syncBuffer.subarray(0, peekLength), { mayBeLess: true });
                    const allowTruncated = this.allowTruncatedDataDescriptor && len < peekLength;
                    const nextHeaderIndex = findDescriptor(this.syncBuffer.subarray(0, len), totalSize, allowTruncated);
                    if (nextHeaderIndex < 0 && len < DataDescriptor.len && !allowTruncated) {
                        throw new Error('Expected data-descriptor-signature before end of input');
                    }
                    const size = nextHeaderIndex >= 0 ? nextHeaderIndex : allowTruncated ? len : len - DataDescriptor.len + 1;
                    if (size === 0) {
                        break;
                    }
                    this.checkLimit('maxDataDescriptorScanBytes', totalSize + size);
                    this.checkLimit('maxTotalDataDescriptorScanBytes', this.descriptorScannedBytes + size);
                    if (!next.handler) {
                        this.checkLimit('maxSkippedEntrySize', totalSize + size);
                    }
                    if (next.handler) {
                        this.checkLimit('maxCompressedSize', totalSize + size);
                        if (zipHeader.compressedMethod === 0) {
                            this.checkLimit('maxUncompressedSize', totalSize + size);
                        }
                        if (size > 0) {
                            const data = await this.readData(size);
                            chunks.push(data);
                        }
                    }
                    else {
                        await this.ignore(size);
                    }
                    totalSize += size;
                    this.descriptorScannedBytes += size;
                    if (nextHeaderIndex >= 0) {
                        break;
                    }
                }
                debug(`Found data-descriptor-signature at pos=${this.tokenizer.position}`);
                if (next.handler) {
                    this.checkLimit('maxCompressedSize', totalSize);
                    await this.inflate(zipHeader, mergeArrays(chunks), next.handler);
                }
            }
            else {
                if (next.handler) {
                    debug(`Reading compressed-file-data: ${zipHeader.compressedSize} bytes`);
                    fileData = await this.readData(zipHeader.compressedSize);
                    await this.inflate(zipHeader, fileData, next.handler);
                }
                else {
                    debug(`Ignoring compressed-file-data: ${zipHeader.compressedSize} bytes`);
                    await this.ignore(zipHeader.compressedSize);
                }
            }
            debug(`Reading data-descriptor at pos=${this.tokenizer.position}`);
            if (zipHeader.dataDescriptor) {
                // await this.tokenizer.ignore(DataDescriptor.len);
                const dataDescriptor = await this.readToken(DataDescriptor);
                if (dataDescriptor.signature !== 0x08074b50) {
                    throw new Error(`Expected data-descriptor-signature at position ${this.tokenizer.position - DataDescriptor.len}`);
                }
            }
        } while (!stop);
    }
    async iterateOverCentralDirectory(entries, fileCb) {
        for await (const fileHeader of entries) {
            const next = fileCb(fileHeader);
            if (next.handler) {
                this.tokenizer.setPosition(fileHeader.relativeOffsetOfLocalHeader);
                const zipHeader = await this.readLocalFileHeader();
                if (!zipHeader) {
                    throw new Error(`Expected local-file-header at offset ${fileHeader.relativeOffsetOfLocalHeader}`);
                }
                await this.ignore(zipHeader.extraFieldLength);
                this.checkEntrySize(fileHeader);
                this.checkEntrySize(zipHeader);
                const fileData = await this.readData(fileHeader.compressedSize);
                await this.inflate(zipHeader, fileData, next.handler);
            }
            if (next.stop) {
                break;
            }
        }
    }
    async inflate(zipHeader, fileData, cb) {
        if (zipHeader.compressedMethod === 0) {
            // Stored (uncompressed)
            this.checkLimit('maxUncompressedSize', fileData.length);
            return cb(fileData);
        }
        if (zipHeader.compressedMethod !== 8) {
            throw new Error(`Unsupported ZIP compression method: ${zipHeader.compressedMethod}`);
        }
        debug(`Decompress filename=${zipHeader.filename}, compressed-size=${fileData.length}`);
        const uncompressedData = await this.decompressDeflateRaw(fileData);
        return cb(uncompressedData);
    }
    async decompressDeflateRaw(data) {
        // Wrap Uint8Array in a ReadableStream without copying
        const input = new ReadableStream({
            start(controller) {
                controller.enqueue(data);
                controller.close();
            }
        });
        const ds = new DecompressionStream('deflate-raw');
        const output = input.pipeThrough(ds);
        const reader = output.getReader();
        const chunks = [];
        let totalSize = 0;
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                this.checkLimit('maxUncompressedSize', totalSize + value.length);
                totalSize += value.length;
                chunks.push(value);
            }
            this.checkLimit('maxUncompressedSize', totalSize);
            return mergeArrays(chunks);
        }
        catch (err) {
            // Cancellation propagates through pipeThrough to stop decompression.
            await reader.cancel(err).catch(() => {
                // Preserve the original failure if cancellation also fails.
            });
            if (err instanceof ZipLimitError) {
                throw err;
            }
            // Descriptor scanning can retain bytes after the deflate stream, including
            // unsigned ZIP data descriptors. Node.js rejects these after delivering the
            // inflated data. Recover only this error; every retained chunk was bounded.
            if (err instanceof Error && 'code' in err && err.code === 'ERR_TRAILING_JUNK_AFTER_STREAM_END') {
                return mergeArrays(chunks);
            }
            // Provide ZIP-specific error context
            const message = err instanceof Error
                ? `Failed to deflate ZIP entry: ${err.message}`
                : 'Unknown decompression error in ZIP entry';
            throw new TypeError(message);
        }
        finally {
            reader.releaseLock();
        }
    }
    async readLocalFileHeader() {
        const signature = await this.tokenizer.peekToken(UINT32_LE);
        if (signature === Signature.LocalFileHeader) {
            const header = await this.readToken(LocalFileHeaderToken);
            header.filename = await this.readToken(new StringType(header.filenameLength, 'utf-8'));
            return header;
        }
        if (signature === Signature.CentralFileHeader || signature === Signature.EndOfCentralDirectory) {
            return false;
        }
        if (signature === 0xe011cfd0) {
            throw new Error('Encrypted ZIP');
        }
        throw new Error('Unexpected signature');
    }
}
function findDescriptor(buffer, consumed, allowTruncated) {
    for (let i = 0; i <= buffer.length - (allowTruncated ? 4 : DataDescriptor.len); i++) {
        if (UINT32_LE.get(buffer, i) === Signature.DataDescriptor &&
            (buffer.length - i < 12 || UINT32_LE.get(buffer, i + 8) === consumed + i)) {
            return i;
        }
    }
    return -1;
}
function mergeArrays(chunks) {
    // Concatenate chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
    const mergedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        mergedArray.set(chunk, offset);
        offset += chunk.length;
    }
    return mergedArray;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/@tokenizer+inflate@0.6.1/node_modules/@tokenizer/inflate/lib/index.js




;// CONCATENATED MODULE: ./node_modules/.pnpm/uint8array-extras@1.6.0/node_modules/uint8array-extras/index.js
const objectToString = Object.prototype.toString;
const uint8ArrayStringified = '[object Uint8Array]';
const arrayBufferStringified = '[object ArrayBuffer]';

function isType(value, typeConstructor, typeStringified) {
	if (!value) {
		return false;
	}

	if (value.constructor === typeConstructor) {
		return true;
	}

	return objectToString.call(value) === typeStringified;
}

function isUint8Array(value) {
	return isType(value, Uint8Array, uint8ArrayStringified);
}

function isArrayBuffer(value) {
	return isType(value, ArrayBuffer, arrayBufferStringified);
}

function isUint8ArrayOrArrayBuffer(value) {
	return isUint8Array(value) || isArrayBuffer(value);
}

function toUint8ArrayIfArrayBuffer(value) {
	return isArrayBuffer(value) ? new Uint8Array(value) : value;
}

function assertUint8Array(value) {
	if (!isUint8Array(value)) {
		throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
	}
}

function assertUint8ArrayOrArrayBuffer(value) {
	if (!isUint8ArrayOrArrayBuffer(value)) {
		throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof value}\``);
	}
}

function toUint8Array(value) {
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value);
	}

	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	}

	throw new TypeError(`Unsupported value, got \`${typeof value}\`.`);
}

function concatUint8Arrays(arrays, totalLength) {
	if (arrays.length === 0) {
		return new Uint8Array(0);
	}

	totalLength ??= arrays.reduce((accumulator, currentValue) => accumulator + currentValue.byteLength, 0);

	const returnValue = new Uint8Array(totalLength);

	let offset = 0;
	for (let array of arrays) {
		assertUint8ArrayOrArrayBuffer(array);
		array = toUint8ArrayIfArrayBuffer(array);
		returnValue.set(array, offset);
		offset += array.length;
	}

	return returnValue;
}

function areUint8ArraysEqual(a, b) {
	assertUint8ArrayOrArrayBuffer(a);
	assertUint8ArrayOrArrayBuffer(b);
	a = toUint8ArrayIfArrayBuffer(a);
	b = toUint8ArrayIfArrayBuffer(b);

	if (a === b) {
		return true;
	}

	if (a.length !== b.length) {
		return false;
	}

	// eslint-disable-next-line unicorn/no-for-loop
	for (let index = 0; index < a.length; index++) {
		if (a[index] !== b[index]) {
			return false;
		}
	}

	return true;
}

function compareUint8Arrays(a, b) {
	assertUint8ArrayOrArrayBuffer(a);
	assertUint8ArrayOrArrayBuffer(b);
	a = toUint8ArrayIfArrayBuffer(a);
	b = toUint8ArrayIfArrayBuffer(b);

	const length = Math.min(a.length, b.length);

	for (let index = 0; index < length; index++) {
		const diff = a[index] - b[index];
		if (diff !== 0) {
			return Math.sign(diff);
		}
	}

	// At this point, all the compared elements are equal.
	// The shorter array should come first if the arrays are of different lengths.
	return Math.sign(a.length - b.length);
}

const cachedDecoders = {
	utf8: new globalThis.TextDecoder('utf8'),
};

function uint8ArrayToString(array, encoding = 'utf8') {
	assertUint8ArrayOrArrayBuffer(array);
	cachedDecoders[encoding] ??= new globalThis.TextDecoder(encoding);
	return cachedDecoders[encoding].decode(array);
}

function assertString(value) {
	if (typeof value !== 'string') {
		throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
	}
}

const cachedEncoder = new globalThis.TextEncoder();

function stringToUint8Array(string) {
	assertString(string);
	return cachedEncoder.encode(string);
}

function base64ToBase64Url(base64) {
	return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64UrlToBase64(base64url) {
	const base64 = base64url.replaceAll('-', '+').replaceAll('_', '/');
	const padding = (4 - (base64.length % 4)) % 4;
	return base64 + '='.repeat(padding);
}

// Reference: https://phuoc.ng/collection/this-vs-that/concat-vs-push/
// Important: Keep this value divisible by 3 so intermediate chunks produce no Base64 padding.
const MAX_BLOCK_SIZE = 65_535;

function uint8ArrayToBase64(array, {urlSafe = false} = {}) {
	assertUint8ArrayOrArrayBuffer(array);
	array = toUint8ArrayIfArrayBuffer(array);

	let base64 = '';

	for (let index = 0; index < array.length; index += MAX_BLOCK_SIZE) {
		const chunk = array.subarray(index, index + MAX_BLOCK_SIZE);
		// Required as `btoa` and `atob` don't properly support Unicode: https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
		base64 += globalThis.btoa(String.fromCodePoint.apply(undefined, chunk));
	}

	return urlSafe ? base64ToBase64Url(base64) : base64;
}

function base64ToUint8Array(base64String) {
	assertString(base64String);
	return Uint8Array.from(globalThis.atob(base64UrlToBase64(base64String)), x => x.codePointAt(0));
}

function stringToBase64(string, {urlSafe = false} = {}) {
	assertString(string);
	return uint8ArrayToBase64(stringToUint8Array(string), {urlSafe});
}

function base64ToString(base64String) {
	assertString(base64String);
	return uint8ArrayToString(base64ToUint8Array(base64String));
}

const byteToHexLookupTable = Array.from({length: 256}, (_, index) => index.toString(16).padStart(2, '0'));

function uint8ArrayToHex(array) {
	assertUint8ArrayOrArrayBuffer(array);
	array = toUint8ArrayIfArrayBuffer(array);

	// Concatenating a string is faster than using an array.
	let hexString = '';

	// eslint-disable-next-line unicorn/no-for-loop -- Max performance is critical.
	for (let index = 0; index < array.length; index++) {
		hexString += byteToHexLookupTable[array[index]];
	}

	return hexString;
}

const hexToDecimalLookupTable = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
	a: 10,
	b: 11,
	c: 12,
	d: 13,
	e: 14,
	f: 15,
	A: 10,
	B: 11,
	C: 12,
	D: 13,
	E: 14,
	F: 15,
};

function hexToUint8Array(hexString) {
	assertString(hexString);

	if (hexString.length % 2 !== 0) {
		throw new Error('Invalid Hex string length.');
	}

	const resultLength = hexString.length / 2;
	const bytes = new Uint8Array(resultLength);

	for (let index = 0; index < resultLength; index++) {
		const highNibble = hexToDecimalLookupTable[hexString[index * 2]];
		const lowNibble = hexToDecimalLookupTable[hexString[(index * 2) + 1]];

		if (highNibble === undefined || lowNibble === undefined) {
			throw new Error(`Invalid Hex character encountered at position ${index * 2}`);
		}

		bytes[index] = (highNibble << 4) | lowNibble; // eslint-disable-line no-bitwise
	}

	return bytes;
}

/**
@param {DataView} view
@returns {number}
*/
function getUintBE(view) {
	const {byteLength} = view;

	if (byteLength === 6) {
		return (view.getUint16(0) * (2 ** 32)) + view.getUint32(2);
	}

	if (byteLength === 5) {
		return (view.getUint8(0) * (2 ** 32)) + view.getUint32(1);
	}

	if (byteLength === 4) {
		return view.getUint32(0);
	}

	if (byteLength === 3) {
		return (view.getUint8(0) * (2 ** 16)) + view.getUint16(1);
	}

	if (byteLength === 2) {
		return view.getUint16(0);
	}

	if (byteLength === 1) {
		return view.getUint8(0);
	}
}

/**
@param {Uint8Array | ArrayBuffer} array
@param {Uint8Array | ArrayBuffer} value
@returns {number}
*/
function indexOf(array, value) {
	array = toUint8ArrayIfArrayBuffer(array);
	value = toUint8ArrayIfArrayBuffer(value);

	const arrayLength = array.length;
	const valueLength = value.length;

	if (valueLength === 0) {
		return -1;
	}

	if (valueLength > arrayLength) {
		return -1;
	}

	const validOffsetLength = arrayLength - valueLength;

	for (let index = 0; index <= validOffsetLength; index++) {
		let isMatch = true;
		for (let index2 = 0; index2 < valueLength; index2++) {
			if (array[index + index2] !== value[index2]) {
				isMatch = false;
				break;
			}
		}

		if (isMatch) {
			return index;
		}
	}

	return -1;
}

/**
@param {Uint8Array | ArrayBuffer} array
@param {Uint8Array | ArrayBuffer} value
@returns {boolean}
*/
function includes(array, value) {
	return indexOf(array, value) !== -1;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/tokens.js


function stringToBytes(string, encoding) {
	if (encoding === 'utf-16le') {
		const bytes = [];
		for (let index = 0; index < string.length; index++) {
			const code = string.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
			bytes.push(code & 0xFF, (code >> 8) & 0xFF); // High byte
		}

		return bytes;
	}

	if (encoding === 'utf-16be') {
		const bytes = [];
		for (let index = 0; index < string.length; index++) {
			const code = string.charCodeAt(index); // eslint-disable-line unicorn/prefer-code-point
			bytes.push((code >> 8) & 0xFF, code & 0xFF); // Low byte
		}

		return bytes;
	}

	return [...string].map(character => character.charCodeAt(0)); // eslint-disable-line unicorn/prefer-code-point
}

/**
Checks whether the TAR checksum is valid.

@param {Uint8Array} arrayBuffer - The TAR header `[offset ... offset + 512]`.
@param {number} offset - Position of the TAR header in `arrayBuffer`.
@returns {boolean} `true` if the TAR checksum is valid, otherwise `false`.
*/
function tarHeaderChecksumMatches(arrayBuffer, offset = 0) {
	const readSum = Number.parseInt(new StringType(6).get(arrayBuffer, 148), 8); // Read sum in header
	if (Number.isNaN(readSum)) {
		return false;
	}

	let sum = 8 * 0x20; // Initialize signed bit sum

	for (let index = offset; index < offset + 148; index++) {
		sum += arrayBuffer[index];
	}

	for (let index = offset + 156; index < offset + 512; index++) {
		sum += arrayBuffer[index];
	}

	return readSum === sum;
}

/**
ID3 UINT32 sync-safe tokenizer token.
28 bits (representing up to 256MB) integer, the msb is 0 to avoid "false syncsignals".
*/
const uint32SyncSafeToken = {
	get: (buffer, offset) => (buffer[offset + 3] & 0x7F) | ((buffer[offset + 2] & 0x7F) << 7) | ((buffer[offset + 1] & 0x7F) << 14) | ((buffer[offset] & 0x7F) << 21),
	len: 4,
};

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/supported.js
// MIME media subtypes prefixed with `x-ft-` are custom and defined by us. They are neither formally registered with IANA nor based on any informal conventions.

const extensions = [
	'jpg',
	'png',
	'apng',
	'gif',
	'webp',
	'flif',
	'xcf',
	'cr2',
	'cr3',
	'orf',
	'arw',
	'dng',
	'nef',
	'rw2',
	'raf',
	'tif',
	'bmp',
	'icns',
	'jxr',
	'psd',
	'indd',
	'zip',
	'tar',
	'rar',
	'gz',
	'bz2',
	'7z',
	'dmg',
	'mp4',
	'mid',
	'mkv',
	'webm',
	'mov',
	'avi',
	'mpg',
	'mp2',
	'mp3',
	'm4a',
	'oga',
	'ogg',
	'ogv',
	'opus',
	'flac',
	'wav',
	'spx',
	'amr',
	'pdf',
	'epub',
	'elf',
	'macho',
	'exe',
	'swf',
	'rtf',
	'wasm',
	'woff',
	'woff2',
	'eot',
	'ttf',
	'otf',
	'ttc',
	'ico',
	'flv',
	'ps',
	'xz',
	'sqlite',
	'nes',
	'crx',
	'xpi',
	'cab',
	'deb',
	'ar',
	'rpm',
	'Z',
	'lz',
	'cfb',
	'mxf',
	'mts',
	'blend',
	'bpg',
	'docx',
	'pptx',
	'xlsx',
	'3gp',
	'3g2',
	'j2c',
	'jp2',
	'jpm',
	'jpx',
	'mj2',
	'aif',
	'caf',
	'qcp',
	'odt',
	'ods',
	'odp',
	'xml',
	'mobi',
	'heic',
	'cur',
	'ktx',
	'ape',
	'wv',
	'dcm',
	'ics',
	'glb',
	'pcap',
	'dsf',
	'dff',
	'lnk',
	'alias',
	'voc',
	'ac3',
	'm4v',
	'm4p',
	'm4b',
	'f4v',
	'f4p',
	'f4b',
	'f4a',
	'mie',
	'asf',
	'ogm',
	'ogx',
	'mpc',
	'arrow',
	'shp',
	'aac',
	'mp1',
	'it',
	's3m',
	'xm',
	'skp',
	'avif',
	'eps',
	'lzh',
	'pgp',
	'asar',
	'stl',
	'chm',
	'3mf',
	'zst',
	'jxl',
	'vcf',
	'jls',
	'pst',
	'dwg',
	'parquet',
	'class',
	'arj',
	'cpio',
	'ace',
	'avro',
	'icc',
	'fbx',
	'vsdx',
	'vtt',
	'apk',
	'drc',
	'lz4',
	'potx',
	'xltx',
	'dotx',
	'xltm',
	'ott',
	'ots',
	'otp',
	'odg',
	'otg',
	'xlsm',
	'docm',
	'dotm',
	'potm',
	'pptm',
	'jar',
	'jmp',
	'rm',
	'sav',
	'ppsm',
	'ppsx',
	'tar.gz',
	'reg',
	'dat',
	'key',
	'numbers',
	'pages',
	'iso',
];

const supported_mimeTypes = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/flif',
	'image/x-xcf',
	'image/x-canon-cr2',
	'image/x-canon-cr3',
	'image/tiff',
	'image/bmp',
	'image/vnd.ms-photo',
	'image/vnd.adobe.photoshop',
	'application/x-indesign',
	'application/epub+zip',
	'application/x-xpinstall',
	'application/vnd.ms-powerpoint.slideshow.macroenabled.12',
	'application/vnd.oasis.opendocument.text',
	'application/vnd.oasis.opendocument.spreadsheet',
	'application/vnd.oasis.opendocument.presentation',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
	'application/zip',
	'application/x-tar',
	'application/x-rar-compressed',
	'application/gzip',
	'application/x-bzip2',
	'application/x-7z-compressed',
	'application/x-apple-diskimage',
	'application/vnd.apache.arrow.file',
	'video/mp4',
	'audio/midi',
	'video/matroska',
	'video/webm',
	'video/quicktime',
	'video/vnd.avi',
	'audio/wav',
	'audio/qcelp',
	'audio/x-ms-asf',
	'video/x-ms-asf',
	'application/vnd.ms-asf',
	'video/mpeg',
	'video/3gpp',
	'audio/mpeg',
	'audio/mp4', // RFC 4337
	'video/ogg',
	'audio/ogg',
	'audio/ogg; codecs=opus',
	'application/ogg',
	'audio/flac',
	'audio/ape',
	'audio/wavpack',
	'audio/amr',
	'application/pdf',
	'application/x-elf',
	'application/x-mach-binary',
	'application/x-msdownload',
	'application/x-shockwave-flash',
	'application/rtf',
	'application/wasm',
	'font/woff',
	'font/woff2',
	'application/vnd.ms-fontobject',
	'font/ttf',
	'font/otf',
	'font/collection',
	'image/x-icon',
	'video/x-flv',
	'application/postscript',
	'application/eps',
	'application/x-xz',
	'application/x-sqlite3',
	'application/x-nintendo-nes-rom',
	'application/x-google-chrome-extension',
	'application/vnd.ms-cab-compressed',
	'application/x-deb',
	'application/x-unix-archive',
	'application/x-rpm',
	'application/x-compress',
	'application/lzip',
	'application/x-cfb',
	'application/x-mie',
	'application/mxf',
	'video/mp2t',
	'application/x-blender',
	'image/bpg',
	'image/j2c',
	'image/jp2',
	'image/jpx',
	'image/jpm',
	'image/mj2',
	'audio/aiff',
	'audio/x-caf', // Non-standard
	'application/xml',
	'application/x-mobipocket-ebook',
	'image/heif',
	'image/heif-sequence',
	'image/heic',
	'image/heic-sequence',
	'image/icns',
	'image/ktx',
	'application/dicom',
	'audio/x-musepack',
	'text/calendar',
	'text/vcard',
	'text/vtt',
	'model/gltf-binary',
	'application/vnd.tcpdump.pcap',
	'audio/x-dsf', // Non-standard
	'audio/x-dff', // Non-standard
	'application/x-ms-shortcut', // Informal, used by freedesktop.org shared-mime-info
	'application/x-ft-apple.alias',
	'audio/x-voc',
	'audio/vnd.dolby.dd-raw',
	'audio/x-m4a',
	'image/apng',
	'image/x-olympus-orf',
	'image/x-sony-arw',
	'image/x-adobe-dng',
	'image/x-nikon-nef',
	'image/x-panasonic-rw2',
	'image/x-fujifilm-raf',
	'video/x-m4v',
	'video/3gpp2',
	'application/x-esri-shape',
	'audio/aac',
	'audio/x-it',
	'audio/x-s3m',
	'audio/x-xm',
	'video/MP1S',
	'video/MP2P',
	'application/vnd.sketchup.skp',
	'image/avif',
	'application/x-lzh-compressed',
	'application/pgp-encrypted',
	'application/x-asar',
	'model/stl',
	'application/vnd.ms-htmlhelp',
	'model/3mf',
	'image/jxl',
	'application/zstd',
	'image/jls',
	'application/vnd.ms-outlook',
	'image/vnd.dwg',
	'application/vnd.apache.parquet',
	'application/java-vm',
	'application/x-arj',
	'application/x-cpio',
	'application/x-ace-compressed',
	'application/avro',
	'application/vnd.iccprofile',
	'application/x-ft-fbx',
	'application/vnd.visio',
	'application/vnd.android.package-archive',
	'application/x-ft-draco',
	'application/x-lz4', // Informal, used by freedesktop.org shared-mime-info
	'application/vnd.openxmlformats-officedocument.presentationml.template',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
	'application/vnd.ms-excel.template.macroenabled.12',
	'application/vnd.oasis.opendocument.text-template',
	'application/vnd.oasis.opendocument.spreadsheet-template',
	'application/vnd.oasis.opendocument.presentation-template',
	'application/vnd.oasis.opendocument.graphics',
	'application/vnd.oasis.opendocument.graphics-template',
	'application/vnd.ms-excel.sheet.macroenabled.12',
	'application/vnd.ms-word.document.macroenabled.12',
	'application/vnd.ms-word.template.macroenabled.12',
	'application/vnd.ms-powerpoint.template.macroenabled.12',
	'application/vnd.ms-powerpoint.presentation.macroenabled.12',
	'application/java-archive',
	'application/vnd.rn-realmedia',
	'application/x-spss-sav',
	'application/x-ms-regedit',
	'application/x-ft-windows-registry-hive',
	'application/x-jmp-data',
	'application/vnd.apple.keynote',
	'application/vnd.apple.numbers',
	'application/vnd.apple.pages',
	'application/x-iso9660-image',
];

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/parser.js
const maximumUntrustedSkipSizeInBytes = 16 * 1024 * 1024;

class ParserHardLimitError extends Error {}

function getSafeBound(value, maximum, reason) {
	if (
		!Number.isFinite(value)
		|| value < 0
		|| value > maximum
	) {
		throw new ParserHardLimitError(`${reason} has invalid size ${value} (maximum ${maximum} bytes)`);
	}

	return value;
}

async function safeIgnore(tokenizer, length, {maximumLength = maximumUntrustedSkipSizeInBytes, reason = 'skip'} = {}) {
	const safeLength = getSafeBound(length, maximumLength, reason);
	await tokenizer.ignore(safeLength);
}

async function safeReadBuffer(tokenizer, buffer, options, {maximumLength = buffer.length, reason = 'read'} = {}) {
	const length = options?.length ?? buffer.length;
	const safeLength = getSafeBound(length, maximumLength, reason);
	return tokenizer.readBuffer(buffer, {
		...options,
		length: safeLength,
	});
}

function checkBytes(buffer, headers, options) {
	options = {
		offset: 0,
		...options,
	};

	for (const [index, header] of headers.entries()) {
		// If a bitmask is set
		if (options.mask) {
			// If header doesn't equal `buf` with bits masked off
			if (header !== (options.mask[index] & buffer[index + options.offset])) {
				return false;
			}
		} else if (header !== buffer[index + options.offset]) {
			return false;
		}
	}

	return true;
}

function hasUnknownFileSize(tokenizer) {
	const fileSize = tokenizer.fileInfo.size;
	return (
		!Number.isFinite(fileSize)
		|| fileSize === Number.MAX_SAFE_INTEGER
	);
}

function hasExceededUnknownSizeScanBudget(tokenizer, startOffset, maximumBytes) {
	return (
		hasUnknownFileSize(tokenizer)
		&& tokenizer.position - startOffset > maximumBytes
	);
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/detectors/zip.js




const maximumZipEntrySizeInBytes = 1024 * 1024;
const maximumZipEntryCount = 1024;
const maximumZipTextEntrySizeInBytes = maximumZipEntrySizeInBytes;

const recoverableZipErrorMessages = new Set([
	'Unexpected signature',
	'Encrypted ZIP',
	'Expected Central-File-Header signature',
]);
const recoverableZipErrorMessagePrefixes = [
	'Unsupported ZIP compression method:',
	'Expected data-descriptor-signature at position ',
];
const recoverableZipErrorCodes = new Set([
	'Z_BUF_ERROR',
	'Z_DATA_ERROR',
	'ERR_INVALID_STATE',
]);

function isRecoverableZipError(error) {
	if (error instanceof EndOfStreamError) {
		return true;
	}

	if (error instanceof ParserHardLimitError || error instanceof ZipLimitError) {
		return true;
	}

	if (!(error instanceof Error)) {
		return false;
	}

	if (error instanceof TypeError && error.message.startsWith('Failed to deflate ZIP entry:')) {
		return true;
	}

	if (recoverableZipErrorMessages.has(error.message)) {
		return true;
	}

	if (recoverableZipErrorCodes.has(error.code)) {
		return true;
	}

	for (const prefix of recoverableZipErrorMessagePrefixes) {
		if (error.message.startsWith(prefix)) {
			return true;
		}
	}

	return false;
}

function isZipScanLimitError(error) {
	return error instanceof ZipLimitError && [
		'maxTotalScanBytes',
		'maxTotalDataDescriptorScanBytes',
		'maxDataDescriptorScanBytes',
		'maxSkippedEntrySize',
	].includes(error.limit);
}

function canReadZipEntryForDetection(zipHeader, maximumSize = maximumZipEntrySizeInBytes) {
	const sizes = [zipHeader.compressedSize, zipHeader.uncompressedSize];
	for (const size of sizes) {
		if (
			!Number.isFinite(size)
			|| size < 0
			|| size > maximumSize
		) {
			return false;
		}
	}

	return true;
}

// -- iWork helpers --

function createIWorkZipDetectionState() {
	return {
		hasDocumentEntry: false,
		hasMasterSlideEntry: false,
		hasTablesEntry: false,
		hasCalculationEngineEntry: false,
	};
}

function updateIWorkZipDetectionStateFromFilename(iWorkState, filename) {
	if (filename === 'Index/Document.iwa') {
		iWorkState.hasDocumentEntry = true;
	}

	if (filename.startsWith('Index/MasterSlide')) {
		iWorkState.hasMasterSlideEntry = true;
	}

	if (filename.startsWith('Index/Tables/')) {
		iWorkState.hasTablesEntry = true;
	}

	if (filename === 'Index/CalculationEngine.iwa') {
		iWorkState.hasCalculationEngineEntry = true;
	}
}

function getIWorkFileTypeFromZipEntries(iWorkState) {
	if (!iWorkState.hasDocumentEntry) {
		return;
	}

	if (iWorkState.hasMasterSlideEntry) {
		return {ext: 'key', mime: 'application/vnd.apple.keynote'};
	}

	if (iWorkState.hasTablesEntry) {
		return {ext: 'numbers', mime: 'application/vnd.apple.numbers'};
	}

	return {ext: 'pages', mime: 'application/vnd.apple.pages'};
}

// -- OpenXML helpers --

function getFileTypeFromMimeType(mimeType) {
	mimeType = mimeType.toLowerCase();
	switch (mimeType) {
		case 'application/epub+zip':
			return {ext: 'epub', mime: mimeType};
		case 'application/vnd.oasis.opendocument.text':
			return {ext: 'odt', mime: mimeType};
		case 'application/vnd.oasis.opendocument.text-template':
			return {ext: 'ott', mime: mimeType};
		case 'application/vnd.oasis.opendocument.spreadsheet':
			return {ext: 'ods', mime: mimeType};
		case 'application/vnd.oasis.opendocument.spreadsheet-template':
			return {ext: 'ots', mime: mimeType};
		case 'application/vnd.oasis.opendocument.presentation':
			return {ext: 'odp', mime: mimeType};
		case 'application/vnd.oasis.opendocument.presentation-template':
			return {ext: 'otp', mime: mimeType};
		case 'application/vnd.oasis.opendocument.graphics':
			return {ext: 'odg', mime: mimeType};
		case 'application/vnd.oasis.opendocument.graphics-template':
			return {ext: 'otg', mime: mimeType};
		case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
			return {ext: 'ppsx', mime: mimeType};
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
			return {ext: 'xlsx', mime: mimeType};
		case 'application/vnd.ms-excel.sheet.macroenabled':
			return {ext: 'xlsm', mime: 'application/vnd.ms-excel.sheet.macroenabled.12'};
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
			return {ext: 'xltx', mime: mimeType};
		case 'application/vnd.ms-excel.template.macroenabled':
			return {ext: 'xltm', mime: 'application/vnd.ms-excel.template.macroenabled.12'};
		case 'application/vnd.ms-powerpoint.slideshow.macroenabled':
			return {ext: 'ppsm', mime: 'application/vnd.ms-powerpoint.slideshow.macroenabled.12'};
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			return {ext: 'docx', mime: mimeType};
		case 'application/vnd.ms-word.document.macroenabled':
			return {ext: 'docm', mime: 'application/vnd.ms-word.document.macroenabled.12'};
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
			return {ext: 'dotx', mime: mimeType};
		case 'application/vnd.ms-word.template.macroenabledtemplate':
			return {ext: 'dotm', mime: 'application/vnd.ms-word.template.macroenabled.12'};
		case 'application/vnd.openxmlformats-officedocument.presentationml.template':
			return {ext: 'potx', mime: mimeType};
		case 'application/vnd.ms-powerpoint.template.macroenabled':
			return {ext: 'potm', mime: 'application/vnd.ms-powerpoint.template.macroenabled.12'};
		case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
			return {ext: 'pptx', mime: mimeType};
		case 'application/vnd.ms-powerpoint.presentation.macroenabled':
			return {ext: 'pptm', mime: 'application/vnd.ms-powerpoint.presentation.macroenabled.12'};
		case 'application/vnd.ms-visio.drawing':
			return {ext: 'vsdx', mime: 'application/vnd.visio'};
		case 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml':
			return {ext: '3mf', mime: 'model/3mf'};
		default:
	}
}

function createOpenXmlZipDetectionState() {
	return {
		hasContentTypesEntry: false,
		hasParsedContentTypesEntry: false,
		isParsingContentTypes: false,
		hasUnparseableContentTypes: false,
		hasWordDirectory: false,
		hasPresentationDirectory: false,
		hasSpreadsheetDirectory: false,
		hasThreeDimensionalModelEntry: false,
	};
}

function updateOpenXmlZipDetectionStateFromFilename(openXmlState, filename) {
	if (filename.startsWith('word/')) {
		openXmlState.hasWordDirectory = true;
	}

	if (filename.startsWith('ppt/')) {
		openXmlState.hasPresentationDirectory = true;
	}

	if (filename.startsWith('xl/')) {
		openXmlState.hasSpreadsheetDirectory = true;
	}

	if (
		filename.startsWith('3D/')
		&& filename.endsWith('.model')
	) {
		openXmlState.hasThreeDimensionalModelEntry = true;
	}
}

function getOpenXmlFileTypeFromDirectoryNames(openXmlState) {
	if (openXmlState.hasWordDirectory) {
		return {
			ext: 'docx',
			mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		};
	}

	if (openXmlState.hasPresentationDirectory) {
		return {
			ext: 'pptx',
			mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		};
	}

	if (openXmlState.hasSpreadsheetDirectory) {
		return {
			ext: 'xlsx',
			mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		};
	}

	if (openXmlState.hasThreeDimensionalModelEntry) {
		return {
			ext: '3mf',
			mime: 'model/3mf',
		};
	}
}

function getOpenXmlFileTypeFromZipEntries(openXmlState) {
	// Only use directory-name heuristic when [Content_Types].xml was present in the archive
	// but its handler was skipped (not invoked, not currently running, and not already resolved).
	// This avoids guessing from directory names when content-type parsing already gave a definitive answer or failed.
	if (
		!openXmlState.hasContentTypesEntry
		|| openXmlState.hasUnparseableContentTypes
		|| openXmlState.isParsingContentTypes
		|| openXmlState.hasParsedContentTypesEntry
	) {
		return;
	}

	return getOpenXmlFileTypeFromDirectoryNames(openXmlState);
}

function getOpenXmlMimeTypeFromContentTypesXml(xmlContent) {
	// We only need the `ContentType="...main+xml"` value, so a small string scan is enough and avoids full XML parsing.
	const endPosition = xmlContent.indexOf('.main+xml"');
	if (endPosition === -1) {
		const mimeType = 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml';
		if (xmlContent.includes(`ContentType="${mimeType}"`)) {
			return mimeType;
		}

		return;
	}

	const truncatedContent = xmlContent.slice(0, endPosition);
	const firstQuotePosition = truncatedContent.lastIndexOf('"');
	// If no quote is found, `lastIndexOf` returns -1 and this intentionally falls back to the full truncated prefix.
	return truncatedContent.slice(firstQuotePosition + 1);
}

async function detectZip(tokenizer) {
	let fileType;
	const openXmlState = createOpenXmlZipDetectionState();
	const iWorkState = createIWorkZipDetectionState();

	try {
		await new ZipHandler(tokenizer, {
			// Keep local-header order and partial-archive detection consistent across input types.
			useCentralDirectory: false,
			allowTruncatedDataDescriptor: true,
			maxEntryCount: maximumZipEntryCount,
			// Unknown-size input is bounded before each read, including entry metadata.
			maxTotalScanBytes: hasUnknownFileSize(tokenizer) ? maximumUntrustedSkipSizeInBytes : Infinity,
			maxTotalDataDescriptorScanBytes: hasUnknownFileSize(tokenizer) ? Infinity : maximumZipEntrySizeInBytes,
			maxSkippedEntrySize: hasUnknownFileSize(tokenizer) ? maximumZipEntrySizeInBytes : Infinity,
			maxDataDescriptorScanBytes: maximumZipEntrySizeInBytes,
			maxCompressedSize: maximumZipTextEntrySizeInBytes,
			maxUncompressedSize: maximumZipTextEntrySizeInBytes,
		}).unzip(zipHeader => {
			updateOpenXmlZipDetectionStateFromFilename(openXmlState, zipHeader.filename);
			updateIWorkZipDetectionStateFromFilename(iWorkState, zipHeader.filename);

			// Early exit for Keynote or Numbers when markers are definitive
			if (iWorkState.hasDocumentEntry && (iWorkState.hasMasterSlideEntry || iWorkState.hasTablesEntry)) {
				fileType = getIWorkFileTypeFromZipEntries(iWorkState);
				return {stop: true};
			}

			const isOpenXmlContentTypesEntry = zipHeader.filename === '[Content_Types].xml';
			const openXmlFileTypeFromEntries = getOpenXmlFileTypeFromZipEntries(openXmlState);
			if (
				!isOpenXmlContentTypesEntry
				&& openXmlFileTypeFromEntries
			) {
				fileType = openXmlFileTypeFromEntries;
				return {
					stop: true,
				};
			}

			switch (zipHeader.filename) {
				case 'META-INF/mozilla.rsa':
					fileType = {
						ext: 'xpi',
						mime: 'application/x-xpinstall',
					};
					return {
						stop: true,
					};
				case 'META-INF/MANIFEST.MF':
					fileType = {
						ext: 'jar',
						mime: 'application/java-archive',
					};
					return {
						stop: true,
					};
				case 'mimetype':
					if (!canReadZipEntryForDetection(zipHeader, maximumZipTextEntrySizeInBytes)) {
						return {};
					}

					return {
						async handler(fileData) {
							// Use TextDecoder to decode the UTF-8 encoded data
							const mimeType = new TextDecoder('utf-8').decode(fileData).trim();
							fileType = getFileTypeFromMimeType(mimeType);
						},
						stop: true,
					};

				case '[Content_Types].xml': {
					openXmlState.hasContentTypesEntry = true;

					if (!canReadZipEntryForDetection(zipHeader, maximumZipTextEntrySizeInBytes)) {
						openXmlState.hasUnparseableContentTypes = true;
						return {};
					}

					openXmlState.isParsingContentTypes = true;
					return {
						async handler(fileData) {
							// Use TextDecoder to decode the UTF-8 encoded data
							const xmlContent = new TextDecoder('utf-8').decode(fileData);
							const mimeType = getOpenXmlMimeTypeFromContentTypesXml(xmlContent);
							if (mimeType) {
								fileType = getFileTypeFromMimeType(mimeType);
							}

							openXmlState.hasParsedContentTypesEntry = true;
							openXmlState.isParsingContentTypes = false;
						},
						stop: true,
					};
				}

				default:
					if (/classes\d*\.dex/v.test(zipHeader.filename)) {
						fileType = {
							ext: 'apk',
							mime: 'application/vnd.android.package-archive',
						};
						return {stop: true};
					}

					return {};
			}
		});
	} catch (error) {
		if (!isRecoverableZipError(error)) {
			throw error;
		}

		if (openXmlState.isParsingContentTypes) {
			openXmlState.isParsingContentTypes = false;
			openXmlState.hasUnparseableContentTypes = true;
		}

		// Producers are free to put [Content_Types].xml after the content entries, so running out of
		// input or budget before reaching it says nothing about whether this is an OOXML file.
		// Guess from the directory names instead.
		if (
			!fileType
			&& (error instanceof EndOfStreamError || error instanceof ParserHardLimitError || isZipScanLimitError(error))
			&& !openXmlState.hasContentTypesEntry
		) {
			fileType = getOpenXmlFileTypeFromDirectoryNames(openXmlState);
		}
	}

	const iWorkFileType = hasUnknownFileSize(tokenizer)
		&& iWorkState.hasDocumentEntry
		&& !iWorkState.hasMasterSlideEntry
		&& !iWorkState.hasTablesEntry
		&& !iWorkState.hasCalculationEngineEntry
		? undefined
		: getIWorkFileTypeFromZipEntries(iWorkState);

	return fileType ?? getOpenXmlFileTypeFromZipEntries(openXmlState) ?? iWorkFileType ?? {
		ext: 'zip',
		mime: 'application/zip',
	};
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/detectors/ebml.js





const maximumEbmlDocumentTypeSizeInBytes = 64;
const maximumEbmlElementPayloadSizeInBytes = 1024 * 1024;
const maximumEbmlElementCount = 256;

async function detectEbml(tokenizer) {
	async function readField(input) {
		const msb = await input.peekNumber(UINT8);
		let mask = 0x80;
		let ic = 0; // 0 = A, 1 = B, 2 = C, 3 = D

		while (mask !== 0 && (msb & mask) === 0) {
			++ic;
			mask >>= 1;
		}

		const id = new Uint8Array(ic + 1);
		await safeReadBuffer(input, id, undefined, {
			maximumLength: id.length,
			reason: 'EBML field',
		});
		return id;
	}

	async function readElement(input) {
		const idField = await readField(input);
		const lengthField = await readField(input);

		lengthField[0] ^= 0x80 >> (lengthField.length - 1);
		const nrLength = Math.min(6, lengthField.length); // JavaScript can max read 6 bytes integer

		const idView = new DataView(idField.buffer);
		const lengthView = new DataView(lengthField.buffer, lengthField.length - nrLength, nrLength);

		return {
			id: getUintBE(idView),
			len: getUintBE(lengthView),
		};
	}

	const isUnknownFileSize = hasUnknownFileSize(tokenizer);

	async function readChildren(header) {
		let ebmlElementCount = 0;
		while (header.remaining > 0) {
			ebmlElementCount++;
			if (ebmlElementCount > maximumEbmlElementCount) {
				return;
			}

			if (hasExceededUnknownSizeScanBudget(tokenizer, ebmlScanStart, maximumUntrustedSkipSizeInBytes)) {
				return;
			}

			const previousPosition = tokenizer.position;
			const element = await readElement(header);

			if (element.id === 0x42_82) {
				// `DocType` is a short string ("webm", "matroska", ...), reject implausible lengths to avoid large allocations.
				if (element.len > maximumEbmlDocumentTypeSizeInBytes) {
					return;
				}

				const documentTypeLength = getSafeBound(element.len, maximumEbmlDocumentTypeSizeInBytes, 'EBML DocType');
				const rawValue = await header.readToken(new StringType(documentTypeLength));
				return rawValue.split('\0', 1)[0]; // Return DocType
			}

			if (
				isUnknownFileSize
				&& (
					!Number.isFinite(element.len)
					|| element.len < 0
					|| element.len > maximumEbmlElementPayloadSizeInBytes
				)
			) {
				return;
			}

			await safeIgnore(header, element.len, {
				maximumLength: isUnknownFileSize ? maximumEbmlElementPayloadSizeInBytes : tokenizer.fileInfo.size,
				reason: 'EBML payload',
			}); // ignore payload

			// Safeguard against malformed files: bail if the position did not advance.
			if (tokenizer.position <= previousPosition) {
				return;
			}
		}
	}

	const rootElement = await readElement(tokenizer);
	const ebmlScanStart = tokenizer.position;
	const header = createTokenizerView(tokenizer, rootElement.len);
	let documentType;
	try {
		documentType = await readChildren(header);
	} catch (error) {
		if (error instanceof TokenizerBoundaryError) {
			return;
		}

		throw error;
	} finally {
		// Detection can stop at DocType; do not drain the rest or close the source.
		await header.close();
	}

	switch (documentType) {
		case 'webm':
			return {
				ext: 'webm',
				mime: 'video/webm',
			};

		case 'matroska':
			return {
				ext: 'mkv',
				mime: 'video/matroska',
			};

		default:
	}
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/detectors/png.js




const maximumPngChunkCount = 512;
const maximumPngStreamScanBudgetInBytes = 16 * 1024 * 1024;
const maximumPngChunkSizeInBytes = 1024 * 1024;

function isPngAncillaryChunk(type) {
	return (type.codePointAt(0) & 0x20) !== 0;
}

async function detectPng(tokenizer) {
	const pngFileType = {
		ext: 'png',
		mime: 'image/png',
	};

	const apngFileType = {
		ext: 'apng',
		mime: 'image/apng',
	};

	// APNG format (https://wiki.mozilla.org/APNG_Specification)
	// 1. Find the first IDAT (image data) chunk (49 44 41 54)
	// 2. Check if there is an "acTL" chunk before the IDAT one (61 63 54 4C)

	// Offset calculated as follows:
	// - 8 bytes: PNG signature
	// - 4 (length) + 4 (chunk type) + 13 (chunk data) + 4 (CRC): IHDR chunk

	await tokenizer.ignore(8); // ignore PNG signature

	async function readChunkHeader() {
		return {
			length: await tokenizer.readToken(INT32_BE),
			type: await tokenizer.readToken(new StringType(4, 'latin1')),
		};
	}

	const isUnknownPngStream = hasUnknownFileSize(tokenizer);
	const pngScanStart = tokenizer.position;
	let pngChunkCount = 0;
	let hasSeenImageHeader = false;
	do {
		pngChunkCount++;
		if (pngChunkCount > maximumPngChunkCount) {
			break;
		}

		if (hasExceededUnknownSizeScanBudget(tokenizer, pngScanStart, maximumPngStreamScanBudgetInBytes)) {
			break;
		}

		const previousPosition = tokenizer.position;
		const chunk = await readChunkHeader();
		// eslint-disable-next-line unicorn/no-impossible-length-comparison -- The length is read as a signed 32-bit integer.
		if (chunk.length < 0) {
			return; // Invalid chunk length
		}

		if (chunk.type === 'IHDR') {
			// PNG requires the first real image header to be a 13-byte IHDR chunk.
			if (chunk.length !== 13) {
				return;
			}

			hasSeenImageHeader = true;
		}

		switch (chunk.type) {
			case 'IDAT':
				return pngFileType;
			case 'acTL':
				return apngFileType;
			default:
				if (
					!hasSeenImageHeader
					&& chunk.type !== 'CgBI'
				) {
					return;
				}

				if (
					isUnknownPngStream
					&& chunk.length > maximumPngChunkSizeInBytes
				) {
					// Avoid huge attacker-controlled skips when probing unknown-size streams.
					return hasSeenImageHeader && isPngAncillaryChunk(chunk.type) ? pngFileType : undefined;
				}

				try {
					await safeIgnore(tokenizer, chunk.length + 4, {
						maximumLength: isUnknownPngStream ? maximumPngChunkSizeInBytes + 4 : tokenizer.fileInfo.size,
						reason: 'PNG chunk payload',
					}); // Ignore chunk-data + CRC
				} catch (error) {
					if (
						!isUnknownPngStream
						&& (
							error instanceof ParserHardLimitError
							|| error instanceof EndOfStreamError
						)
					) {
						return pngFileType;
					}

					throw error;
				}
		}

		// Safeguard against malformed files: bail if the position did not advance.
		if (tokenizer.position <= previousPosition) {
			break;
		}
	} while (tokenizer.position + 8 < tokenizer.fileInfo.size);

	return pngFileType;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/detectors/asf.js




const maximumAsfHeaderObjectCount = 512;
const maximumAsfHeaderPayloadSizeInBytes = 1024 * 1024;

async function detectAsf(tokenizer) {
	let isMalformedAsf = false;
	try {
		async function readHeader() {
			const guid = new Uint8Array(16);
			await safeReadBuffer(tokenizer, guid, undefined, {
				maximumLength: guid.length,
				reason: 'ASF header GUID',
			});
			return {
				id: guid,
				size: Number(await tokenizer.readToken(UINT64_LE)),
			};
		}

		await safeIgnore(tokenizer, 30, {
			maximumLength: 30,
			reason: 'ASF header prelude',
		});
		const isUnknownFileSize = hasUnknownFileSize(tokenizer);
		const asfHeaderScanStart = tokenizer.position;
		let asfHeaderObjectCount = 0;
		while (tokenizer.position + 24 < tokenizer.fileInfo.size) {
			asfHeaderObjectCount++;
			if (asfHeaderObjectCount > maximumAsfHeaderObjectCount) {
				break;
			}

			if (hasExceededUnknownSizeScanBudget(tokenizer, asfHeaderScanStart, maximumUntrustedSkipSizeInBytes)) {
				break;
			}

			const previousPosition = tokenizer.position;
			const header = await readHeader();
			let payload = header.size - 24;
			if (
				!Number.isFinite(payload)
				|| payload < 0
			) {
				isMalformedAsf = true;
				break;
			}

			if (checkBytes(header.id, [0x91, 0x07, 0xDC, 0xB7, 0xB7, 0xA9, 0xCF, 0x11, 0x8E, 0xE6, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65])) {
				// Sync on Stream-Properties-Object (B7DC0791-A9B7-11CF-8EE6-00C00C205365)
				const typeId = new Uint8Array(16);
				payload -= await safeReadBuffer(tokenizer, typeId, undefined, {
					maximumLength: typeId.length,
					reason: 'ASF stream type GUID',
				});

				if (checkBytes(typeId, [0x40, 0x9E, 0x69, 0xF8, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
					// Found audio:
					return {
						ext: 'asf',
						mime: 'audio/x-ms-asf',
					};
				}

				if (checkBytes(typeId, [0xC0, 0xEF, 0x19, 0xBC, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
					// Found video:
					return {
						ext: 'asf',
						mime: 'video/x-ms-asf',
					};
				}

				break;
			}

			if (
				isUnknownFileSize
				&& payload > maximumAsfHeaderPayloadSizeInBytes
			) {
				isMalformedAsf = true;
				break;
			}

			await safeIgnore(tokenizer, payload, {
				maximumLength: isUnknownFileSize ? maximumAsfHeaderPayloadSizeInBytes : tokenizer.fileInfo.size,
				reason: 'ASF header payload',
			});

			// Safeguard against malformed files: break if the position did not advance.
			if (tokenizer.position <= previousPosition) {
				isMalformedAsf = true;
				break;
			}
		}
	} catch (error) {
		if (
			error instanceof EndOfStreamError
			|| error instanceof ParserHardLimitError
		) {
			if (hasUnknownFileSize(tokenizer)) {
				isMalformedAsf = true;
			}
		} else {
			throw error;
		}
	}

	if (isMalformedAsf) {
		return;
	}

	// Default to ASF generic extension
	return {
		ext: 'asf',
		mime: 'application/vnd.ms-asf',
	};
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/file-type@22.3.0/node_modules/file-type/source/index.js
/**
Primary entry point, Node.js specific entry point is index.js
*/













const reasonableDetectionSizeInBytes = 4100; // A fair amount of file-types are detectable within this range.
const maximumMpegOffsetTolerance = reasonableDetectionSizeInBytes - 4; // Keep room for the 4 bytes of the frame header at the deepest scanned offset.
const maximumNestedGzipDetectionSizeInBytes = maximumUntrustedSkipSizeInBytes;
const maximumNestedGzipProbeDepth = 1;
const unknownSizeGzipProbeTimeoutInMilliseconds = 100;
const maximumId3HeaderSizeInBytes = maximumUntrustedSkipSizeInBytes;
const maximumTiffTagCount = 512;
const maximumDetectionReentryCount = 256;
const maximumTiffStreamIfdOffsetInBytes = 1024 * 1024;
const maximumTiffIfdOffsetInBytes = maximumUntrustedSkipSizeInBytes;

function normalizeSampleSize(sampleSize) {
	// `sampleSize` is an explicit caller-controlled tuning knob, not untrusted file input.
	// Preserve valid caller-requested probe depth here; applications must bound attacker-derived option values themselves.
	if (!Number.isFinite(sampleSize)) {
		return reasonableDetectionSizeInBytes;
	}

	return Math.max(1, Math.trunc(sampleSize));
}

function normalizeMpegOffsetTolerance(mpegOffsetTolerance) {
	// This value controls scan depth and therefore worst-case CPU work.
	if (!Number.isFinite(mpegOffsetTolerance)) {
		return 0;
	}

	return Math.max(0, Math.min(maximumMpegOffsetTolerance, Math.trunc(mpegOffsetTolerance)));
}

function getKnownFileSizeOrMaximum(fileSize) {
	if (!Number.isFinite(fileSize)) {
		return Number.MAX_SAFE_INTEGER;
	}

	return Math.max(0, fileSize);
}

// Keep the specifier non-literal at the call site so browser bundlers do not try to resolve Node-only imports.
function importAtRuntime(specifier) {
	// eslint-disable-next-line jsdoc/no-bad-blocks
	return import(/* @vite-ignore */ /* webpackIgnore: true */ specifier);
}

// Wrap stream in an identity TransformStream to avoid BYOB readers.
// Node.js has a bug where calling controller.close() inside a BYOB stream's
// pull() callback does not resolve pending reader.read() calls, causing
// permanent hangs on streams shorter than the requested read size.
// Using a default (non-BYOB) reader via TransformStream avoids this.
function toDefaultStream(stream) {
	return stream.pipeThrough(new TransformStream());
}

function readWithSignal(reader, signal) {
	if (signal === undefined) {
		return reader.read();
	}

	signal.throwIfAborted();

	return Promise.race([
		reader.read(),
		new Promise((_resolve, reject) => {
			signal.addEventListener('abort', () => {
				reject(signal.reason);
				reader.cancel(signal.reason).catch(() => {});
			}, {once: true});
		}),
	]);
}

function createByteLimitedReadableStream(stream, maximumBytes) {
	const reader = stream.getReader();
	let emittedBytes = 0;
	let isSourceDone = false;
	let isSourceCanceled = false;

	const cancelSource = async reason => {
		if (
			isSourceDone
			|| isSourceCanceled
		) {
			return;
		}

		isSourceCanceled = true;
		await reader.cancel(reason);
	};

	return new ReadableStream({
		async pull(controller) {
			if (emittedBytes >= maximumBytes) {
				controller.close();
				await cancelSource();
				return;
			}

			const {done, value} = await reader.read();
			if (
				done
				|| !value
			) {
				isSourceDone = true;
				controller.close();
				return;
			}

			const remainingBytes = maximumBytes - emittedBytes;
			if (value.length > remainingBytes) {
				controller.enqueue(value.subarray(0, remainingBytes));
				emittedBytes += remainingBytes;
				controller.close();
				await cancelSource();
				return;
			}

			controller.enqueue(value);
			emittedBytes += value.length;
		},
		async cancel(reason) {
			await cancelSource(reason);
		},
	});
}

async function fileTypeFromStream(stream, options) {
	return new FileTypeParser(options).fromStream(stream);
}

async function fileTypeFromBuffer(input, options) {
	return new FileTypeParser(options).fromBuffer(input);
}

async function fileTypeFromBlob(blob, options) {
	return new FileTypeParser(options).fromBlob(blob);
}

async function fileTypeFromTokenizer(tokenizer, options) {
	return new FileTypeParser(options).fromTokenizer(tokenizer);
}

async function fileTypeStream(webStream, options) {
	return new FileTypeParser(options).toDetectionStream(webStream, options);
}

class FileTypeParser {
	buffer;
	tokenizer;
	detectionReentryCount;

	constructor(options) {
		const normalizedMpegOffsetTolerance = normalizeMpegOffsetTolerance(options?.mpegOffsetTolerance);
		const maxBufferSize = options?.maxBufferSize ?? Infinity;
		if (maxBufferSize !== Infinity && (!Number.isSafeInteger(maxBufferSize) || maxBufferSize <= 0)) {
			throw new RangeError('maxBufferSize must be a positive safe integer or Infinity');
		}

		this.options = {
			...options,
			mpegOffsetTolerance: normalizedMpegOffsetTolerance,
		};

		this.detectors = [...(this.options.customDetectors ?? []),
			{id: 'core', detect: tokenizer => this.detectConfident(tokenizer)},
			{id: 'core.imprecise', detect: tokenizer => this.detectImprecise(tokenizer)}];
		this.tokenizerOptions = {
			abortSignal: this.options.signal,
			maxBufferSize,
		};
		this.gzipProbeDepth = 0;
	}

	getTokenizerOptions() {
		return {
			...this.tokenizerOptions,
		};
	}

	createTokenizerFromWebStream(stream) {
		return fromWebStream(toDefaultStream(stream), this.getTokenizerOptions());
	}

	async parseTokenizer(tokenizer, detectionReentryCount = 0) {
		this.detectionReentryCount = detectionReentryCount;
		const initialPosition = tokenizer.position;
		// Iterate through all file-type detectors
		for (const detector of this.detectors) {
			let fileType;
			try {
				fileType = await detector.detect(tokenizer);
			} catch (error) {
				if (error instanceof EndOfStreamError) {
					return;
				}

				if (error instanceof ParserHardLimitError) {
					return;
				}

				throw error;
			}

			if (fileType) {
				return fileType;
			}

			if (initialPosition !== tokenizer.position) {
				return undefined; // Cannot proceed scanning of the tokenizer is at an arbitrary position
			}
		}
	}

	async fromTokenizer(tokenizer) {
		try {
			return await this.parseTokenizer(tokenizer);
		} finally {
			await tokenizer.close();
		}
	}

	async fromBuffer(input) {
		if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
			throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof input}\``);
		}

		const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);

		if (!(buffer?.length > 1)) {
			return;
		}

		return this.fromTokenizer(fromBuffer(buffer, this.getTokenizerOptions()));
	}

	async fromBlob(blob) {
		this.options.signal?.throwIfAborted();
		const tokenizer = fromBlob(blob, this.getTokenizerOptions());
		return this.fromTokenizer(tokenizer);
	}

	async fromStream(stream) {
		this.options.signal?.throwIfAborted();
		const tokenizer = this.createTokenizerFromWebStream(stream);
		return this.fromTokenizer(tokenizer);
	}

	async fromFile(path) {
		this.options.signal?.throwIfAborted();
		const {fromFile, NotRegularFileError} = await importAtRuntime('strtok3');
		let tokenizer;
		try {
			tokenizer = await fromFile(path, {
				...this.getTokenizerOptions(),
				regularFileOnly: true,
			});
		} catch (error) {
			if (error instanceof NotRegularFileError) {
				return;
			}

			throw error;
		}

		return this.fromTokenizer(tokenizer);
	}

	async toDetectionStream(stream, options) {
		this.options.signal?.throwIfAborted();
		const sampleSize = normalizeSampleSize(options?.sampleSize ?? reasonableDetectionSizeInBytes);
		let detectedFileType;
		let hasStreamEnded = false;

		const reader = stream.getReader();
		const chunks = [];
		let totalSize = 0;

		try {
			while (totalSize < sampleSize) {
				const {value, done} = await readWithSignal(reader, this.options.signal);
				if (done || !value) {
					hasStreamEnded = true;
					break;
				}

				chunks.push(value);
				totalSize += value.length;
			}

			if (
				!hasStreamEnded
				&& totalSize === sampleSize
			) {
				const {value, done} = await readWithSignal(reader, this.options.signal);
				if (done || !value) {
					hasStreamEnded = true;
				} else {
					chunks.push(value);
					totalSize += value.length;
				}
			}
		} finally {
			reader.releaseLock();
		}

		if (totalSize > 0) {
			const sample = chunks.length === 1 ? chunks[0] : concatUint8Arrays(chunks);
			try {
				detectedFileType = await this.fromBuffer(sample.subarray(0, sampleSize));
			} catch (error) {
				if (!(error instanceof EndOfStreamError)) {
					throw error;
				}

				detectedFileType = undefined;
			}

			if (
				!hasStreamEnded
				&& detectedFileType?.ext === 'pages'
			) {
				detectedFileType = {
					ext: 'zip',
					mime: 'application/zip',
				};
			}
		}

		// Prepend collected chunks and pipe the rest through
		const transformStream = new TransformStream({
			start(controller) {
				for (const chunk of chunks) {
					controller.enqueue(chunk);
				}
			},
			transform(chunk, controller) {
				controller.enqueue(chunk);
			},
		});

		const newStream = stream.pipeThrough(transformStream);
		newStream.fileType = detectedFileType;

		return newStream;
	}

	async detectGzip(tokenizer) {
		if (this.gzipProbeDepth >= maximumNestedGzipProbeDepth) {
			return {
				ext: 'gz',
				mime: 'application/gzip',
			};
		}

		const gzipHandler = new GzipHandler(tokenizer);
		const limitedInflatedStream = createByteLimitedReadableStream(gzipHandler.inflate(), maximumNestedGzipDetectionSizeInBytes);
		const hasUnknownSize = hasUnknownFileSize(tokenizer);
		let timeout;
		let probeSignal;
		let probeParser;
		let compressedFileType;

		if (hasUnknownSize) {
			const timeoutController = new AbortController();
			timeout = setTimeout(() => {
				timeoutController.abort(new DOMException(`Operation timed out after ${unknownSizeGzipProbeTimeoutInMilliseconds} ms`, 'TimeoutError'));
			}, unknownSizeGzipProbeTimeoutInMilliseconds);
			probeSignal = this.options.signal === undefined
				? timeoutController.signal
				: AbortSignal.any([this.options.signal, timeoutController.signal]);
			probeParser = new FileTypeParser({
				...this.options,
				signal: probeSignal,
			});
			probeParser.gzipProbeDepth = this.gzipProbeDepth + 1;
		} else {
			this.gzipProbeDepth++;
		}

		try {
			compressedFileType = await (probeParser ?? this).fromStream(limitedInflatedStream);
		} catch (error) {
			if (
				error?.name === 'AbortError'
				&& probeSignal?.reason?.name !== 'TimeoutError'
			) {
				throw error;
			}

			// Timeout, decompression, or inner-detection failures are expected for non-tar gzip files.
		} finally {
			clearTimeout(timeout);
			if (!hasUnknownSize) {
				this.gzipProbeDepth--;
			}
		}

		if (compressedFileType?.ext === 'tar') {
			return {
				ext: 'tar.gz',
				mime: 'application/gzip',
			};
		}

		return {
			ext: 'gz',
			mime: 'application/gzip',
		};
	}

	check(header, options) {
		return checkBytes(this.buffer, header, options);
	}

	checkString(header, options) {
		return this.check(stringToBytes(header, options?.encoding), options);
	}

	// Detections with a high degree of certainty in identifying the correct file type
	async detectConfident(tokenizer) {
		this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);

		// Keep reading until EOF if the file size is unknown.
		if (tokenizer.fileInfo.size === undefined) {
			tokenizer.fileInfo.size = Number.MAX_SAFE_INTEGER;
		}

		this.tokenizer = tokenizer;

		if (hasUnknownFileSize(tokenizer)) {
			await tokenizer.peekBuffer(this.buffer, {length: 3, mayBeLess: true});
			if (this.check([0x1F, 0x8B, 0x8])) {
				return this.detectGzip(tokenizer);
			}
		}

		await tokenizer.peekBuffer(this.buffer, {length: 32, mayBeLess: true});

		// -- 2-byte signatures --

		if (this.check([0x42, 0x4D])) {
			return {
				ext: 'bmp',
				mime: 'image/bmp',
			};
		}

		if (this.check([0x0B, 0x77])) {
			return {
				ext: 'ac3',
				mime: 'audio/vnd.dolby.dd-raw',
			};
		}

		if (this.check([0x78, 0x01])) {
			return {
				ext: 'dmg',
				mime: 'application/x-apple-diskimage',
			};
		}

		if (this.check([0x4D, 0x5A])) {
			return {
				ext: 'exe',
				mime: 'application/x-msdownload',
			};
		}

		if (this.check([0x25, 0x21])) {
			await tokenizer.peekBuffer(this.buffer, {length: 24, mayBeLess: true});

			if (
				this.checkString('PS-Adobe-', {offset: 2})
				&& this.checkString(' EPSF-', {offset: 14})
			) {
				return {
					ext: 'eps',
					mime: 'application/eps',
				};
			}

			return {
				ext: 'ps',
				mime: 'application/postscript',
			};
		}

		if (
			this.check([0x1F, 0xA0])
			|| this.check([0x1F, 0x9D])
		) {
			return {
				ext: 'Z',
				mime: 'application/x-compress',
			};
		}

		if (this.check([0xC7, 0x71])) {
			return {
				ext: 'cpio',
				mime: 'application/x-cpio',
			};
		}

		if (this.check([0x60, 0xEA])) {
			return {
				ext: 'arj',
				mime: 'application/x-arj',
			};
		}

		// -- 3-byte signatures --

		if (this.check([0xEF, 0xBB, 0xBF])) { // UTF-8-BOM
			if (this.detectionReentryCount >= maximumDetectionReentryCount) {
				return;
			}

			this.detectionReentryCount++;
			// Strip off UTF-8-BOM
			await this.tokenizer.ignore(3);
			return this.detectConfident(tokenizer);
		}

		if (this.check([0x47, 0x49, 0x46])) {
			return {
				ext: 'gif',
				mime: 'image/gif',
			};
		}

		if (this.check([0x49, 0x49, 0xBC])) {
			return {
				ext: 'jxr',
				mime: 'image/vnd.ms-photo',
			};
		}

		if (this.check([0x1F, 0x8B, 0x8])) {
			return this.detectGzip(tokenizer);
		}

		if (this.check([0x42, 0x5A, 0x68])) {
			return {
				ext: 'bz2',
				mime: 'application/x-bzip2',
			};
		}

		if (this.checkString('ID3')) {
			await safeIgnore(tokenizer, 6, {
				maximumLength: 6,
				reason: 'ID3 header prefix',
			}); // Skip ID3 header until the header size
			const id3HeaderLength = await tokenizer.readToken(uint32SyncSafeToken);
			const isUnknownFileSize = hasUnknownFileSize(tokenizer);
			if (
				!Number.isFinite(id3HeaderLength)
				|| id3HeaderLength < 0
				// Keep ID3 probing bounded for unknown-size streams to avoid attacker-controlled large skips.
				|| (
					isUnknownFileSize
					&& (
						id3HeaderLength > maximumId3HeaderSizeInBytes
						|| (tokenizer.position + id3HeaderLength) > maximumId3HeaderSizeInBytes
					)
				)
			) {
				return;
			}

			if (tokenizer.position + id3HeaderLength > tokenizer.fileInfo.size) {
				if (isUnknownFileSize) {
					return;
				}

				return {
					ext: 'mp3',
					mime: 'audio/mpeg',
				};
			}

			try {
				await safeIgnore(tokenizer, id3HeaderLength, {
					maximumLength: isUnknownFileSize ? maximumId3HeaderSizeInBytes : tokenizer.fileInfo.size,
					reason: 'ID3 payload',
				});
			} catch (error) {
				if (error instanceof EndOfStreamError) {
					return;
				}

				throw error;
			}

			if (this.detectionReentryCount >= maximumDetectionReentryCount) {
				return;
			}

			this.detectionReentryCount++;
			return this.parseTokenizer(tokenizer, this.detectionReentryCount); // Skip ID3 header, recursion
		}

		// Musepack, SV7
		if (this.checkString('MP+')) {
			return {
				ext: 'mpc',
				mime: 'audio/x-musepack',
			};
		}

		if (
			(this.buffer[0] === 0x43 || this.buffer[0] === 0x46)
			&& this.check([0x57, 0x53], {offset: 1})
		) {
			return {
				ext: 'swf',
				mime: 'application/x-shockwave-flash',
			};
		}

		// -- 4-byte signatures --

		// Requires a sample size of 4 bytes
		if (this.check([0xFF, 0xD8, 0xFF])) {
			if (this.check([0xF7], {offset: 3})) { // JPG7/SOF55, indicating a ISO/IEC 14495 / JPEG-LS file
				return {
					ext: 'jls',
					mime: 'image/jls',
				};
			}

			return {
				ext: 'jpg',
				mime: 'image/jpeg',
			};
		}

		if (this.check([0x4F, 0x62, 0x6A, 0x01])) {
			return {
				ext: 'avro',
				mime: 'application/avro',
			};
		}

		if (this.checkString('FLIF')) {
			return {
				ext: 'flif',
				mime: 'image/flif',
			};
		}

		if (this.checkString('8BPS')) {
			return {
				ext: 'psd',
				mime: 'image/vnd.adobe.photoshop',
			};
		}

		// Musepack, SV8
		if (this.checkString('MPCK')) {
			return {
				ext: 'mpc',
				mime: 'audio/x-musepack',
			};
		}

		if (this.checkString('FORM')) {
			return {
				ext: 'aif',
				mime: 'audio/aiff',
			};
		}

		// Core Audio Format (CAF), version 1, followed by the required Audio Description chunk.
		if (this.checkString('caff') && this.check([0x00, 0x01], {offset: 4}) && this.checkString('desc', {offset: 8})) {
			return {
				ext: 'caf',
				mime: 'audio/x-caf', // Non-standard
			};
		}

		if (this.checkString('icns', {offset: 0})) {
			return {
				ext: 'icns',
				mime: 'image/icns',
			};
		}

		// Zip-based file formats
		// Need to be before the `zip` check
		if (this.check([0x50, 0x4B, 0x3, 0x4])) { // Local file header signature
			return detectZip(tokenizer);
		}

		if (this.checkString('OggS')) {
			// This is an OGG container
			await tokenizer.ignore(28);
			const type = new Uint8Array(8);
			await tokenizer.readBuffer(type);

			// Needs to be before `ogg` check
			if (checkBytes(type, [0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64])) {
				return {
					ext: 'opus',
					mime: 'audio/ogg; codecs=opus',
				};
			}

			// If ' theora' in header.
			if (checkBytes(type, [0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61])) {
				return {
					ext: 'ogv',
					mime: 'video/ogg',
				};
			}

			// If '\x01video' in header.
			if (checkBytes(type, [0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00])) {
				return {
					ext: 'ogm',
					mime: 'video/ogg',
				};
			}

			// If ' FLAC' in header  https://xiph.org/flac/faq.html
			if (checkBytes(type, [0x7F, 0x46, 0x4C, 0x41, 0x43])) {
				return {
					ext: 'oga',
					mime: 'audio/ogg',
				};
			}

			// 'Speex  ' in header https://en.wikipedia.org/wiki/Speex
			if (checkBytes(type, [0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20])) {
				return {
					ext: 'spx',
					mime: 'audio/ogg',
				};
			}

			// If '\x01vorbis' in header
			if (checkBytes(type, [0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73])) {
				return {
					ext: 'ogg',
					mime: 'audio/ogg',
				};
			}

			// Default OGG container https://www.iana.org/assignments/media-types/application/ogg
			return {
				ext: 'ogx',
				mime: 'application/ogg',
			};
		}

		if (
			this.check([0x50, 0x4B])
			&& [0x3, 0x5, 0x7].includes(this.buffer[2])
			&& [0x4, 0x6, 0x8].includes(this.buffer[3])
		) {
			return {
				ext: 'zip',
				mime: 'application/zip',
			};
		}

		if (this.checkString('MThd')) {
			return {
				ext: 'mid',
				mime: 'audio/midi',
			};
		}

		if (
			this.checkString('wOFF')
			&& (
				this.check([0x00, 0x01, 0x00, 0x00], {offset: 4})
				|| this.checkString('OTTO', {offset: 4})
			)
		) {
			return {
				ext: 'woff',
				mime: 'font/woff',
			};
		}

		if (
			this.checkString('wOF2')
			&& (
				this.check([0x00, 0x01, 0x00, 0x00], {offset: 4})
				|| this.checkString('OTTO', {offset: 4})
			)
		) {
			return {
				ext: 'woff2',
				mime: 'font/woff2',
			};
		}

		if (this.check([0xD4, 0xC3, 0xB2, 0xA1]) || this.check([0xA1, 0xB2, 0xC3, 0xD4])) {
			return {
				ext: 'pcap',
				mime: 'application/vnd.tcpdump.pcap',
			};
		}

		// Sony DSD Stream File (DSF)
		if (this.checkString('DSD ')) {
			return {
				ext: 'dsf',
				mime: 'audio/x-dsf', // Non-standard
			};
		}

		if (this.checkString('LZIP')) {
			return {
				ext: 'lz',
				mime: 'application/lzip',
			};
		}

		if (this.checkString('fLaC')) {
			return {
				ext: 'flac',
				mime: 'audio/flac',
			};
		}

		if (this.check([0x42, 0x50, 0x47, 0xFB])) {
			return {
				ext: 'bpg',
				mime: 'image/bpg',
			};
		}

		if (this.checkString('wvpk')) {
			return {
				ext: 'wv',
				mime: 'audio/wavpack',
			};
		}

		if (this.checkString('%PDF')) {
			// Assume this is just a normal PDF
			return {
				ext: 'pdf',
				mime: 'application/pdf',
			};
		}

		if (this.check([0x00, 0x61, 0x73, 0x6D])) {
			return {
				ext: 'wasm',
				mime: 'application/wasm',
			};
		}

		// TIFF, little-endian type
		if (this.check([0x49, 0x49])) {
			const fileType = await this.readTiffHeader(false);
			if (fileType) {
				return fileType;
			}
		}

		// TIFF, big-endian type
		if (this.check([0x4D, 0x4D])) {
			const fileType = await this.readTiffHeader(true);
			if (fileType) {
				return fileType;
			}
		}

		if (this.checkString('MAC ')) {
			return {
				ext: 'ape',
				mime: 'audio/ape',
			};
		}

		// https://github.com/file/file/blob/master/magic/Magdir/matroska
		if (this.check([0x1A, 0x45, 0xDF, 0xA3])) { // Root element: EBML
			return detectEbml(tokenizer);
		}

		if (this.checkString('SQLi')) {
			return {
				ext: 'sqlite',
				mime: 'application/x-sqlite3',
			};
		}

		if (this.check([0x4E, 0x45, 0x53, 0x1A])) {
			return {
				ext: 'nes',
				mime: 'application/x-nintendo-nes-rom',
			};
		}

		if (this.checkString('Cr24')) {
			return {
				ext: 'crx',
				mime: 'application/x-google-chrome-extension',
			};
		}

		if (
			this.checkString('MSCF')
			|| this.checkString('ISc(')
		) {
			return {
				ext: 'cab',
				mime: 'application/vnd.ms-cab-compressed',
			};
		}

		if (this.check([0xED, 0xAB, 0xEE, 0xDB])) {
			return {
				ext: 'rpm',
				mime: 'application/x-rpm',
			};
		}

		if (this.check([0xC5, 0xD0, 0xD3, 0xC6])) {
			return {
				ext: 'eps',
				mime: 'application/eps',
			};
		}

		if (this.check([0x28, 0xB5, 0x2F, 0xFD])) {
			return {
				ext: 'zst',
				mime: 'application/zstd',
			};
		}

		if (this.check([0x7F, 0x45, 0x4C, 0x46])) {
			return {
				ext: 'elf',
				mime: 'application/x-elf',
			};
		}

		if (this.check([0x21, 0x42, 0x44, 0x4E])) {
			return {
				ext: 'pst',
				mime: 'application/vnd.ms-outlook',
			};
		}

		if (this.checkString('PAR1') || this.checkString('PARE')) {
			return {
				ext: 'parquet',
				mime: 'application/vnd.apache.parquet',
			};
		}

		if (this.checkString('ttcf')) {
			return {
				ext: 'ttc',
				mime: 'font/collection',
			};
		}

		if (
			this.check([0xFE, 0xED, 0xFA, 0xCE]) // 32-bit, big-endian
			|| this.check([0xFE, 0xED, 0xFA, 0xCF]) // 64-bit, big-endian
			|| this.check([0xCE, 0xFA, 0xED, 0xFE]) // 32-bit, little-endian
			|| this.check([0xCF, 0xFA, 0xED, 0xFE]) // 64-bit, little-endian
		) {
			return {
				ext: 'macho',
				mime: 'application/x-mach-binary',
			};
		}

		if (this.check([0x04, 0x22, 0x4D, 0x18])) {
			return {
				ext: 'lz4',
				mime: 'application/x-lz4', // Informal, used by freedesktop.org shared-mime-info
			};
		}

		if (this.checkString('regf')) {
			return {
				ext: 'dat',
				mime: 'application/x-ft-windows-registry-hive',
			};
		}

		// SPSS Statistical Data File
		if (this.checkString('$FL2') || this.checkString('$FL3')) {
			return {
				ext: 'sav',
				mime: 'application/x-spss-sav',
			};
		}

		// -- 5-byte signatures --

		if (this.check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
			return {
				ext: 'otf',
				mime: 'font/otf',
			};
		}

		if (this.checkString('#!AMR')) {
			return {
				ext: 'amr',
				mime: 'audio/amr',
			};
		}

		if (this.checkString(String.raw`{\rtf`)) {
			return {
				ext: 'rtf',
				mime: 'application/rtf',
			};
		}

		if (this.check([0x46, 0x4C, 0x56, 0x01])) {
			return {
				ext: 'flv',
				mime: 'video/x-flv',
			};
		}

		if (this.checkString('IMPM')) {
			return {
				ext: 'it',
				mime: 'audio/x-it',
			};
		}

		if (
			this.checkString('-lh0-', {offset: 2})
			|| this.checkString('-lh1-', {offset: 2})
			|| this.checkString('-lh2-', {offset: 2})
			|| this.checkString('-lh3-', {offset: 2})
			|| this.checkString('-lh4-', {offset: 2})
			|| this.checkString('-lh5-', {offset: 2})
			|| this.checkString('-lh6-', {offset: 2})
			|| this.checkString('-lh7-', {offset: 2})
			|| this.checkString('-lzs-', {offset: 2})
			|| this.checkString('-lz4-', {offset: 2})
			|| this.checkString('-lz5-', {offset: 2})
			|| this.checkString('-lhd-', {offset: 2})
		) {
			return {
				ext: 'lzh',
				mime: 'application/x-lzh-compressed',
			};
		}

		// MPEG program stream (PS or MPEG-PS)
		if (this.check([0x00, 0x00, 0x01, 0xBA])) {
			//  MPEG-PS, MPEG-1 Part 1
			if (this.check([0x21], {offset: 4, mask: [0xF1]})) {
				return {
					ext: 'mpg', // May also be .ps, .mpeg
					mime: 'video/MP1S',
				};
			}

			// MPEG-PS, MPEG-2 Part 1
			if (this.check([0x44], {offset: 4, mask: [0xC4]})) {
				return {
					ext: 'mpg', // May also be .mpg, .m2p, .vob or .sub
					mime: 'video/MP2P',
				};
			}
		}

		if (this.checkString('ITSF')) {
			return {
				ext: 'chm',
				mime: 'application/vnd.ms-htmlhelp',
			};
		}

		if (this.check([0xCA, 0xFE, 0xBA, 0xBE])) {
			// Java bytecode and Mach-O universal binaries have the same magic number.
			// We disambiguate based on the next 4 bytes, as done by `file`.
			// See https://github.com/file/file/blob/master/magic/Magdir/cafebabe
			const machOArchitectureCount = UINT32_BE.get(this.buffer, 4);
			if (machOArchitectureCount > 0 && machOArchitectureCount <= 30) {
				return {
					ext: 'macho',
					mime: 'application/x-mach-binary',
				};
			}

			const javaClassFileMajorVersion = UINT16_BE.get(this.buffer, 6);
			if (javaClassFileMajorVersion > 30) {
				return {
					ext: 'class',
					mime: 'application/java-vm',
				};
			}
		}

		if (this.checkString('.RMF')) {
			return {
				ext: 'rm',
				mime: 'application/vnd.rn-realmedia',
			};
		}

		// -- 5-byte signatures --

		if (this.checkString('DRACO')) {
			return {
				ext: 'drc',
				mime: 'application/x-ft-draco',
			};
		}

		// -- 6-byte signatures --

		if (this.check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
			return {
				ext: 'xz',
				mime: 'application/x-xz',
			};
		}

		if (this.checkString('<?xml ')) {
			return {
				ext: 'xml',
				mime: 'application/xml',
			};
		}

		if (this.check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
			return {
				ext: '7z',
				mime: 'application/x-7z-compressed',
			};
		}

		if (
			this.check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7])
			&& (this.buffer[6] === 0x0 || this.buffer[6] === 0x1)
		) {
			return {
				ext: 'rar',
				mime: 'application/x-rar-compressed',
			};
		}

		if (this.checkString('solid ')) {
			return {
				ext: 'stl',
				mime: 'model/stl',
			};
		}

		if (this.checkString('AC')) {
			const version = new StringType(4, 'latin1').get(this.buffer, 2);
			if (/^\d+$/v.test(version) && version >= 1000 && version <= 1050) {
				return {
					ext: 'dwg',
					mime: 'image/vnd.dwg',
				};
			}
		}

		if (this.checkString('070707')) {
			return {
				ext: 'cpio',
				mime: 'application/x-cpio',
			};
		}

		// -- 7-byte signatures --

		if (this.checkString('BLENDER')) {
			return {
				ext: 'blend',
				mime: 'application/x-blender',
			};
		}

		if (this.checkString('!<arch>')) {
			await tokenizer.ignore(8);
			const string = await tokenizer.readToken(new StringType(13, 'ascii'));
			if (string === 'debian-binary') {
				return {
					ext: 'deb',
					mime: 'application/x-deb',
				};
			}

			return {
				ext: 'ar',
				mime: 'application/x-unix-archive',
			};
		}

		if (
			this.checkString('WEBVTT')
			&&	(
				// One of LF, CR, tab, space, or end of file must follow "WEBVTT" per the spec (see `fixture/fixture-vtt-*.vtt` for examples). Note that `\0` is technically the null character (there is no such thing as an EOF character). However, checking for `\0` gives us the same result as checking for the end of the stream.
				(['\n', '\r', '\t', ' ', '\0'].some(char7 => this.checkString(char7, {offset: 6}))))
		) {
			return {
				ext: 'vtt',
				mime: 'text/vtt',
			};
		}

		// -- 8-byte signatures --

		if (this.check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
			return detectPng(tokenizer);
		}

		if (this.check([0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00])) {
			return {
				ext: 'arrow',
				mime: 'application/vnd.apache.arrow.file',
			};
		}

		if (this.check([0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])) {
			return {
				ext: 'glb',
				mime: 'model/gltf-binary',
			};
		}

		// `mov` format variants
		if (
			this.check([0x66, 0x72, 0x65, 0x65], {offset: 4}) // `free`
			|| this.check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) // `mdat` MJPEG
			|| this.check([0x6D, 0x6F, 0x6F, 0x76], {offset: 4}) // `moov`
			|| this.check([0x77, 0x69, 0x64, 0x65], {offset: 4}) // `wide`
		) {
			return {
				ext: 'mov',
				mime: 'video/quicktime',
			};
		}

		// -- 9-byte signatures --

		if (this.check([0x49, 0x49, 0x52, 0x4F, 0x08, 0x00, 0x00, 0x00, 0x18])) {
			return {
				ext: 'orf',
				mime: 'image/x-olympus-orf',
			};
		}

		if (this.checkString('gimp xcf ')) {
			return {
				ext: 'xcf',
				mime: 'image/x-xcf',
			};
		}

		// File Type Box (https://en.wikipedia.org/wiki/ISO_base_media_file_format)
		// It's not required to be first, but it's recommended to be. Almost all ISO base media files start with `ftyp` box.
		// `ftyp` box must contain a brand major identifier, which must consist of ISO 8859-1 printable characters.
		// Here we check for 8859-1 printable characters (for simplicity, it's a mask which also catches one non-printable character).
		if (
			this.checkString('ftyp', {offset: 4})
			&& (this.buffer[8] & 0x60) !== 0x00 // Brand major, first character ASCII?
		) {
			// They all can have MIME `video/mp4` except `application/mp4` special-case which is hard to detect.
			// For some cases, we're specific, everything else falls to `video/mp4` with `mp4` extension.
			const brandMajor = new StringType(4, 'latin1').get(this.buffer, 8).replace('\0', ' ').trim();
			switch (brandMajor) {
				case 'avif':
				case 'avis':
					return {ext: 'avif', mime: 'image/avif'};
				case 'mif1':
					return {ext: 'heic', mime: 'image/heif'};
				case 'msf1':
					return {ext: 'heic', mime: 'image/heif-sequence'};
				case 'heic':
				case 'heix':
					return {ext: 'heic', mime: 'image/heic'};
				case 'hevc':
				case 'hevx':
					return {ext: 'heic', mime: 'image/heic-sequence'};
				case 'qt':
					return {ext: 'mov', mime: 'video/quicktime'};
				case 'M4V':
				case 'M4VH':
				case 'M4VP':
					return {ext: 'm4v', mime: 'video/x-m4v'};
				case 'M4P':
					return {ext: 'm4p', mime: 'video/mp4'};
				case 'M4B':
					return {ext: 'm4b', mime: 'audio/mp4'};
				case 'M4A':
					return {ext: 'm4a', mime: 'audio/x-m4a'};
				case 'F4V':
					return {ext: 'f4v', mime: 'video/mp4'};
				case 'F4P':
					return {ext: 'f4p', mime: 'video/mp4'};
				case 'F4A':
					return {ext: 'f4a', mime: 'audio/mp4'};
				case 'F4B':
					return {ext: 'f4b', mime: 'audio/mp4'};
				case 'crx':
					return {ext: 'cr3', mime: 'image/x-canon-cr3'};
				default:
					if (brandMajor.startsWith('3g')) {
						if (brandMajor.startsWith('3g2')) {
							return {ext: '3g2', mime: 'video/3gpp2'};
						}

						return {ext: '3gp', mime: 'video/3gpp'};
					}

					return {ext: 'mp4', mime: 'video/mp4'};
			}
		}

		// -- 10-byte signatures --

		if (this.checkString('REGEDIT4\r\n')) {
			return {
				ext: 'reg',
				mime: 'application/x-ms-regedit',
			};
		}

		// -- 12-byte signatures --

		// RIFF file format which might be AVI, WAV, QCP, etc
		if (this.check([0x52, 0x49, 0x46, 0x46])) {
			if (this.checkString('WEBP', {offset: 8})) {
				return {
					ext: 'webp',
					mime: 'image/webp',
				};
			}

			if (this.check([0x41, 0x56, 0x49], {offset: 8})) {
				return {
					ext: 'avi',
					mime: 'video/vnd.avi',
				};
			}

			if (this.check([0x57, 0x41, 0x56, 0x45], {offset: 8})) {
				return {
					ext: 'wav',
					mime: 'audio/wav',
				};
			}

			// QLCM, QCP file
			if (this.check([0x51, 0x4C, 0x43, 0x4D], {offset: 8})) {
				return {
					ext: 'qcp',
					mime: 'audio/qcelp',
				};
			}
		}

		if (this.check([0x49, 0x49, 0x55, 0x00, 0x18, 0x00, 0x00, 0x00, 0x88, 0xE7, 0x74, 0xD8])) {
			return {
				ext: 'rw2',
				mime: 'image/x-panasonic-rw2',
			};
		}

		// ASF_Header_Object first 80 bytes
		if (this.check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
			return detectAsf(tokenizer);
		}

		if (this.check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A])) {
			return {
				ext: 'ktx',
				mime: 'image/ktx',
			};
		}

		if ((this.check([0x7E, 0x10, 0x04]) || this.check([0x7E, 0x18, 0x04])) && this.check([0x30, 0x4D, 0x49, 0x45], {offset: 4})) {
			return {
				ext: 'mie',
				mime: 'application/x-mie',
			};
		}

		if (this.check([0x27, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], {offset: 2})) {
			return {
				ext: 'shp',
				mime: 'application/x-esri-shape',
			};
		}

		if (this.check([0xFF, 0x4F, 0xFF, 0x51])) {
			return {
				ext: 'j2c',
				mime: 'image/j2c',
			};
		}

		if (this.check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
			// JPEG-2000 family

			await tokenizer.ignore(20);
			const type = await tokenizer.readToken(new StringType(4, 'ascii'));
			switch (type) {
				case 'jp2 ':
					return {
						ext: 'jp2',
						mime: 'image/jp2',
					};
				case 'jpx ':
					return {
						ext: 'jpx',
						mime: 'image/jpx',
					};
				case 'jpm ':
					return {
						ext: 'jpm',
						mime: 'image/jpm',
					};
				case 'mjp2':
					return {
						ext: 'mj2',
						mime: 'image/mj2',
					};
				default:
					return;
			}
		}

		if (
			this.check([0xFF, 0x0A])
			|| this.check([0x00, 0x00, 0x00, 0x0C, 0x4A, 0x58, 0x4C, 0x20, 0x0D, 0x0A, 0x87, 0x0A])
		) {
			return {
				ext: 'jxl',
				mime: 'image/jxl',
			};
		}

		if (this.check([0xFE, 0xFF])) { // UTF-16-BOM-BE
			if (this.checkString('<?xml ', {offset: 2, encoding: 'utf-16be'})) {
				return {
					ext: 'xml',
					mime: 'application/xml',
				};
			}

			return undefined; // Some unknown text based format
		}

		if (this.check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
			// Detected Microsoft Compound File Binary File (MS-CFB) Format.
			return {
				ext: 'cfb',
				mime: 'application/x-cfb',
			};
		}

		// Direct Stream Digital Interchange File Format (DSDIFF)
		if (this.checkString('FRM8') && this.checkString('DSD ', {offset: 12})) {
			return {
				ext: 'dff',
				mime: 'audio/x-dff', // Non-standard
			};
		}

		// Increase sample size from 32 to 256.
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(256, tokenizer.fileInfo.size), mayBeLess: true});

		if (this.check([0x61, 0x63, 0x73, 0x70], {offset: 36})) {
			return {
				ext: 'icc',
				mime: 'application/vnd.iccprofile',
			};
		}

		// ACE: requires 14 bytes in the buffer
		if (this.checkString('**ACE', {offset: 7}) && this.checkString('**', {offset: 12})) {
			return {
				ext: 'ace',
				mime: 'application/x-ace-compressed',
			};
		}

		// -- 15-byte signatures --

		if (this.checkString('BEGIN:')) {
			if (this.checkString('VCARD', {offset: 6})) {
				return {
					ext: 'vcf',
					mime: 'text/vcard',
				};
			}

			if (this.checkString('VCALENDAR', {offset: 6})) {
				return {
					ext: 'ics',
					mime: 'text/calendar',
				};
			}
		}

		// `raf` is here just to keep all the raw image detectors together.
		if (this.checkString('FUJIFILMCCD-RAW')) {
			return {
				ext: 'raf',
				mime: 'image/x-fujifilm-raf',
			};
		}

		if (this.checkString('Extended Module:')) {
			return {
				ext: 'xm',
				mime: 'audio/x-xm',
			};
		}

		if (this.checkString('Creative Voice File')) {
			return {
				ext: 'voc',
				mime: 'audio/x-voc',
			};
		}

		if (this.check([0x04, 0x00, 0x00, 0x00]) && this.buffer.length >= 16) { // Rough & quick check Pickle/ASAR
			const jsonSize = new DataView(this.buffer.buffer).getUint32(12, true);

			if (jsonSize > 12 && this.buffer.length >= jsonSize + 16) {
				try {
					const header = new TextDecoder().decode(this.buffer.subarray(16, jsonSize + 16));
					const json = JSON.parse(header);
					// Check if Pickle is ASAR
					if (json.files) { // Final check, assuring Pickle/ASAR format
						return {
							ext: 'asar',
							mime: 'application/x-asar',
						};
					}
				} catch {}
			}
		}

		if (this.check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
			return {
				ext: 'mxf',
				mime: 'application/mxf',
			};
		}

		if (this.checkString('SCRM', {offset: 44})) {
			return {
				ext: 's3m',
				mime: 'audio/x-s3m',
			};
		}

		// Raw MPEG-2 transport stream (188-byte packets)
		if (this.check([0x47]) && this.check([0x47], {offset: 188})) {
			return {
				ext: 'mts',
				mime: 'video/mp2t',
			};
		}

		// Blu-ray Disc Audio-Video (BDAV) MPEG-2 transport stream has 4-byte TP_extra_header before each 188-byte packet
		if (this.check([0x47], {offset: 4}) && this.check([0x47], {offset: 196})) {
			return {
				ext: 'mts',
				mime: 'video/mp2t',
			};
		}

		if (this.check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], {offset: 60})) {
			return {
				ext: 'mobi',
				mime: 'application/x-mobipocket-ebook',
			};
		}

		if (this.check([0x44, 0x49, 0x43, 0x4D], {offset: 128})) {
			return {
				ext: 'dcm',
				mime: 'application/dicom',
			};
		}

		if (this.check([0x4C, 0x00, 0x00, 0x00, 0x01, 0x14, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46])) {
			return {
				ext: 'lnk',
				mime: 'application/x-ms-shortcut', // Informal, used by freedesktop.org shared-mime-info
			};
		}

		if (this.check([0x62, 0x6F, 0x6F, 0x6B, 0x00, 0x00, 0x00, 0x00, 0x6D, 0x61, 0x72, 0x6B, 0x00, 0x00, 0x00, 0x00])) {
			return {
				ext: 'alias',
				mime: 'application/x-ft-apple.alias',
			};
		}

		if (this.checkString('Kaydara FBX Binary  \0')) {
			return {
				ext: 'fbx',
				mime: 'application/x-ft-fbx',
			};
		}

		if (
			this.check([0x4C, 0x50], {offset: 34})
			&& (
				this.check([0x00, 0x00, 0x01], {offset: 8})
				|| this.check([0x01, 0x00, 0x02], {offset: 8})
				|| this.check([0x02, 0x00, 0x02], {offset: 8})
			)
		) {
			return {
				ext: 'eot',
				mime: 'application/vnd.ms-fontobject',
			};
		}

		if (this.check([0x06, 0x06, 0xED, 0xF5, 0xD8, 0x1D, 0x46, 0xE5, 0xBD, 0x31, 0xEF, 0xE7, 0xFE, 0x74, 0xB7, 0x1D])) {
			return {
				ext: 'indd',
				mime: 'application/x-indesign',
			};
		}

		// -- 16-byte signatures --

		// JMP files - check for both Little Endian and Big Endian signatures
		if (this.check([0xFF, 0xFF, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00])
			|| this.check([0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x01])) {
			return {
				ext: 'jmp',
				mime: 'application/x-jmp-data',
			};
		}

		// Increase sample size from 256 to 512
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(512, tokenizer.fileInfo.size), mayBeLess: true});

		// Requires a buffer size of 512 bytes
		if ((this.checkString('ustar', {offset: 257}) && (this.checkString('\0', {offset: 262}) || this.checkString(' ', {offset: 262})))
			|| (this.check([0, 0, 0, 0, 0, 0], {offset: 257}) && tarHeaderChecksumMatches(this.buffer))) {
			return {
				ext: 'tar',
				mime: 'application/x-tar',
			};
		}

		if (this.check([0xFF, 0xFE])) { // UTF-16-BOM-LE
			const encoding = 'utf-16le';
			if (this.checkString('<?xml ', {offset: 2, encoding})) {
				return {
					ext: 'xml',
					mime: 'application/xml',
				};
			}

			if (this.check([0xFF, 0x0E], {offset: 2}) && this.checkString('SketchUp Model', {offset: 4, encoding})) {
				return {
					ext: 'skp',
					mime: 'application/vnd.sketchup.skp',
				};
			}

			if (this.checkString('Windows Registry Editor Version 5.00\r\n', {offset: 2, encoding})) {
				return {
					ext: 'reg',
					mime: 'application/x-ms-regedit',
				};
			}

			return undefined; // Some text based format
		}

		if (this.checkString('-----BEGIN PGP MESSAGE-----')) {
			return {
				ext: 'pgp',
				mime: 'application/pgp-encrypted',
			};
		}

		// ISO 9660 optical disc image: the Volume Descriptor Set starts at sector 16 (2048-byte
		// sectors). Every descriptor in that set carries the 5-byte standard identifier `CD001`
		// at offset 1, regardless of descriptor type, so checking the first one is sufficient.
		// Only attempted for random-access inputs (buffer/file/blob, or a stream sampled with a
		// large enough `sampleSize`): on an unknown-size stream this offset is far past what's
		// reasonable to buffer just to rule out one format, so it's left undetected there.
		const isoStandardIdentifierOffset = 32_769;
		const isoStandardIdentifierLength = 5;
		if (
			tokenizer.supportsRandomAccess()
			&& tokenizer.fileInfo.size >= (isoStandardIdentifierOffset + isoStandardIdentifierLength)
		) {
			const isoStandardIdentifier = new Uint8Array(isoStandardIdentifierLength);
			await tokenizer.peekBuffer(isoStandardIdentifier, {
				position: isoStandardIdentifierOffset,
				length: isoStandardIdentifierLength,
				mayBeLess: true,
			});

			if (checkBytes(isoStandardIdentifier, stringToBytes('CD001'))) {
				return {
					ext: 'iso',
					mime: 'application/x-iso9660-image',
				};
			}
		}
	}

	// Detections with limited supporting data, resulting in a higher likelihood of false positives
	async detectImprecise(tokenizer) {
		this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);
		const fileSize = getKnownFileSizeOrMaximum(tokenizer.fileInfo.size);

		// Read initial sample size of 8 bytes
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(8, fileSize), mayBeLess: true});

		if (
			this.check([0x0, 0x0, 0x1, 0xBA])
			|| this.check([0x0, 0x0, 0x1, 0xB3])
		) {
			return {
				ext: 'mpg',
				mime: 'video/mpeg',
			};
		}

		if (this.check([0x00, 0x01, 0x00, 0x00, 0x00])) {
			return {
				ext: 'ttf',
				mime: 'font/ttf',
			};
		}

		if (this.check([0x00, 0x00, 0x01, 0x00])) {
			return {
				ext: 'ico',
				mime: 'image/x-icon',
			};
		}

		if (this.check([0x00, 0x00, 0x02, 0x00])) {
			return {
				ext: 'cur',
				mime: 'image/x-icon',
			};
		}

		// Adjust buffer to `mpegOffsetTolerance`, plus the 4 bytes of the frame header itself
		await tokenizer.peekBuffer(this.buffer, {length: Math.min(4 + this.options.mpegOffsetTolerance, fileSize), mayBeLess: true});

		// Check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE)
		if (this.buffer.length >= (4 + this.options.mpegOffsetTolerance)) {
			for (let depth = 0; depth <= this.options.mpegOffsetTolerance; ++depth) {
				const type = this.scanMpeg(depth);
				if (type) {
					return type;
				}
			}
		}
	}

	async readTiffTag(isBigEndian) {
		const tagId = await this.tokenizer.readToken(isBigEndian ? UINT16_BE : UINT16_LE);
		await this.tokenizer.ignore(10);
		switch (tagId) {
			case 50_341:
				return {
					ext: 'arw',
					mime: 'image/x-sony-arw',
				};
			case 50_706:
				return {
					ext: 'dng',
					mime: 'image/x-adobe-dng',
				};
			default:
		}
	}

	async readTiffIFD(isBigEndian) {
		const numberOfTags = await this.tokenizer.readToken(isBigEndian ? UINT16_BE : UINT16_LE);
		if (numberOfTags > maximumTiffTagCount) {
			return;
		}

		if (
			hasUnknownFileSize(this.tokenizer)
			&& (2 + (numberOfTags * 12)) > maximumTiffIfdOffsetInBytes
		) {
			return;
		}

		for (let n = 0; n < numberOfTags; ++n) {
			const fileType = await this.readTiffTag(isBigEndian);
			if (fileType) {
				return fileType;
			}
		}
	}

	async readTiffHeader(isBigEndian) {
		const tiffFileType = {
			ext: 'tif',
			mime: 'image/tiff',
		};

		const version = (isBigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 2);
		const ifdOffset = (isBigEndian ? UINT32_BE : UINT32_LE).get(this.buffer, 4);

		if (version === 42) {
			// TIFF file header
			if (ifdOffset >= 6) {
				if (this.checkString('CR', {offset: 8})) {
					return {
						ext: 'cr2',
						mime: 'image/x-canon-cr2',
					};
				}

				if (ifdOffset >= 8) {
					const someId1 = (isBigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 8);
					const someId2 = (isBigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 10);

					if (
						(someId1 === 0x1C && someId2 === 0xFE)
						|| (someId1 === 0x1F && someId2 === 0x0B)) {
						return {
							ext: 'nef',
							mime: 'image/x-nikon-nef',
						};
					}
				}
			}

			if (
				hasUnknownFileSize(this.tokenizer)
				&& ifdOffset > maximumTiffStreamIfdOffsetInBytes
			) {
				return tiffFileType;
			}

			const maximumTiffOffset = hasUnknownFileSize(this.tokenizer) ? maximumTiffIfdOffsetInBytes : this.tokenizer.fileInfo.size;

			try {
				await safeIgnore(this.tokenizer, ifdOffset, {
					maximumLength: maximumTiffOffset,
					reason: 'TIFF IFD offset',
				});
			} catch (error) {
				if (error instanceof EndOfStreamError) {
					return;
				}

				throw error;
			}

			let fileType;
			try {
				fileType = await this.readTiffIFD(isBigEndian);
			} catch (error) {
				if (error instanceof EndOfStreamError) {
					return;
				}

				throw error;
			}

			return fileType ?? tiffFileType;
		}

		if (version === 43) {	// Big TIFF file header
			return tiffFileType;
		}
	}

	/**
	Scan check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE).

	@param {number} offset - Offset to scan for sync-preamble.
	@returns {{ext: string, mime: string} | undefined} The detected file type, if any.
	*/
	scanMpeg(offset) {
		if (this.check([0xFF, 0xE0], {offset, mask: [0xFF, 0xE0]})) {
			// Both (ADTS) MPEG-2 and MPEG-4 are AAC
			if (this.check([0x10], {offset: offset + 1, mask: [0x16]})) {
				return {
					ext: 'aac',
					mime: 'audio/aac',
				};
			}

			// An MPEG-1 Layer I header with CRC protection enabled is byte-identical to a UTF-16 LE BOM, so text files cannot be told apart from audio. `file(1)` disables MPEG-1 Layer I detection completely for this reason; we only drop the colliding variant.
			if (this.check([0xFF, 0xFE], {offset})) {
				return;
			}

			// Reject the reserved MPEG version `01`
			if (this.check([0x08], {offset: offset + 1, mask: [0x18]})) {
				return;
			}

			// Reject the `bad` (`1111`) bitrate index
			if (this.check([0xF0], {offset: offset + 2, mask: [0xF0]})) {
				return;
			}

			// Reject the reserved sampling frequency `11`
			if (this.check([0x0C], {offset: offset + 2, mask: [0x0C]})) {
				return;
			}

			// MPEG 1 or 2 Layer 3 header
			// Check for MPEG layer 3
			if (this.check([0x02], {offset: offset + 1, mask: [0x06]})) {
				return {
					ext: 'mp3',
					mime: 'audio/mpeg',
				};
			}

			// Check for MPEG layer 2
			if (this.check([0x04], {offset: offset + 1, mask: [0x06]})) {
				return {
					ext: 'mp2',
					mime: 'audio/mpeg',
				};
			}

			// Check for MPEG layer 1
			if (this.check([0x06], {offset: offset + 1, mask: [0x06]})) {
				return {
					ext: 'mp1',
					mime: 'audio/mpeg',
				};
			}
		}
	}
}

const supportedExtensions = new Set(extensions);
const supportedMimeTypes = new Set(supported_mimeTypes);

async function fileTypeFromFile(path, options) {
	return (new FileTypeParser(options)).fromFile(path);
}


/***/ })

};
;