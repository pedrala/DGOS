//
const fs = require('fs');
const os = require('os');

//
const cryptoSsl = require('./../../../../addon/crypto-ssl');

//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const base58 = require('./../utils/base58.js');
const cryptoUtil = require('./../sec/cryptoUtil.js');
const encrypto = require('./../sec/encrypto.js');

const dbDgosHandler = require("./../db/dbDgosHandler.js");

//
const ecoReward = require("./../eco/ecoReward.js");
const ecoSupply = require("./../eco/ecoSupply.js");
const ecoUtil = require("./../eco/ecoUtil.js");

//
const txDgos = require('./../tx/txDgos.js');
const txNode = require('./../tx/txNode.js');

//
const cryptoApi = require('./../sec/cryptoApi.js');

//
const webApi = require("./../net/webApi.js");

const timer = require("./../utils/timer.js");
const logger = require('./../utils/winlog.js');

const crypto = require('crypto');

const dbUtil = require('./../db/dbUtil.js');

//
module.exports.schSecretKey = "38df3a8e044d47e891a51f539633a392"
module.exports.schApiKey = "a2310fb0bb92478a93d0608e2507955f";
module.exports.schVer = "V1.0.0";
module.exports.schSymbol = "node";

//
module.exports.schLastDay = "20310331";

module.exports.genSig = async (apiKey,ts, secretKey) => {
    //
    let sigData = "apiKey=" + apiKey + "&timestamp=" + ts + "&version=" + this.schVer;
    logger.debug("sigData : " + sigData);

    let sig = cryptoApi.generateSignature(secretKey, sigData);
    logger.debug('sig : ' + sig);

    return (sig);
}

module.exports.ts2Day = (ts) => {
    let myDate = util.timestamp2Date(ts);
    logger.debug("myDate : " + myDate);

    //
    let myDateYear = myDate.getFullYear();
    let myDateMonth = ('0' + (myDate.getMonth()+1)).slice(-2);
    let myDateDay = ('0' + myDate.getDate()).slice(-2);
    // let myDateHour = ('0' + myDate.getHours()).slice(-2);
    // let myDateMin = ('0' + myDate.getMinutes()).slice(-2);
    // let myDateSec = ('0' + myDate.getSeconds()).slice(-2);
    // let myDateMs = myDate.getMilliseconds();

    //
    let schDay = myDateYear + myDateMonth + myDateDay;
    logger.debug("schDay: "+ schDay);

    return (schDay);
}

module.exports.ts2Date = (ts) => {
    let myDate = util.timestamp2Date(ts);
    logger.debug("myDate : " + myDate);

    //
    let myDateYear = myDate.getFullYear();
    let myDateMonth = ('0' + (myDate.getMonth()+1)).slice(-2);
    let myDateDay = ('0' + myDate.getDate()).slice(-2);
    let myDateHour = ('0' + myDate.getHours()).slice(-2);
    let myDateMin = ('0' + myDate.getMinutes()).slice(-2);
    let myDateSec = ('0' + myDate.getSeconds()).slice(-2);
    let myDateMs = myDate.getMilliseconds();

    //
    let schDate = myDateYear + "-" + myDateMonth + "-" + myDateDay + " " + myDateHour + ":" + myDateMin + ":" + myDateSec + "."+ myDateMs;
    logger.debug("schDate: "+ schDate);

    return (schDate);
}

//
module.exports.txNodeRegReq = async (nodeSN, nodePrice, nodeMaxReward, startTs, walletName) => {
    //
    let apiRoutePath  = '/v1/node/insert';

    //
    let curTs = Date.now();

    let schCurTs = this.ts2Date(curTs);
    logger.debug("schCurTs: "+ schCurTs);
    
    //
    let sig = await this.genSig(this.schApiKey, schCurTs, this.schSecretKey);

    let reqParam = {
        apiKey : this.schApiKey,
        timestamp : schCurTs,
        version : this.schVer,
        signature : sig, 
        symbol : this.schSymbol,
        serial : nodeSN, 
        price : nodePrice, 
        maxp : nodeMaxReward, 
        reward : "0", 
        startday : this.ts2Day(startTs), 
        lastday : this.schLastDay, 
        addr : walletName
    };

    let postData = JSON.stringify(reqParam);

    logger.debug("txNodeRegReq : " + postData);

    //
    let apiRes = await webApi.APICallProc(apiRoutePath, config.SCH_CONFIG, webApi.WEBAPI_DEFINE.METHOD.POST, postData);

    logger.debug("apiRes : " + JSON.stringify(apiRes));
}

//
module.exports.txNodeTxReq = async (fromWalletName, toWalletName, sendAmount) => {
    //
    let apiRoutePath  = '/v1/node/transfer';

    //
    let curTs = Date.now();

    let schCurTs = this.ts2Date(curTs);
    logger.debug("schCurTs: "+ schCurTs);
    
    //
    let sig = await this.genSig(this.schApiKey, schCurTs, this.schSecretKey);

    let reqParam = {
        apiKey : this.schApiKey,
        timestamp : schCurTs,
        version : this.schVer,
        signature : sig, 
        symbol : this.schSymbol,
        froma : fromWalletName, 
        toa : toWalletName, 
        amount : sendAmount
    };

    let postData = JSON.stringify(reqParam);

    logger.debug("txNodeTxReq : " + postData);

    //
    let apiRes = await webApi.APICallProc(apiRoutePath, config.SCH_CONFIG, webApi.WEBAPI_DEFINE.METHOD.POST, postData);

    logger.debug("apiRes : " + JSON.stringify(apiRes));
}

//
module.exports.txNodeSelectReq = async (walletName) => {
    //
    let apiRoutePath  = '/v1/node/select';

    //
    let curTs = Date.now();

    let schCurTs = this.ts2Date(curTs);
    logger.debug("schCurTs: "+ schCurTs);
    
    //
    let sig = await this.genSig(this.schApiKey, schCurTs, this.schSecretKey);

    let reqParam = {
        apiKey : this.schApiKey,
        timestamp : schCurTs,
        version : this.schVer,
        signature : sig, 
        symbol : this.schSymbol,
        addr : walletName
    };

    let postData = JSON.stringify(reqParam);

    logger.debug("txNodeSelectReq : " + postData);

    //
    let apiRes = await webApi.APICallProc(apiRoutePath, config.SCH_CONFIG, webApi.WEBAPI_DEFINE.METHOD.POST, postData);

    logger.debug("apiRes : " + JSON.stringify(apiRes));
}
