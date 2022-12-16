//
const config = require('../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const logger = require('./../utils/winlog.js');

//
const createDbNames = {
    "dgos" : "dgos",
}

module.exports.createTableNames = {
    dgosQuerys : [
        //
        "node_info",
    ]
}

const createTableFields = {
    dgosQuerys : [
        // node_info
        "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`start_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Node Start Time', "
        + "`account_id` text BINARY DEFAULT NULL,"
        + "`account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Account Number', "
        // + "`owner_pk` text NOT NULL COMMENT 'Owner Public Key', "
        + "`role` tinyint(3) unsigned NOT NULL, "
        + "`sn_hash` text NOT NULL, "
        + "`node_price` text DEFAULT NULL, "
        + "KEY `start_tm` (`start_tm`) USING BTREE, "
        + "KEY `account_num` (`account_num`) USING BTREE, "
        + "KEY `role` (`role`) USING BTREE, "
        + "PRIMARY KEY (`idx`, `account_num`, `subnet_id`) USING BTREE",
    ]
}

module.exports.createTables = {
    dgosQuerys : [
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.dgosQuerys[0]
        + `) ${dbUtil.tableAppendix.appendix}`,
    ]
}

module.exports.querys = {
    dgos : {
        // dgos database
        createDGOS : "CREATE DATABASE IF NOT EXISTS `dgos`",
        dropDGOS : "DROP DATABASE IF EXISTS `dgos`",
        useDGOS : "USE `dgos`",

        //
        truncateDgosNodeInfo : dbUtil.truncate("`dgos`." + `${this.createTableNames.dgosQuerys[0]}`),
        
        //
        node_info : {
            //
            insertNodeInfo: "INSERT IGNORE INTO dgos.node_info(subnet_id, start_tm, account_id, account_num, role, sn_hash, node_price) VALUES(?, ?, ?, ?, ?, ?, ?)", 

            //
            selectNodeInfoByAccountId : "SELECT * FROM dgos.node_info WHERE account_id = ?",

            //
            selectNodeInfo : "SELECT * FROM dgos.node_info",

            //
            //selectNodeInfoCnt : "SELECT COUNT(*) AS NODECNT FROM dgos.node_info"
        }, 
    },
};

//
module.exports.truncateDgosTestDB = async () => {
    const conn = await dbUtil.getConn();

    let sql;

    sql = this.querys.dgos.truncateDgosNodeInfo;
    await conn.query(sql);

    await dbUtil.releaseConn(conn);
}

//
module.exports.initDatabaseDGOS = async () => {
    let ret;
    const conn = await dbUtil.getConn();

    try {
        //
        if(config.DB_TEST_MODE_DROP) {
            logger.debug(`querys.dgos.dropIS : ${this.querys.dgos.dropDGOS}`);
            await conn.query(this.querys.dgos.dropDGOS);
        }

        //
        logger.debug(`querys.dgos.createDGOS : ${this.querys.dgos.createDGOS}`);
        await conn.query(this.querys.dgos.createDGOS);

        //
        let sql = this.querys.dgos.useDGOS;
        await conn.query(sql);

        //
        await util.asyncForEach(this.createTables.dgosQuerys, async(element, index) => {
            // logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, this.createTableNames.dgosQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("dgosQuerys : " + element);
            await conn.query(element);
        });

        if(config.DB_TEST_MODE) {
            await this.truncateIsTestDB();
        }

        ret = { res : true };
        logger.info(`Database Init - ${createDbNames.dgos}`);
    } catch (err) {
        // debug.error(err);
        logger.error(`Database Error - ${JSON.stringify(err)}`);
        ret = { res : false, reason : JSON.stringify(err)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}
