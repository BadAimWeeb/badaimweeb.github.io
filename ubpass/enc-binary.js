/*
(Not) CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2019 by Jeff Mott & UIRI. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var C_enc = C.enc;

    /**
     * Binary encoding strategy.
     */
    var Binary = C_enc.Binary = {
		/**
         * Converts a word array to a binary string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} An binary string.
         *
         * @static
         *
         * @example
         *
         *     var binaryString = CryptoJS.enc.Binary.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = '01';

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var binaryChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                binaryChars.push((bite >>> 4).toString(2));
                binaryChars.push((bite & 0x0f).toString(2));
            }

            return binaryChars.join('');
        },

        /**
         * Converts a binary string to a word array.
         *
         * @param {string} binaryStr A binary string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Binary.parse(binaryStr);
         */
        parse: function (binaryStr) {
			// Shortcut
            var binaryStrLength = binaryStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 8) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 2) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, binaryStrLength / 8);
        }
    };
	
}());