const bigInt = require('big-integer');

function textToNumber(text) {
    let result = bigInt(0);
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        result = result.multiply(65536).add(code);
    }
    return result;
}

function numberToText(num) {
    let result = "";
    let n = bigInt(num);
    while (n.gt(0)) {
        const code = n.mod(65536).toJSNumber();
        if (code === 0) break;
        result = String.fromCharCode(code) + result;
        n = n.divide(65536);
    }
    return result;
}

module.exports = { textToNumber, numberToText };