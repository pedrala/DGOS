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

//calculate year Reward Amount by inputting (node_num: Node Number, years: Year Round )
module.exports.ecoRewardYear = (node_num, years) => {
    let reward = cryptoSsl.ecoRewardNodeYear(node_num, years);
    logger.debug("node_num : " + node_num + ", years : " + years + ", reward : " + reward);

    return (reward);
}

module.exports.ecoRewardDays = (node_num, days) => {
    //ecoRewardYear(nodeNum, 4) / 365) * 120(1년주기만기이후~ 오늘까지)
    let reward =  (this.ecoRewardYear(node_num, ecoUtil.ecoCountYearsForReward()) / 365) * days ;
    logger.debug("node_num : " + node_num + ", days : " + days + ", reward : " + reward);

    return (reward);
}

module.exports.ecoRewardHours = (node_num) => {
    let reward = (this.ecoRewardYear(node_num, ecoUtil.ecoCountYearsForReward()) / 365 ) / 4;
    //logger.debug("node_num : " + node_num + ", hours : 6" + ", reward : " + reward);

    return (reward);
}

