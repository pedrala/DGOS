//
const mysql = require("mysql2/promise");
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

const maria_conn_pool = mysql.createPool(config.MARIA_CONFIG);

const dbConfig = config.MARIA_CONFIG;
module.exports.dbConfig = dbConfig;

//
var connNum = 0;
module.exports.getConn = async () => {
    try {
        connNum += 1;
        // logger.warn("getConn connNum " + connNum + " invalid");
        return await maria_conn_pool.getConnection(async conn => conn);
    } catch (error) {
        // debug.error(error);
        logger.info("getConn Func - Error");
    }
}

module.exports.releaseConn = async (conn) => {
    try {
        connNum -= 1;
        // logger.warn("releaseConn connNum " + connNum + " error");
        await conn.release();
    } catch (error) {
        // debug.error(error);
        logger.error("Error - releaseConn Func");
    }
}

module.exports.exeQueryParam = async (conn, queryV, param) => {
    return await conn.query(queryV, param);
}

module.exports.exeQuery = async (conn, queryV) => {
    return await conn.query(queryV);
}

//////////////////////////////////////////////////////////////////////////////////////
//
module.exports.queryPre = async (queryV, param) => {
    // logger.debug("func : queryPre");

    const conn = await this.getConn();
    // logger.debug("queryV : " + queryV);
    // logger.debug("param : " + param);
    [query_result] = await this.exeQueryParam(conn, queryV, param);

    await this.releaseConn(conn);

    // logger.debug("query_result length : " + query_result.length);
    // for(var i = 0; i < query_result.length; i++)
    // {
    //     for ( var keyNm in query_result[i]) {
    //         logger.debug("key : " + keyNm + ", value : " + query_result[i][keyNm]);
    //     }
    // }

    // logger.debug("query_result : " + JSON.stringify(query_result));

    return query_result;
}

module.exports.query = async (queryV) => {
    // logger.debug("func : query");

    const conn = await this.getConn();
    // logger.debug("queryV : " + queryV);
    [query_result] = await this.exeQuery(conn, queryV);

    await this.releaseConn(conn);
    

    // logger.debug("query_result length : " + query_result.length);
    // for(var i = 0; i < query_result.length; i++)
    // {
    //     for ( var keyNm in query_result[i]) {
    //         logger.debug("key : " + keyNm + ", value : " + query_result[i][keyNm]);
    //     }
    // }

    // logger.debug("query_result : " + JSON.stringify(query_result));

    return query_result;
}

module.exports.actQuery = async (queryV) => {
    // logger.debug("actQuery queryV : " + queryV);
    let query_result =  await this.query(queryV);

    // logger.info("actQuery result : " + JSON.stringify(query_result));
}

module.exports.truncate = (dbName) => {
    let queryV = ``;
    try{
        queryV = `TRUNCATE ${dbName}`
    } catch (err) {
        // debug.error(err);
        logger.error("getConn Func");
    }

    return queryV;
}

//////////////////////////////////////////////////////////////////////////////////////
// update json data
// parameter: data to store(key-value, key-value), account_num
module.exports.jsonQuery = async (data, account_num) => {
    logger.debug("jsonQuery - data to store : " + data);
    logger.debug("where : " + account_num);
    let queryV = ``;
    try {
        queryV = `UPDATE user_apikey SET api_key = JSON_OBJECT('${data[0]}','${data[1]}'), call_count = JSON_OBJECT('${data[2]}','${data[3]}') WHERE account_num = ${account_num}`;
        this.query(queryV);
    } catch (err) {
        logger.error("jsonQuery failed");
    }
}

// update existing json data
// parameter: data to store(key-value, key-value), account_num
module.exports.jsonUpdate = async (data, account_num) => {
    logger.debug("jsonUpdate - data to store : " + data);
    logger.debug("where : " + account_num);
    let queryV = ``;
    try {
        queryV = `UPDATE user_apikey SET api_key = JSON_INSERT(api_key, '$.${data[0]}','${data[1]}'), call_count = JSON_INSERT(call_count, '$.${data[2]}','${data[3]}') WHERE account_num = ${account_num}`;
        this.query(queryV);
    } catch (err) {
        logger.error("jsonUpdate failed");
    }    
}

// parameter: key, account_num
// select one specific value of json data : json_value
module.exports.jsonCheck = async (column, key, account_num) => {
    logger.debug("key to check : " + key);
    let queryV = ``;
    try {
        queryV = `SELECT JSON_VALUE(${column}, '$.${key}') AS total_count FROM user_apikey WHERE account_num = ${account_num}`;
        let query_result = await this.query(queryV);
        logger.debug("query_result ---> " + query_result[0].total_count);
        return query_result[0].total_count;
    } catch (err) {
        logger.error("jsonCheck failed");
    }
}

// parameter: key, value to update, account_num
// update one specific value of json data : json_replace
module.exports.jsonCount = async (key, value, account_num) => {
    logger.debug("data to update : " + value);
    logger.debug("where : " + account_num + " & call_count key : " + key);
    let queryV = ``;
    try {
        queryV = `UPDATE user_apikey SET call_count = JSON_REPLACE(call_count, '$.${key}', ${value}) WHERE account_num = ${account_num}`;
        let query_result = await this.query(queryV);
    } catch (err) {
        logger.error("jsonCount failed");
    }
}


//////////////////////////////////////////////////////////////////////////////////////
//
const tableAppendix = {
    "tableName" : `myTableName`,
    "appendix" : `myAppendix`,
    "shard_exp" : `_shard`,
    "innoDB" : `ENGINE=InnoDB`,
    "spider" : `ENGINE=spider COMMENT='wrapper "mysql", table`,
    "partition" : `PARTITION BY KEY (subnet_id)`,
}
module.exports.tableAppendix = tableAppendix;