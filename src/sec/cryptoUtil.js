//
const crypto = require('crypto');
const { createECDH, ECDH } = require("crypto");
const fs = require('fs');
const EdDSA = require('elliptic').eddsa;
const pemreader = require('crypto-key-composer');
const cryptoSsl = require("./../../../../addon/crypto-ssl");
const verifier = require("./../../../../addon/crypto-ssl");
// const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

//////////////////////////////////////////////////
//
module.exports.decKeyNoFile = (keyBin, keySeed) => {
    let dec;

    if (keyBin.includes("BEGIN") && keyBin.includes("END") && keyBin.includes("KEY"))
    {
        logger.debug("It is an decrypted file");

        dec = keyBin;
    }
    else
    {
        logger.debug("It is an encrypted file 1");

        if (keySeed === undefined)
        {
            logger.error("keySeed is not defined.");
            return dec;
        }

        //
        const encBinary = Buffer.from(keyBin, 'ascii');
        let encBinaryHexStr = encBinary.toString('hex');
        logger.debug(encBinaryHexStr);

        dec = cryptoSsl.aesDecBinary(encBinaryHexStr, keySeed, keySeed.length);
    }

    return dec;
}

//
module.exports.decKey = (keyPath, keySeed) => {
    let dec;

    if (keyPath.includes("fin"))
    {
        logger.debug("It is an encrypted file");

        if (keySeed === undefined)
        {
            logger.error("keySeed is not defined.");
            return dec;
        }

        dec = cryptoSsl.aesDecFile(keyPath, keySeed, keySeed.length);
    }
    else
    {
        logger.debug("It is an decrypted file");

        dec = fs.readFileSync(keyPath);
    }

    return dec;
}

module.exports.readPubkeyPem = (path, seed) => {
    let decPubKey = this.decKey(path, seed);

    let pemRead = pemreader.decomposePublicKey(decPubKey);
    return pemRead;
}

module.exports.readPrikeyPem = (path, seed) => {
    let decPriKey = this.decKey(path, seed);

    let pemRead = pemreader.decomposePrivateKey(decPriKey);
    return pemRead;
}

module.exports.getPubkeyNoFile = async (pubkeyRaw) => {
    //
    // let pubkey_path = pubkeyPath;

    //
    let pemRead = pemreader.decomposePublicKey(pubkeyRaw);

    //
    // let publicKey = util.bytesToBuffer(pemRead.keyData.bytes).toString('hex');

    // return publicKey;

    // if (pubkey_path.includes("ed")) {
    let pubkey;

    pubkey = util.bytesToBuffer(pemRead.keyData.bytes);
    return pubkey.toString('hex');

    // }
    // else {
    //     let ec_point_x;
    //     let ec_point_y;

    //     ec_point_x = util.bytesToBuffer(pemRead.keyData.x).toString('hex');
    //     ec_point_y = util.bytesToBuffer(pemRead.keyData.y).toString('hex');

    //     const uncompressedpubkey = define.SEC_DEFINE.KEY_DELIMITER.SECP256_UNCOMPRESSED_DELIMITER + ec_point_x + ec_point_y;
    //     const pubkey = ECDH.convertKey(uncompressedpubkey,
    //         define.SEC_DEFINE.CURVE_NAMES.ECDH_SECP256R1_CURVE_NAME,
    //         "hex",
    //         "hex",
    //         define.SEC_DEFINE.CONVERT_KEY.COMPRESSED);

    //     return await pubkey;
    // }
    // return 'abcdef1234567890abcdef1234567890abcdef1234567890'
}

module.exports.getPubkey = (pubkeyPath) => {
    //
    let pubkey_path = pubkeyPath;

    //
    let pemRead = this.readPubkeyPem(pubkey_path);

    //
    // let publicKey = util.bytesToBuffer(pemRead.keyData.bytes).toString('hex');

    // return publicKey;

    if(pubkey_path.includes("ed")) 
    {
        let pubkey;

        pubkey = util.bytesToBuffer(pemRead.keyData.bytes);

        return (define.CONTRACT_DEFINE.ED_PUB_IDX + pubkey.toString('hex'));
    }
    else
    {
        let ec_point_x;
        let ec_point_y;

        ec_point_x = util.bytesToBuffer(pemRead.keyData.x).toString('hex');
        ec_point_y = util.bytesToBuffer(pemRead.keyData.y).toString('hex');
        
        const uncompressedpubkey = define.SEC_DEFINE.KEY_DELIMITER.SECP256_UNCOMPRESSED_DELIMITER + ec_point_x + ec_point_y;
        const pubkey = ECDH.convertKey(uncompressedpubkey,
                                                define.SEC_DEFINE.CURVE_NAMES.ECDH_SECP256R1_CURVE_NAME,
                                                "hex",
                                                "hex",
                                                define.SEC_DEFINE.CONVERT_KEY.COMPRESSED);

        return pubkey;
    }
}

module.exports.convertPubKey = (pubkey, curveName, delimiter) => {
    try {
        return ECDH.convertKey(pubkey, curveName, "hex", "hex", delimiter);
    } catch (err) {
        console.log(err);
        return false;
    }
}

//////////////////////////////////////////////////
// Get sha256 Hash
module.exports.genSha256Str = (msgBuf) => {
    const sha256Result = crypto.createHash(define.SEC_DEFINE.HASH_ALGO);
    sha256Result.update(msgBuf);
    return sha256Result.digest(define.SEC_DEFINE.DIGEST.HEX);
}

//////////////////////////////////////////////////
//
module.exports.eddsaVerifyHex = (inputData, signature, pubkeyHex) => {
    //
    let transferHash = cryptoSsl.genSha256Hex(inputData);
    logger.debug("transferHash : " + transferHash);

    //
    let ed = new EdDSA(define.SEC_DEFINE.CURVE_NAMES.EDDSA_CURVE_NAME);
    let pubKey = ed.keyFromPublic(pubkeyHex, "hex");

    let verifyRet = pubKey.verify(transferHash, signature);
    logger.debug("verifyRet : " + verifyRet);

    return verifyRet;
}

module.exports.eddsaSignHex = (inputData, prikeyHex) => {
    //
    let transferHash = cryptoSsl.genSha256Hex(inputData);
    logger.debug("transferHash : " + transferHash);

    //
    let ed = new EdDSA(define.SEC_DEFINE.CURVE_NAMES.EDDSA_CURVE_NAME);
    let priKey = ed.keyFromSecret(prikeyHex);

    //
    let signature = priKey.sign(transferHash).toHex();
    logger.debug("signature : " + signature);

    return signature;
}

module.exports.genSignNoFile = (contractJson, seed, prikey) => {
    const mergedBuffer = contractUtil.signBufferGenerator(contractJson);

    let inputData = cryptoSsl.genSha256Str(mergedBuffer);
    // let inputData = this.genSha256Str(mergedBuffer);
    logger.debug("inputData : " + inputData);

    //
    let decPrikey = this.decKeyNoFile(prikey, seed);
    let pemRead = pemreader.decomposePrivateKey(decPrikey);

    //
    let prikeyBuf = util.bytesToBuffer(pemRead.keyData.seed);
    let prikeyHex = prikeyBuf.toString('hex');

    //
    let signature = this.eddsaSignHex(inputData, prikeyHex);

    // let signature = 'ABCDEF';

    //
    ///////////////////////////////////////////////////////////
    // let pubkeyHex = this.getMyPubkey();

    // let verRet = cryptoSsl.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet : " + verRet);

    // let verRet2 = this.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet2 : " + verRet2);
    ///////////////////////////////////////////////////////////

    return signature;
}

module.exports.genSign = (contractJson, seed, prikeyPath) => {
    const mergedBuffer = contractUtil.signBufferGenerator(contractJson);
    // console.log("mergedBuffer : " + mergedBuffer);

    let inputData = cryptoSsl.genSha256Str(mergedBuffer);
    logger.debug("inputData : " + inputData);

    //
    let prikey_path = prikeyPath;
    // logger.debug("seed : " + seed);
    // logger.debug("prikey_path : " + prikey_path);
    let decPrikey = this.decKey(prikey_path, seed);
    let pemRead = pemreader.decomposePrivateKey(decPrikey);

    //
    let prikeyBuf = util.bytesToBuffer(pemRead.keyData.seed);
    let prikeyHex = prikeyBuf.toString('hex');
    // logger.debug("prikeyHex : " + prikeyHex);

    //
    let signature = this.eddsaSignHex(inputData, prikeyHex);

    //
    ///////////////////////////////////////////////////////////
    // let pubkeyHex = await this.getMyPubkey();

    // let verRet = cryptoSsl.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet : " + verRet);

    // let verRet2 = this.eddsaVerifyHex(inputData, signature, pubkeyHex);
    // logger.debug("verRet2 : " + verRet2);
    ///////////////////////////////////////////////////////////

    return signature;
}

module.exports.verifySign = (pubkeyHex, contractJson) => {
    // Owner Public Key
    //
    if (pubkeyHex.length !== define.SEC_DEFINE.PUBLIC_KEY_LEN)
    {
        return false;
    }

    //
    const mergedBuffer = contractUtil.signBufferGenerator(contractJson);

    let inputData = cryptoSsl.genSha256Str(mergedBuffer);
    // logger.debug("verifySign - inputData : " + inputData);

    //
    var verifyRet;

    if (pubkeyHex.slice(define.SEC_DEFINE.KEY_DELIMITER.START_INDEX, define.SEC_DEFINE.KEY_DELIMITER.DELIMITER_LEN) 
                        === define.SEC_DEFINE.KEY_DELIMITER.ED25519_DELIMITER)
    {
        let realPubkeyHex = pubkeyHex.slice(define.SEC_DEFINE.KEY_DELIMITER.DELIMITER_LEN);
        // logger.debug("verifySign - realPubkeyHex : " + realPubkeyHex);
        // logger.debug("verifySign - signature : " + contractJson.sig);
        verifyRet = verifier.eddsaVerifyHex(inputData, contractJson.sig, realPubkeyHex);
    }
    else
    {
        var sigR = contractJson.sig.slice(define.SEC_DEFINE.SIG.R_START_INDEX, define.SEC_DEFINE.SIG.R_LEN);
        var sigS = contractJson.sig.slice(define.SEC_DEFINE.SIG.S_START_INDEX, define.SEC_DEFINE.SIG.S_LEN);

        verifyRet = verifier.ecdsaR1VerifyHex(inputData, sigR, sigS, pubkeyHex);
        if (verifyRet === false)
        {
            verifyRet = verifier.EcdsaK1Verify(inputData, sigR, sigS, pubkeyHex);
        }
    }

    return verifyRet;
}

///////////
String.prototype.getBytes = function () {
    var bytes = [];
    for (var i = 0; i < this.length; ++i) {
      bytes.push(this.charCodeAt(i));
    }
    return bytes;
};
  
module.exports.genEdKey = () => {
    var m="hello";

    //   var EdDSA = require('elliptic').eddsa;

    var ec = new EdDSA('ed25519');

    var key = ec.genKeyPair();
    var publicKey = key.getPublic(false);

    console.log("Message:",m);
    console.log("\nPrivate key:",key);
    console.log("\nPublic key:",publicKey);

    var msgHash = m.getBytes();

    var signature = key.sign(msgHash);

    console.log("\nSignature:",signature);
    // Export DER encoded signature in Array
    var derSign = signature.toDER();

    console.log(derSign);

    // Verify signature
    console.log("Signature verified:",key.verify(msgHash, derSign));
}

//
module.exports.contentsEnc = (xPrikeyFile, xPubkey, plaintext) => {
    //
    let plaintextHexStr = Buffer.from(plaintext, 'utf-8').toString('hex');
    // console.log("plaintextHex : " + plaintextHex);

    //
    let encMsg = cryptoSsl.x25519MixEnc(xPrikeyFile, xPubkey, plaintextHexStr, plaintextHexStr.length);

    return (encMsg);
}

module.exports.contentsDec = (xPrikeyFile, xPubkey, encMsg) => {
    // console.log("encMsg : " + encMsg);

    let encMsgHexStr = Buffer.from(encMsg, 'utf-8').toString('hex');

    console.log("encMsgHexStr.length : " + encMsgHexStr.length);
    console.log("encMsgHexStr : " + encMsgHexStr);

    //
    let plaintextHex = cryptoSsl.x25519MixDec(xPrikeyFile, xPubkey, encMsgHexStr, encMsgHexStr.length);
    // console.log("plaintextHex : " + plaintextHex);

    let plaintext = Buffer.from(plaintextHex, 'hex');

    return (plaintext);
}
