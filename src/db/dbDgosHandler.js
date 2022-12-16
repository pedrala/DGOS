//
const config = require('../../config/config.js');
const define = require('../../config/define.js');
const dbUtil = require('./dbUtil.js');
const dbDgos = require('./dbDgos.js');
const util = require('../utils/commonUtil.js');
const logger = require('../utils/winlog.js');

//
////////////////////////////////////////////////////////////
// Add node info on DB

module.exports.addNodeInfo = async (accountId, accountNum, ownerPk, role) => {
    await dbUtil.queryPre(dbDgos.querys.dgos.node_info.insertNodeInfo, [util.hexStrToInt(define.P2P_DEFINE.P2P_SUBNET_ID_DGOS), accountId, accountNum, ownerPk, role]);
};


//get nodeInfo
module.exports.getNodeInfoByAccountId = async (accountId) => {
    let nodeInfo = await dbUtil.queryPre(dbDgos.querys.dgos.node_info.selectNodeInfoByAccountId, [accountId]);

    return nodeInfo;
};

//get nodeInfo
module.exports.getNodeInfo = async () => {
    let nodeInfo = await dbUtil.query(dbDgos.querys.dgos.node_info.selectNodeInfo);
   // logger.info("query_result:"+JSON.stringify(nodeInfo));
    return nodeInfo;
};