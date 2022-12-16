//
const fs = require('fs');
const os = require('os');

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
const http = require('http');
const dbUtil = require('./../db/dbUtil.js');
const ecoReward = require("./../eco/ecoReward.js");
const ecoUtil = require("./../eco/ecoUtil.js");
//fixed input for sending token
const keyPathDN = './wallet/finld/';
const keyPwDN = 'finlDgos_1357!@$*';

///////////////////////////////////////////////////////

let nodeAccArr = new Array();
// nodeAccArr = [
//     //ISAG
//     'HESTIA', 'HERCULES', 'ASCLEPIUS', 'EROS', 'IRIS', 'HEBE', 'AILEITYIA', 
//     //NN
//     'HERA', 'ATHENA', 'APHRODITE', 'APOLLON', 'ARES', 'ARTEMIS', 'DEMETER',  
//     //FBN
//     'CHARITES', 'CRONOS', 'DIONE', 'EOS1', 'GAIA', 'HADES', 'HECATE', 'HELIOS', 'HYPNOS', 'LATO', 'METIS', 'MOUSAI', 'NEMESIS', 'NIKE', 'PERSEPHONE', 'PSUKHE', 'RHEA', 'SELENE', 'THANATOS', 'TYCHE', 'URANOS'
// ];

let nodeAccArrNo = 0;//nodeAccArr.length;

//get the nodeAccArr
module.exports.getNodeAccArr = async () => {

    nodeAccArr = [];
    let tempRes = await dbDgosHandler.getNodeInfo();
    nodeAccArr = tempRes.reduce((acc, cur)=>{ //make new array with account id 
        if(cur.account_id != 'ZEUS') 
        {
            nodeAccArr.push(cur.account_id);
            return nodeAccArr ;
        }                
    },[])
    nodeAccArrNo = nodeAccArr.length;
    //logger.info("nodeAccArrCnt:" + nodeAccArr.length);

    nodeAccArr.sort();
    //logger.info("nodeAccArr:"+JSON.stringify(nodeAccArr));  
}

//send token from DGOS wallet to FinlChain NFT node wallet
module.exports.sendTknFromDgosWToNFTnodeW = async ( nodeAccArrNo, nodeName)=>{
//module.exports.sendTknFromDgosWToNFTnodeW = async ( nodeAccArrNo, nodeName ) => {
     
    let amt = calculateReward6H( nodeAccArrNo );    

    let res  = sendTknFromDgosToNFTnode( nodeAccArrNo, nodeName, amt);
    return res;
};

//send token from DGOS wallet to FinlChain NFT node wallet manually
module.exports.sendTknFromDgosWToNFTnodeWManually = async ( nodeName ) => {
    
    await this.getNodeAccArr();
   // logger.info("nodeAccArrNo_manually:"+nodeAccArrNo);
    let amt = calculateReward6H( nodeAccArrNo );    
   // logger.info("amt_manually:"+amt);
    let res = await sendTknFromDgosToNFTnode( nodeAccArrNo, nodeName, amt);
    return res;
};

//calculate reward tokens until today and send at once
module.exports.sendDgos2nodeAtonce = async () => {

    await this.getNodeAccArr();
 
    let transferArray = [...nodeAccArr];    
    //logger.info("transferArray:"+JSON.stringify(transferArray));
    let years = ecoUtil.ecoCountYears();
    let days = ecoUtil.ecoCountDaysOfLastYear();

    logger.info( `years : ${years} days : ${days} `);      // 3,  120    
   // logger.info("nodeAccArrNo_atOnce:"+nodeAccArrNo);
    let amt = calculateRewardGenesis2Now( nodeAccArrNo, years );
   // logger.info("amt_AtOnce:"+amt);
    try {
        let failedNodeName = []; 
        for(let i = 0; i < transferArray.length; i++) {       //transferArray.length   
            delay6sec(i)
            if(i == transferArray.length - 1)
            logger.info("=====================we finished to send token to all node========================");
        }  
        //send token every 6sec. if failed, save node account name for sending again.
        function delay6sec(i) {                 
            if( !setTimeout( function(){ sendTknFromDgosToNFTnode( nodeAccArrNo, transferArray[i], amt)}, i * 6000) )
            {
                failedNodeName.push(transferArray[i]);
                logger.debug("failedNodeName:" + JSON.stringify(failedNodeName));
            }
        }
        logger.debug("failedNodeName.length:" + failedNodeName.length);
        //if fail, try to send one more time
        if( failedNodeName.length != 0 )
        {
            failedNodeName.forEach(function(item, index)
            {
                logger.info("=====================we send to failed one again(dgos2node)========================");
                setTimeout( function(){ sendTknFromDgosToNFTnode( nodeAccArrNo, item, amt)}, index * 6000);
                logger.info("===================================================================================");
            });  
        }     

    } catch (error) {
        logger.error('---------------------------------------------------------------------------------');
        logger.error('sendDgos2nodeAtonce_error:' + err);
        logger.error('---------------------------------------------------------------------------------');
    }
}

//  매 6시간 보상량 계산
function calculateReward6H( nodeNum )
{
    // ( ecoReward.ecoRewardYear(nodeNum, 4) / 365 ) / 4 or  ecoReward.ecoRewardHours(nodeNum)
    let sendAmount = ecoReward.ecoRewardHours(nodeNum);    
    return sendAmount;
}

// (제네시스블록 ~ 오늘) 한꺼번에 보내는 보상량 계산
function calculateRewardGenesis2Now( nodeNum, roundNum )
{   
    let sendAmount = 0;
//  3년 + 120일치
//  ecoReward.ecoRewardYear(nodeNum, 1) +
//  ecoReward.ecoRewardYear(nodeNum, 2) +
//  ecoReward.ecoRewardYear(nodeNum, 3) +
//  ecoReward.ecoRewardDays(nodeNum,120) or (ecoRewardYear(nodeNum, 4) / 365) * 120

    for(let i = 1; i <= roundNum; i++)
    {
        sendAmount +=  ecoReward.ecoRewardYear(nodeNum, i);
        logger.debug("sendTotalAmount : " + sendAmount);
    }  

    sendAmount += ecoReward.ecoRewardDays(nodeNum, ecoUtil.ecoCountDaysOfLastYear());
 //   sendAmount += (ecoReward.ecoRewardYear(nodeNum, 4) / 365) * ecoUtil.ecoCountDaysOfLastYear();
   
    return sendAmount;
}

async function sendTknFromDgosToNFTnode( nodeNum, toAccountIdDN, amt){
  
    let sendAmount = 0; 
    sendAmount =  amt.toFixed(9);
    // let oSec = new Date().getSeconds();
    // sendAmount = (oSec * 10) + '.' + '000000000';
    
    logger.debug("sendAmount : " + sendAmount);

    ///////////////////////////////////////////////////////////////////////////
    try{

    //from
    // let apiRoutePath = '/account/chk/info';
    // let apiKey1 = 'accountId';
    // let apiVal1 = 'DGOS';
    // let apiPath = `${apiRoutePath}?${apiKey1}=${apiVal1}`;
    // let apiRes = await webApi.APICallProc(apiPath, config.FBN_CONFIG, webApi.WEBAPI_DEFINE.METHOD.GET);

    // logger.debug("----------------fromAccount------------------------");
    // let subnet_id_from = apiRes.contents.uAccountInfo.subnet_id;  
    // logger.debug(`fromAccount apiRes : ${JSON.stringify(apiRes)} `);
    // logger.debug("subnet_id_from ::: " + subnet_id_from);

    // //to
    // apiVal1 = toAccountIdDN;
    // apiPath = `${apiRoutePath}?${apiKey1}=${apiVal1}`;
    // apiRes = await webApi.APICallProc(apiPath, config.FBN_CONFIG, webApi.WEBAPI_DEFINE.METHOD.GET);

    // logger.debug("-------------------toAccount-----------------------");
    // if (!apiRes.errorCode)
    // {
    //     let subnet_id_to = apiRes.contents.uAccountInfo.subnet_id;
    //     logger.debug(`toAccount apiRes : ${JSON.stringify(apiRes)} `);
    //     logger.debug(`toAccount INFO ::: ${toAccountIdDN}, subnet_id_to ::: ${subnet_id_to}`);
    // }
    // else
    // {
    //     logger.debug(`INVALID TOAccount ::: ${toAccountIdDN}`);
    //     return false;
    // }

    ///////////////////////////////////////////////////////////////////////////

    //
    let dir = keyPathDN;
    let keyStorePath = dir + '/' + '1657786729779-{FIND2VNQZMHzaVRm8bbqKfABDV3Ui8ZnLkaejK9puoUpXTrvN}-DGOS.json';

    // json file
    let keyStore = fs.readFileSync(keyStorePath, 'binary');
    let keyStoreJson = JSON.parse(keyStore);
    // logger.debug("edPrikeyFin : " + keyStoreJson.edPrikeyFin);

    //
    let apiRoutePath = '/contract/tx/token';
    let apiKey1 = 'tAccountAction'; // tokenNum
    let apiVal1 = '0';
    let apiKey2 = 'fromAccount';
    let apiVal2 = 'DGOS';
    let apiKey3 = 'toAccount';
    let apiVal3 = toAccountIdDN;
    let apiKey4 = 'amount';
    let apiVal4 = sendAmount;
    let apiKey5 = 'ownerPrikey';
    let apiVal5 = keyStoreJson.edPrikeyFin;
    let apiKey6 = 'ownerPrikeyPw';
    let apiVal6 = keyPwDN;
    let apiKey7 = 'ownerPubkey';
    let apiVal7 = define.CONTRACT_DEFINE.ED_PUB_IDX + await cryptoUtil.getPubkeyNoFile(keyStoreJson.edPubkeyPem);

    //
    let apiVal4Enc = encodeURIComponent(apiVal4);
    let apiVal5Enc = encodeURIComponent(apiVal5);
    let apiVal6Enc = encodeURIComponent(apiVal6);
    let apiVal7Enc = encodeURIComponent(apiVal7);

    //
    let postData = `${apiKey1}=${apiVal1}&${apiKey2}=${apiVal2}&${apiKey3}=${apiVal3}&${apiKey4}=${apiVal4Enc}&${apiKey5}=${apiVal5Enc}&${apiKey6}=${apiVal6Enc}&${apiKey7}=${apiVal7Enc}`;

    
    apiRes = await webApi.APICallProc(apiRoutePath, config.FBN_CONFIG, webApi.WEBAPI_DEFINE.METHOD.POST, postData);
    logger.debug('---------------------------------------------------------------------------------');
    //logger.debug(`dgos2node postData  : ${JSON.stringify(postData)} `);
    logger.debug(`dgos2node toAccount INFO : ${toAccountIdDN} apiRes : ${JSON.stringify(apiRes)} `);
    logger.debug('---------------------------------------------------------------------------------');
    
    return apiRes.contents.res;      
            
    } catch (err) {
        logger.error('---------------------------------------------------------------------------------');
        logger.error('sendTknFromDgosToNFTnode_error:' + err);
        logger.error('---------------------------------------------------------------------------------');
        return false;
    }
}
