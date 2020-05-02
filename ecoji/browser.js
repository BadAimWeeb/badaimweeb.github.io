require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
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

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
class Ecoji {
    constructor(mapping) {
        this.mapping = mapping;
    }
    encode(input) {
        let output = '';
        const bufferIterator = buffer_1.Buffer.from(input.encode(), 'binary');
        const values = bufferIterator.values();
        let length = bufferIterator.length;
        while (length > 0) {
            length -= 5;
            const buffer = [];
            for (let i = 0; i < 5; i++) {
                const code = values.next();
                buffer[i] = !code.done ? code.value : 0;
            }
            output += this.mapping.getEmoji(buffer[0] << 2 | buffer[1] >> 6);
            switch (buffer.filter(i => i).length) {
                case 1:
                    output += [
                        this.mapping.getPadding().repeat(3),
                    ].join('');
                    break;
                case 2:
                    output += [
                        this.mapping.getEmoji((buffer[1] & 0x3f) << 4 | buffer[2] >> 4),
                        this.mapping.getPadding().repeat(2),
                    ].join('');
                    break;
                case 3:
                    output += [
                        this.mapping.getEmoji((buffer[1] & 0x3f) << 4 | buffer[2] >> 4),
                        this.mapping.getEmoji((buffer[2] & 0x0f) << 6 | buffer[3] >> 2),
                        this.mapping.getPadding(),
                    ].join('');
                    break;
                case 4:
                    output += [
                        this.mapping.getEmoji((buffer[1] & 0x3f) << 4 | buffer[2] >> 4),
                        this.mapping.getEmoji((buffer[2] & 0x0f) << 6 | buffer[3] >> 2),
                    ].join('');
                    switch (buffer[3] & 0x03) {
                        case 0:
                            output += this.mapping.getPadding40();
                            break;
                        case 1:
                            output += this.mapping.getPadding41();
                            break;
                        case 2:
                            output += this.mapping.getPadding42();
                            break;
                        case 3:
                            output += this.mapping.getPadding43();
                            break;
                    }
                    break;
                case 5:
                    output += [
                        this.mapping.getEmoji((buffer[1] & 0x3f) << 4 | buffer[2] >> 4),
                        this.mapping.getEmoji((buffer[2] & 0x0f) << 6 | buffer[3] >> 2),
                        this.mapping.getEmoji((buffer[3] & 0x03) << 8 | buffer[4]),
                    ].join('');
                    break;
                default:
                    break;
            }
        }
        return output;
    }
    decode(input) {
        let output = '';
        const emojis = input.replace(/(?:\r\n|\r|\n)/g, '').decode().mb_split();
        while (emojis.length) {
            if (emojis.length < 4) {
                throw Error('Unexpected emoji sequence provided.');
            }
            const runes = emojis.splice(0, 4);
            const bits = runes.slice(0, 3).map(emoji => this.mapping.getId(emoji));
            switch (runes[3]) {
                case this.mapping.getPadding40():
                    bits[3] = 0;
                    break;
                case this.mapping.getPadding41():
                    bits[3] = 1 << 8;
                    break;
                case this.mapping.getPadding42():
                    bits[3] = 2 << 8;
                    break;
                case this.mapping.getPadding43():
                    bits[3] = 3 << 8;
                    break;
                default:
                    bits[3] = this.mapping.getId(runes[3]);
                    break;
            }
            let out = [
                bits[0] >> 2,
                ((bits[0] & 0x3) << 6) | (bits[1] >> 4),
                ((bits[1] & 0xf) << 4) | (bits[2] >> 6),
                ((bits[2] & 0x3f) << 2) | (bits[3] >> 8),
                bits[3] & 0xff,
            ];
            if (runes[1] === this.mapping.getPadding()) {
                out = out.slice(0, 1);
            }
            else if (runes[2] === this.mapping.getPadding()) {
                out = out.slice(0, 2);
            }
            else if (runes[3] === this.mapping.getPadding()) {
                out = out.slice(0, 3);
            }
            else if ([
                this.mapping.getPadding40(),
                this.mapping.getPadding41(),
                this.mapping.getPadding42(),
                this.mapping.getPadding43(),
            ].indexOf(runes[3]) !== -1) {
                out = out.slice(0, 4);
            }
            output += out.reduce((result, item) => {
                result += String.fromCharCode(item);
                return result;
            }, '');
        }
        return output.decode();
    }
}
exports.default = Ecoji;

},{"buffer":2}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const padding = 0x2615;
const padding40 = 0x269C;
const padding41 = 0x1F3CD;
const padding42 = 0x1F4D1;
const padding43 = 0x1F64B;
class Mapping {
    constructor(emojis) {
        // This should sort before everything.  This is output when 3 or less input bytes are present.
        this.padding = String.fromCodePoint(padding);
        // The following paddings are used when only 4 of 5 input bytes are present.
        // This should sort between padding and emojis[0]
        this.padding40 = String.fromCodePoint(padding40);
        // This should sort between emojis[255] and emojis[256]
        this.padding41 = String.fromCodePoint(padding41);
        // This should sort between emojis[511] and emojis[512]
        this.padding42 = String.fromCodePoint(padding42);
        // This should sort between emojis[767] and emojis[768]
        this.padding43 = String.fromCodePoint(padding43);
        this.emojis = emojis.reduce((Map, hexUnicode, i) => Map.set(String.fromCodePoint(Number(hexUnicode)), i), new Map());
        this.emojis.set(this.padding, -1);
        this.revEmojis = emojis.reduce((Map, hexUnicode, i) => Map.set(i, String.fromCodePoint(Number(hexUnicode))), new Map());
        this.revEmojis.set(-1, this.padding);
    }
    getEmoji(id) {
        const emoji = this.revEmojis.get(id);
        if (undefined === emoji) {
            throw Error(`Invalid id provided: ${id}`);
        }
        return emoji;
    }
    getId(rune) {
        const id = this.emojis.get(rune);
        if (undefined === id) {
            throw Error(`Invalid rune provided: ${rune}`);
        }
        return id;
    }
    getPadding() {
        return this.padding;
    }
    getPadding40() {
        return this.padding40;
    }
    getPadding41() {
        return this.padding41;
    }
    getPadding42() {
        return this.padding42;
    }
    getPadding43() {
        return this.padding43;
    }
}
exports.default = Mapping;

},{}],6:[function(require,module,exports){
"use strict";
/* tslint:disable-next-line:max-line-length */
/** wget -qO- https://unicode.org/Public/emoji/11.0/emoji-test.txt | cut -f 1 -d ' ' | sort -u | sed '/^[#0]/ d' | sed '/^\s*$/d' | sed -e 's/^/'0x/' */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    '0x1F004',
    '0x1F0CF',
    '0x1F170',
    '0x1F171',
    '0x1F17E',
    '0x1F17F',
    '0x1F18E',
    '0x1F191',
    '0x1F192',
    '0x1F193',
    '0x1F194',
    '0x1F195',
    '0x1F196',
    '0x1F197',
    '0x1F198',
    '0x1F199',
    '0x1F19A',
    '0x1F1E6',
    '0x1F1E7',
    '0x1F1E8',
    '0x1F1E9',
    '0x1F1EA',
    '0x1F1EB',
    '0x1F1EC',
    '0x1F1ED',
    '0x1F1EE',
    '0x1F1EF',
    '0x1F1F0',
    '0x1F1F1',
    '0x1F1F2',
    '0x1F1F3',
    '0x1F1F4',
    '0x1F1F5',
    '0x1F1F6',
    '0x1F1F7',
    '0x1F1F8',
    '0x1F1F9',
    '0x1F1FA',
    '0x1F1FB',
    '0x1F1FC',
    '0x1F1FD',
    '0x1F1FE',
    '0x1F1FF',
    '0x1F201',
    '0x1F202',
    '0x1F21A',
    '0x1F22F',
    '0x1F232',
    '0x1F233',
    '0x1F234',
    '0x1F235',
    '0x1F236',
    '0x1F237',
    '0x1F238',
    '0x1F239',
    '0x1F23A',
    '0x1F250',
    '0x1F251',
    '0x1F300',
    '0x1F301',
    '0x1F302',
    '0x1F303',
    '0x1F304',
    '0x1F305',
    '0x1F306',
    '0x1F307',
    '0x1F308',
    '0x1F309',
    '0x1F30A',
    '0x1F30B',
    '0x1F30C',
    '0x1F30D',
    '0x1F30E',
    '0x1F30F',
    '0x1F310',
    '0x1F311',
    '0x1F312',
    '0x1F313',
    '0x1F314',
    '0x1F315',
    '0x1F316',
    '0x1F317',
    '0x1F318',
    '0x1F319',
    '0x1F31A',
    '0x1F31B',
    '0x1F31C',
    '0x1F31D',
    '0x1F31E',
    '0x1F31F',
    '0x1F320',
    '0x1F321',
    '0x1F324',
    '0x1F325',
    '0x1F326',
    '0x1F327',
    '0x1F328',
    '0x1F329',
    '0x1F32A',
    '0x1F32B',
    '0x1F32C',
    '0x1F32D',
    '0x1F32E',
    '0x1F32F',
    '0x1F330',
    '0x1F331',
    '0x1F332',
    '0x1F333',
    '0x1F334',
    '0x1F335',
    '0x1F336',
    '0x1F337',
    '0x1F338',
    '0x1F339',
    '0x1F33A',
    '0x1F33B',
    '0x1F33C',
    '0x1F33D',
    '0x1F33E',
    '0x1F33F',
    '0x1F340',
    '0x1F341',
    '0x1F342',
    '0x1F343',
    '0x1F344',
    '0x1F345',
    '0x1F346',
    '0x1F347',
    '0x1F348',
    '0x1F349',
    '0x1F34A',
    '0x1F34B',
    '0x1F34C',
    '0x1F34D',
    '0x1F34E',
    '0x1F34F',
    '0x1F350',
    '0x1F351',
    '0x1F352',
    '0x1F353',
    '0x1F354',
    '0x1F355',
    '0x1F356',
    '0x1F357',
    '0x1F358',
    '0x1F359',
    '0x1F35A',
    '0x1F35B',
    '0x1F35C',
    '0x1F35D',
    '0x1F35E',
    '0x1F35F',
    '0x1F360',
    '0x1F361',
    '0x1F362',
    '0x1F363',
    '0x1F364',
    '0x1F365',
    '0x1F366',
    '0x1F367',
    '0x1F368',
    '0x1F369',
    '0x1F36A',
    '0x1F36B',
    '0x1F36C',
    '0x1F36D',
    '0x1F36E',
    '0x1F36F',
    '0x1F370',
    '0x1F371',
    '0x1F372',
    '0x1F373',
    '0x1F374',
    '0x1F375',
    '0x1F376',
    '0x1F377',
    '0x1F378',
    '0x1F379',
    '0x1F37A',
    '0x1F37B',
    '0x1F37C',
    '0x1F37D',
    '0x1F37E',
    '0x1F37F',
    '0x1F380',
    '0x1F381',
    '0x1F382',
    '0x1F383',
    '0x1F384',
    '0x1F385',
    '0x1F386',
    '0x1F387',
    '0x1F388',
    '0x1F389',
    '0x1F38A',
    '0x1F38B',
    '0x1F38C',
    '0x1F38D',
    '0x1F38E',
    '0x1F38F',
    '0x1F390',
    '0x1F391',
    '0x1F392',
    '0x1F393',
    '0x1F396',
    '0x1F397',
    '0x1F399',
    '0x1F39A',
    '0x1F39B',
    '0x1F39E',
    '0x1F39F',
    '0x1F3A0',
    '0x1F3A1',
    '0x1F3A2',
    '0x1F3A3',
    '0x1F3A4',
    '0x1F3A5',
    '0x1F3A6',
    '0x1F3A7',
    '0x1F3A8',
    '0x1F3A9',
    '0x1F3AA',
    '0x1F3AB',
    '0x1F3AC',
    '0x1F3AD',
    '0x1F3AE',
    '0x1F3AF',
    '0x1F3B0',
    '0x1F3B1',
    '0x1F3B2',
    '0x1F3B3',
    '0x1F3B4',
    '0x1F3B5',
    '0x1F3B6',
    '0x1F3B7',
    '0x1F3B8',
    '0x1F3B9',
    '0x1F3BA',
    '0x1F3BB',
    '0x1F3BC',
    '0x1F3BD',
    '0x1F3BE',
    '0x1F3BF',
    '0x1F3C0',
    '0x1F3C1',
    '0x1F3C2',
    '0x1F3C3',
    '0x1F3C4',
    '0x1F3C5',
    '0x1F3C6',
    '0x1F3C7',
    '0x1F3C8',
    '0x1F3C9',
    '0x1F3CA',
    '0x1F3CB',
    '0x1F3CC',
    '0x1F3CE',
    '0x1F3CF',
    '0x1F3D0',
    '0x1F3D1',
    '0x1F3D2',
    '0x1F3D3',
    '0x1F3D4',
    '0x1F3D5',
    '0x1F3D6',
    '0x1F3D7',
    '0x1F3D8',
    '0x1F3D9',
    '0x1F3DA',
    '0x1F3DB',
    '0x1F3DC',
    '0x1F3DD',
    '0x1F3DE',
    '0x1F3DF',
    '0x1F3E0',
    '0x1F3E1',
    '0x1F3E2',
    '0x1F3E3',
    '0x1F3E4',
    '0x1F3E5',
    '0x1F3E6',
    '0x1F3E7',
    '0x1F3E8',
    '0x1F3E9',
    '0x1F3EA',
    '0x1F3EB',
    '0x1F3EC',
    '0x1F3ED',
    '0x1F3EE',
    '0x1F3EF',
    '0x1F3F0',
    '0x1F3F3',
    '0x1F3F4',
    '0x1F3F5',
    '0x1F3F7',
    '0x1F3F8',
    '0x1F3F9',
    '0x1F3FA',
    '0x1F3FB',
    '0x1F3FC',
    '0x1F3FD',
    '0x1F3FE',
    '0x1F3FF',
    '0x1F400',
    '0x1F401',
    '0x1F402',
    '0x1F403',
    '0x1F404',
    '0x1F405',
    '0x1F406',
    '0x1F407',
    '0x1F408',
    '0x1F409',
    '0x1F40A',
    '0x1F40B',
    '0x1F40C',
    '0x1F40D',
    '0x1F40E',
    '0x1F40F',
    '0x1F410',
    '0x1F411',
    '0x1F412',
    '0x1F413',
    '0x1F414',
    '0x1F415',
    '0x1F416',
    '0x1F417',
    '0x1F418',
    '0x1F419',
    '0x1F41A',
    '0x1F41B',
    '0x1F41C',
    '0x1F41D',
    '0x1F41E',
    '0x1F41F',
    '0x1F420',
    '0x1F421',
    '0x1F422',
    '0x1F423',
    '0x1F424',
    '0x1F425',
    '0x1F426',
    '0x1F427',
    '0x1F428',
    '0x1F429',
    '0x1F42A',
    '0x1F42B',
    '0x1F42C',
    '0x1F42D',
    '0x1F42E',
    '0x1F42F',
    '0x1F430',
    '0x1F431',
    '0x1F432',
    '0x1F433',
    '0x1F434',
    '0x1F435',
    '0x1F436',
    '0x1F437',
    '0x1F438',
    '0x1F439',
    '0x1F43A',
    '0x1F43B',
    '0x1F43C',
    '0x1F43D',
    '0x1F43E',
    '0x1F43F',
    '0x1F440',
    '0x1F441',
    '0x1F442',
    '0x1F443',
    '0x1F444',
    '0x1F445',
    '0x1F446',
    '0x1F447',
    '0x1F448',
    '0x1F449',
    '0x1F44A',
    '0x1F44B',
    '0x1F44C',
    '0x1F44D',
    '0x1F44E',
    '0x1F44F',
    '0x1F450',
    '0x1F451',
    '0x1F452',
    '0x1F453',
    '0x1F454',
    '0x1F455',
    '0x1F456',
    '0x1F457',
    '0x1F458',
    '0x1F459',
    '0x1F45A',
    '0x1F45B',
    '0x1F45C',
    '0x1F45D',
    '0x1F45E',
    '0x1F45F',
    '0x1F460',
    '0x1F461',
    '0x1F462',
    '0x1F463',
    '0x1F464',
    '0x1F465',
    '0x1F466',
    '0x1F467',
    '0x1F468',
    '0x1F469',
    '0x1F46A',
    '0x1F46B',
    '0x1F46C',
    '0x1F46D',
    '0x1F46E',
    '0x1F46F',
    '0x1F470',
    '0x1F471',
    '0x1F472',
    '0x1F473',
    '0x1F474',
    '0x1F475',
    '0x1F476',
    '0x1F477',
    '0x1F478',
    '0x1F479',
    '0x1F47A',
    '0x1F47B',
    '0x1F47C',
    '0x1F47D',
    '0x1F47E',
    '0x1F47F',
    '0x1F480',
    '0x1F481',
    '0x1F482',
    '0x1F483',
    '0x1F484',
    '0x1F485',
    '0x1F486',
    '0x1F487',
    '0x1F488',
    '0x1F489',
    '0x1F48A',
    '0x1F48B',
    '0x1F48C',
    '0x1F48D',
    '0x1F48E',
    '0x1F48F',
    '0x1F490',
    '0x1F491',
    '0x1F492',
    '0x1F493',
    '0x1F494',
    '0x1F495',
    '0x1F496',
    '0x1F497',
    '0x1F498',
    '0x1F499',
    '0x1F49A',
    '0x1F49B',
    '0x1F49C',
    '0x1F49D',
    '0x1F49E',
    '0x1F49F',
    '0x1F4A0',
    '0x1F4A1',
    '0x1F4A2',
    '0x1F4A3',
    '0x1F4A4',
    '0x1F4A5',
    '0x1F4A6',
    '0x1F4A7',
    '0x1F4A8',
    '0x1F4A9',
    '0x1F4AA',
    '0x1F4AB',
    '0x1F4AC',
    '0x1F4AD',
    '0x1F4AE',
    '0x1F4AF',
    '0x1F4B0',
    '0x1F4B1',
    '0x1F4B2',
    '0x1F4B3',
    '0x1F4B4',
    '0x1F4B5',
    '0x1F4B6',
    '0x1F4B7',
    '0x1F4B8',
    '0x1F4B9',
    '0x1F4BA',
    '0x1F4BB',
    '0x1F4BC',
    '0x1F4BD',
    '0x1F4BE',
    '0x1F4BF',
    '0x1F4C0',
    '0x1F4C1',
    '0x1F4C2',
    '0x1F4C3',
    '0x1F4C4',
    '0x1F4C5',
    '0x1F4C6',
    '0x1F4C7',
    '0x1F4C8',
    '0x1F4C9',
    '0x1F4CA',
    '0x1F4CB',
    '0x1F4CC',
    '0x1F4CD',
    '0x1F4CE',
    '0x1F4CF',
    '0x1F4D0',
    '0x1F4D2',
    '0x1F4D3',
    '0x1F4D4',
    '0x1F4D5',
    '0x1F4D6',
    '0x1F4D7',
    '0x1F4D8',
    '0x1F4D9',
    '0x1F4DA',
    '0x1F4DB',
    '0x1F4DC',
    '0x1F4DD',
    '0x1F4DE',
    '0x1F4DF',
    '0x1F4E0',
    '0x1F4E1',
    '0x1F4E2',
    '0x1F4E3',
    '0x1F4E4',
    '0x1F4E5',
    '0x1F4E6',
    '0x1F4E7',
    '0x1F4E8',
    '0x1F4E9',
    '0x1F4EA',
    '0x1F4EB',
    '0x1F4EC',
    '0x1F4ED',
    '0x1F4EE',
    '0x1F4EF',
    '0x1F4F0',
    '0x1F4F1',
    '0x1F4F2',
    '0x1F4F3',
    '0x1F4F4',
    '0x1F4F5',
    '0x1F4F6',
    '0x1F4F7',
    '0x1F4F8',
    '0x1F4F9',
    '0x1F4FA',
    '0x1F4FB',
    '0x1F4FC',
    '0x1F4FD',
    '0x1F4FF',
    '0x1F500',
    '0x1F501',
    '0x1F502',
    '0x1F503',
    '0x1F504',
    '0x1F505',
    '0x1F506',
    '0x1F507',
    '0x1F508',
    '0x1F509',
    '0x1F50A',
    '0x1F50B',
    '0x1F50C',
    '0x1F50D',
    '0x1F50E',
    '0x1F50F',
    '0x1F510',
    '0x1F511',
    '0x1F512',
    '0x1F513',
    '0x1F514',
    '0x1F515',
    '0x1F516',
    '0x1F517',
    '0x1F518',
    '0x1F519',
    '0x1F51A',
    '0x1F51B',
    '0x1F51C',
    '0x1F51D',
    '0x1F51E',
    '0x1F51F',
    '0x1F520',
    '0x1F521',
    '0x1F522',
    '0x1F523',
    '0x1F524',
    '0x1F525',
    '0x1F526',
    '0x1F527',
    '0x1F528',
    '0x1F529',
    '0x1F52A',
    '0x1F52B',
    '0x1F52C',
    '0x1F52D',
    '0x1F52E',
    '0x1F52F',
    '0x1F530',
    '0x1F531',
    '0x1F532',
    '0x1F533',
    '0x1F534',
    '0x1F535',
    '0x1F536',
    '0x1F537',
    '0x1F538',
    '0x1F539',
    '0x1F53A',
    '0x1F53B',
    '0x1F53C',
    '0x1F53D',
    '0x1F549',
    '0x1F54A',
    '0x1F54B',
    '0x1F54C',
    '0x1F54D',
    '0x1F54E',
    '0x1F550',
    '0x1F551',
    '0x1F552',
    '0x1F553',
    '0x1F554',
    '0x1F555',
    '0x1F556',
    '0x1F557',
    '0x1F558',
    '0x1F559',
    '0x1F55A',
    '0x1F55B',
    '0x1F55C',
    '0x1F55D',
    '0x1F55E',
    '0x1F55F',
    '0x1F560',
    '0x1F561',
    '0x1F562',
    '0x1F563',
    '0x1F564',
    '0x1F565',
    '0x1F566',
    '0x1F567',
    '0x1F56F',
    '0x1F570',
    '0x1F573',
    '0x1F574',
    '0x1F575',
    '0x1F576',
    '0x1F577',
    '0x1F578',
    '0x1F579',
    '0x1F57A',
    '0x1F587',
    '0x1F58A',
    '0x1F58B',
    '0x1F58C',
    '0x1F58D',
    '0x1F590',
    '0x1F595',
    '0x1F596',
    '0x1F5A4',
    '0x1F5A5',
    '0x1F5A8',
    '0x1F5B1',
    '0x1F5B2',
    '0x1F5BC',
    '0x1F5C2',
    '0x1F5C3',
    '0x1F5C4',
    '0x1F5D1',
    '0x1F5D2',
    '0x1F5D3',
    '0x1F5DC',
    '0x1F5DD',
    '0x1F5DE',
    '0x1F5E1',
    '0x1F5E3',
    '0x1F5E8',
    '0x1F5EF',
    '0x1F5F3',
    '0x1F5FA',
    '0x1F5FB',
    '0x1F5FC',
    '0x1F5FD',
    '0x1F5FE',
    '0x1F5FF',
    '0x1F600',
    '0x1F601',
    '0x1F602',
    '0x1F603',
    '0x1F604',
    '0x1F605',
    '0x1F606',
    '0x1F607',
    '0x1F608',
    '0x1F609',
    '0x1F60A',
    '0x1F60B',
    '0x1F60C',
    '0x1F60D',
    '0x1F60E',
    '0x1F60F',
    '0x1F610',
    '0x1F611',
    '0x1F612',
    '0x1F613',
    '0x1F614',
    '0x1F615',
    '0x1F616',
    '0x1F617',
    '0x1F618',
    '0x1F619',
    '0x1F61A',
    '0x1F61B',
    '0x1F61C',
    '0x1F61D',
    '0x1F61E',
    '0x1F61F',
    '0x1F620',
    '0x1F621',
    '0x1F622',
    '0x1F623',
    '0x1F624',
    '0x1F625',
    '0x1F626',
    '0x1F627',
    '0x1F628',
    '0x1F629',
    '0x1F62A',
    '0x1F62B',
    '0x1F62C',
    '0x1F62D',
    '0x1F62E',
    '0x1F62F',
    '0x1F630',
    '0x1F631',
    '0x1F632',
    '0x1F633',
    '0x1F634',
    '0x1F635',
    '0x1F636',
    '0x1F637',
    '0x1F638',
    '0x1F639',
    '0x1F63A',
    '0x1F63B',
    '0x1F63C',
    '0x1F63D',
    '0x1F63E',
    '0x1F63F',
    '0x1F640',
    '0x1F641',
    '0x1F642',
    '0x1F643',
    '0x1F644',
    '0x1F645',
    '0x1F646',
    '0x1F647',
    '0x1F648',
    '0x1F649',
    '0x1F64A',
    '0x1F64C',
    '0x1F64D',
    '0x1F64E',
    '0x1F64F',
    '0x1F680',
    '0x1F681',
    '0x1F682',
    '0x1F683',
    '0x1F684',
    '0x1F685',
    '0x1F686',
    '0x1F687',
    '0x1F688',
    '0x1F689',
    '0x1F68A',
    '0x1F68B',
    '0x1F68C',
    '0x1F68D',
    '0x1F68E',
    '0x1F68F',
    '0x1F690',
    '0x1F691',
    '0x1F692',
    '0x1F693',
    '0x1F694',
    '0x1F695',
    '0x1F696',
    '0x1F697',
    '0x1F698',
    '0x1F699',
    '0x1F69A',
    '0x1F69B',
    '0x1F69C',
    '0x1F69D',
    '0x1F69E',
    '0x1F69F',
    '0x1F6A0',
    '0x1F6A1',
    '0x1F6A2',
    '0x1F6A3',
    '0x1F6A4',
    '0x1F6A5',
    '0x1F6A6',
    '0x1F6A7',
    '0x1F6A8',
    '0x1F6A9',
    '0x1F6AA',
    '0x1F6AB',
    '0x1F6AC',
    '0x1F6AD',
    '0x1F6AE',
    '0x1F6AF',
    '0x1F6B0',
    '0x1F6B1',
    '0x1F6B2',
    '0x1F6B3',
    '0x1F6B4',
    '0x1F6B5',
    '0x1F6B6',
    '0x1F6B7',
    '0x1F6B8',
    '0x1F6B9',
    '0x1F6BA',
    '0x1F6BB',
    '0x1F6BC',
    '0x1F6BD',
    '0x1F6BE',
    '0x1F6BF',
    '0x1F6C0',
    '0x1F6C1',
    '0x1F6C2',
    '0x1F6C3',
    '0x1F6C4',
    '0x1F6C5',
    '0x1F6CB',
    '0x1F6CC',
    '0x1F6CD',
    '0x1F6CE',
    '0x1F6CF',
    '0x1F6D0',
    '0x1F6D1',
    '0x1F6D2',
    '0x1F6E0',
    '0x1F6E1',
    '0x1F6E2',
    '0x1F6E3',
    '0x1F6E4',
    '0x1F6E5',
    '0x1F6E9',
    '0x1F6EB',
    '0x1F6EC',
    '0x1F6F0',
    '0x1F6F3',
    '0x1F6F4',
    '0x1F6F5',
    '0x1F6F6',
    '0x1F6F7',
    '0x1F6F8',
    '0x1F6F9',
    '0x1F910',
    '0x1F911',
    '0x1F912',
    '0x1F913',
    '0x1F914',
    '0x1F915',
    '0x1F916',
    '0x1F917',
    '0x1F918',
    '0x1F919',
    '0x1F91A',
    '0x1F91B',
    '0x1F91C',
    '0x1F91D',
    '0x1F91E',
    '0x1F91F',
    '0x1F920',
    '0x1F921',
    '0x1F922',
    '0x1F923',
    '0x1F924',
    '0x1F925',
    '0x1F926',
    '0x1F927',
    '0x1F928',
    '0x1F929',
    '0x1F92A',
    '0x1F92B',
    '0x1F92C',
    '0x1F92D',
    '0x1F92E',
    '0x1F92F',
    '0x1F930',
    '0x1F931',
    '0x1F932',
    '0x1F933',
    '0x1F934',
    '0x1F935',
    '0x1F936',
    '0x1F937',
    '0x1F938',
    '0x1F939',
    '0x1F93A',
    '0x1F93C',
    '0x1F93D',
    '0x1F93E',
    '0x1F940',
    '0x1F941',
    '0x1F942',
    '0x1F943',
    '0x1F944',
    '0x1F945',
    '0x1F947',
    '0x1F948',
    '0x1F949',
    '0x1F94A',
    '0x1F94B',
    '0x1F94C',
    '0x1F94D',
    '0x1F94E',
    '0x1F94F',
    '0x1F950',
    '0x1F951',
    '0x1F952',
    '0x1F953',
    '0x1F954',
    '0x1F955',
    '0x1F956',
    '0x1F957',
    '0x1F958',
    '0x1F959',
    '0x1F95A',
    '0x1F95B',
    '0x1F95C',
    '0x1F95D',
    '0x1F95E',
    '0x1F95F',
    '0x1F960',
    '0x1F961',
    '0x1F962',
    '0x1F963',
    '0x1F964',
    '0x1F965',
    '0x1F966',
    '0x1F967',
    '0x1F968',
    '0x1F969',
    '0x1F96A',
    '0x1F96B',
    '0x1F96C',
    '0x1F96D',
    '0x1F96E',
    '0x1F96F',
    '0x1F970',
    '0x1F973',
    '0x1F974',
    '0x1F975',
    '0x1F976',
    '0x1F97A',
    '0x1F97C',
    '0x1F97D',
    '0x1F97E',
    '0x1F97F',
    '0x1F980',
    '0x1F981',
    '0x1F982',
    '0x1F983',
    '0x1F984',
    '0x1F985',
    '0x1F986',
    '0x1F987',
    '0x1F988',
    '0x1F989',
    '0x1F98A',
    '0x1F98B',
    '0x1F98C',
    '0x1F98D',
    '0x1F98E',
    '0x1F98F',
    '0x1F990',
    '0x1F991',
    '0x1F992',
    '0x1F993',
    '0x1F994',
    '0x1F995',
    '0x1F996',
    '0x1F997',
    '0x1F998',
    '0x1F999',
    '0x1F99A',
    '0x1F99B',
    '0x1F99C',
    '0x1F99D',
    '0x1F99E',
    '0x1F99F',
    '0x1F9A0',
    '0x1F9A1',
    '0x1F9A2',
    '0x1F9B0',
    '0x1F9B1',
    '0x1F9B2',
    '0x1F9B3',
    '0x1F9B4',
    '0x1F9B5',
    '0x1F9B6',
    '0x1F9B7',
    '0x1F9B8',
    '0x1F9B9',
    '0x1F9C0',
    '0x1F9C1',
    '0x1F9C2',
    '0x1F9D0',
    '0x1F9D1',
    '0x1F9D2',
    '0x1F9D3',
    '0x1F9D4',
    '0x1F9D5',
];

},{}],7:[function(require,module,exports){
"use strict";
String.prototype.mb_split = function () {
    return Array.from(this.split('\u{200D}')[0].split(/[\ufe00-\ufe0f]/).join(''));
};
String.prototype.has_emoji = function () {
    /* tslint:disable-next-line:max-line-length */
    const regex = /\uD83C\uDFF4(?:\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74)\uDB40\uDC7F|\u200D\u2620\uFE0F)|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3]))|\uD83D\uDC69\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83D\uDC69\u200D[\u2695\u2696\u2708])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC68(?:\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])\uFE0F/g;
    return regex.test(this.toString());
};
String.prototype.encode = function () {
    return this.has_emoji() ? encodeURIComponent(this.toString()) : this.toString();
};
String.prototype.decode = function () {
    try {
        return decodeURIComponent(this.toString());
    }
    catch (e) {
        // catch | URIError: URI malformed (Chrome) | URIError: malformed URI sequence (Firefox)
        return this.toString();
    }
};

},{}],"ecoji-js":[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const Ecoji_1 = __importDefault(require("./src/Ecoji"));
const emojis_1 = __importDefault(require("./src/emojis"));
/* tslint:disable-next-line:no-unused-expression */
require("./src/ext");
const Mapping_1 = __importDefault(require("./src/Mapping"));
module.exports = new Ecoji_1.default(new Mapping_1.default(emojis_1.default));

},{"./src/Ecoji":4,"./src/Mapping":5,"./src/emojis":6,"./src/ext":7}]},{},[]);
