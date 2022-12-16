//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const dbDgos = require("./../db/dbDgos.js");
const logger = require('./../utils/winlog.js');

//
module.exports.initDatabase = async () => {
    await dbDgos.initDatabaseDGOS();
}
