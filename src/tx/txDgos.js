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
const ecoSupply = require("./../eco/ecoSupply.js");
const ecoUtil = require("./../eco/ecoUtil.js");
//fixed input for sending token
const keyPathSD = './../../conf/test/key/ed/key_07';
const keyPwSD = 'asdfQWER1234!@#$';
const toAccountIdSD = 'DGOS';

let nodeAccArr = new Array();

let nodeAccArrNo = nodeAccArr.length;

//get the nodeAccArr
module.exports.getNodeAccArr = async () => {
        nodeAccArr = [];
        let tempRes = await dbDgosHandler.getNodeInfo();
        nodeAccArr = tempRes.reduce((acc, cur)=>{
            if(cur.account_id != 'ZEUS')   //except IS
            {
                nodeAccArr.push(cur.account_id);
                return nodeAccArr ;
            }                
        },[])
       // logger.info("nodeAccArr:"+JSON.stringify(nodeAccArr));
        nodeAccArrNo = nodeAccArr.length;
      //  logger.info("nodeAccArrCnt:" + nodeAccArr.length);
}

//send token from FinlChain supply wallet to DGOS wallet
module.exports.sendTknFromSupplyWToDgosW = async () => {
        let res = false;   

        this.getNodeAccArr();
    
        let amt = calculateSupply6H(nodeAccArrNo);
        
        res = await sendTknFromSupplyToDgos( nodeAccArrNo, amt );
        if(res) return true; else return false;
}

//calculate supply for tokens until today and send at once
// module.exports.sendSupply2dgosAtonce = async () => {

//         let years = ecoUtil.ecoCountYears();
//         let days = ecoUtil.ecoCountDaysOfLastYear();

//         logger.info( `years : ${years} days : ${days} `);       
        
//         let amt = calculateRewardGenesis2Now( nodeAccArrNo, years, days );

//         //7*5+1 = 36; 7cluster, 1 cluster consists of 3 FBN, 1 ISAG I NN +  1IS
//         sendTknFromSupplyToDgos(nodeAccArrNo, amt);      
// }

// function calculateRewardGenesis2Now(){

// }

//  매 6시간 공급량 계산
function calculateSupply6H( nodeNum )
{  
    let sendAmount = ecoSupply.ecoSupplyHours(nodeNum);   
    return sendAmount;
}

//send token from FinlChain supply wallet to DGOS wallet
async function sendTknFromSupplyToDgos(nodeNum, amt){
        //
        let sendAmount = 0;        
        
        //sendAmount for 6hours 
        sendAmount = amt.toFixed(9);
        logger.debug("sendAmount : " + sendAmount);

        let dir = keyPathSD;

        // logger.debug("dir : " + dir);
        // logger.debug("keyPw : " + keyPwSD);
        logger.debug("toAccountIdSD : " + toAccountIdSD);     

        //
        let ownerPriKeyPath = dir + '/' + 'ed_privkey.fin';
        let ownerPubkeyPath = dir + '/' + 'ed_pubkey.pem';
        // logger.debug("ownerPriKeyPath : " + ownerPriKeyPath);     
        // logger.debug("ownerPubkeyPath : " + ownerPubkeyPath);     
        //
        let apiRoutePath = '/contract/tx/token';
        let apiKey1 = 'tAccountAction'; // tokenNum
        let apiVal1 = '0';
        let apiKey2 = 'fromAccount';
        let apiVal2 = define.CONTRACT_DEFINE.FROM_DEFAULT;
        let apiKey3 = 'toAccount';
        let apiVal3 = toAccountIdSD;
        let apiKey4 = 'amount';
        let apiVal4 = sendAmount;
        let apiKey5 = 'ownerPrikey';
        let apiVal5 = fs.readFileSync(ownerPriKeyPath, 'binary');
        let apiKey6 = 'ownerPrikeyPw';
        let apiVal6 = keyPwSD;
        // 
        let apiKey7 = 'ownerPubkey';
        let apiVal7 = cryptoUtil.getPubkey(ownerPubkeyPath);

        //
        let apiVal4Enc = encodeURIComponent(apiVal4);
        let apiVal5Enc = encodeURIComponent(apiVal5);
        let apiVal6Enc = encodeURIComponent(apiVal6);
        let apiVal7Enc = encodeURIComponent(apiVal7);

        // //
        // let apiVal42Dec = encodeURIComponent(apiVal4Enc);
        // logger.debug("apiVal4Dec : " + apiVal4Dec);
        // let apiVal5Dec = encodeURIComponent(apiVal5Enc);
        // logger.debug("apiVal5Dec : " + apiVal5Dec);
        // let apiVal6Dec = encodeURIComponent(apiVal6Enc);
        // logger.debug("apiVal6Dec : " + apiVal6Dec);
        // let apiVal7Dec = encodeURIComponent(apiVal7Enc);
        // logger.debug("apiVal72Dec : " + apiVal7Dec);

        ///////////////////////////////////////////////////////////////////////////////////
        // For TEST
        //
        let seed = apiVal6;
        let decFile = cryptoSsl.aesDecFile(ownerPriKeyPath, seed, seed.length);
        logger.debug("decFile : " + decFile);

        //
        let postData = `${apiKey1}=${apiVal1}&${apiKey2}=${apiVal2}&${apiKey3}=${apiVal3}&${apiKey4}=${apiVal4Enc}&${apiKey5}=${apiVal5Enc}&${apiKey6}=${apiVal6Enc}&${apiKey7}=${apiVal7Enc}`;

        try{
                let apiRes = await webApi.APICallProc(apiRoutePath, config.FBN_CONFIG, webApi.WEBAPI_DEFINE.METHOD.POST, postData);
                logger.debug('-------------------------------------------------------------------------------');
                logger.debug("supply2dgos apiRes : " + JSON.stringify(apiRes));
                logger.debug('-------------------------------------------------------------------------------');
                return true;

        }catch(err){
                logger.error('-------------------------------------------------------------------------------');
                logger.error('sendTknFromSupplyToDgos_error:' + err);
                logger.error('-------------------------------------------------------------------------------');
                return false;
        }      
}

