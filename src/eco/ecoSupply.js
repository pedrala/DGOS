// //
// const fs = require('fs');
// const os = require('os');

const cryptoSsl = require('./../../../../addon/crypto-ssl');
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const base58 = require('./../utils/base58.js');
const cryptoUtil = require('./../sec/cryptoUtil.js');
const encrypto = require('./../sec/encrypto.js');
const dbDgosHandler = require("./../db/dbDgosHandler.js");
const webApi = require("./../net/webApi.js");
const timer = require("./../utils/timer.js");
const logger = require('./../utils/winlog.js');
const crypto = require('crypto');
const dbUtil = require('./../db/dbUtil.js');
const ecoUtil = require("./../eco/ecoUtil.js");

//calculate Supply Amount by inputting (node_num: Node Number, years: Year Round )
module.exports.ecoSupplyYear = (node_num, years) => {
    let supply = cryptoSsl.ecoSupplyTotalYear(node_num, years);
    logger.debug("node_num : " + node_num + ", years : " + years + ", supply : " + supply);

    return (supply);
}

module.exports.ecoSupplyHours = (node_num) => {
    let supply =  (this.ecoSupplyYear(node_num, ecoUtil.ecoCountYearsForReward())) / 365 / 4 ;
    logger.debug("node_num : " + node_num + ", hours : 6" + ", supply : " + supply);

    return (supply);
}
