//
const define = require('./../../config/define.js');

//
module.exports.inet_ntoa = function(num){
    let nbuffer = new ArrayBuffer(4);
    let ndv = new DataView(nbuffer);
    ndv.setUint32(0, num);

    let a = new Array();
    for (var i = 0; i < 4; i++) {
        a[i] = ndv.getUint8(i);
    }
    return a.join('.');
}

module.exports.inet_aton = async function(str) {
    let nip = 0;
    await str.split('.').forEach((octet) => {
        nip <<= 8;
        nip+=parseInt(octet);
    });
    return (nip >>> 0);
}
