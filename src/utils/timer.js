//
const fs = require('fs');
//
const cryptoSsl = require('./../../../../addon/crypto-ssl');
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const base58 = require('./../utils/base58.js');
const cryptoUtil = require('./../sec/cryptoUtil.js');
const encrypto = require('./../sec/encrypto.js');
const webApi = require("./../net/webApi.js");
const ecoReward = require("./../eco/ecoReward.js");
const ecoSupply = require("./../eco/ecoSupply.js");
const ecoUtil = require("./../eco/ecoUtil.js");
const txDgos = require('./../tx/txDgos.js');
const txNode = require('./../tx/txNode.js');
const logger = require('./../utils/winlog.js');
const { send } = require('process');
const dbDgosHandler = require("./../db/dbDgosHandler.js");

///////////////////////////////////////////////////////

let nodeAccArr = new Array();
// nodeAccArr = [
//     //ISAG
//     'HESTIA', 'HERCULES', 'ASCLEPIUS', 'EROS', 'IRIS', 'HEBE', 'AILEITYIA', 'sdfsdgfdfgd' ,
//     //NN
//     'HERA', 'ATHENA', 'APHRODITE', 'APOLLON', 'ARES', 'ARTEMIS', 'DEMETER',
//     //FBN
//     'CHARITES', 'CRONOS', 'DIONE', 'EOS1', 'GAIA', 'HADES', 'HECATE', 'HELIOS', 'HYPNOS', 'LATO', 'METIS', 'MOUSAI', 'NEMESIS', 'NIKE', 'PERSEPHONE', 'PSUKHE', 'RHEA', 'SELENE', 'THANATOS', 'TYCHE', 'URANOS'
// ];

let nodeAccArrNo = 0 // nodeAccArr.length;

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
    nodeAccArr.sort();
    //logger.info("nodeAccArr:"+JSON.stringify(nodeAccArr));
    nodeAccArrNo = nodeAccArr.length;
    //logger.info("nodeAccArrCnt:" + nodeAccArr.length);
}

//supply2dgos
let timerSD = {
    started: false,
    timestamp: 0,
    timeRemained: 0,
    timerObjTxSupplW2DgosW: 0
},
triggerSD = 0;  // timer start from 00:00 UTC (midnight) 


//dgos2node
let timerDN = {
    started: false,
    timestamp: 0,
    timeRemained: 0,
    timerObjTxDgosW2NodeW: 0
},
triggerDN = 0;  // timer start from 00:00 UTC (midnight) 

//////////////////////////////////////////////////
// Timer excecute every 6 hours in UTC time (send token)
// 1. send Token from supply wallet to DGOS Wallet at 58min
// 2. send Token to all node wallet(alphabet order) (every 6h o'clock)

// send reward to 35 nodes(except IS)
// 1 send every 6 seconds between nodes (Block creation time require at least 4 sec), 
// 2.fail ( save node names send again )
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//              SupplW2DgosW                    //
//////////////////////////////////////////////////

//stt supply2dgos
module.exports.setIntervalTxSupplW2DgosW = () => {
    if (timerSD.timerObjTxSupplW2DgosW) {
        return false;
    }
    //Indicates the timer has been started
    timerSD.started = true;            
    // h =   Math.floor(현재시간/ 6시간) : 나머지 버린 결과값
    // prev6h = h * 6시간 : 현재시간에서 이전 6시간 단위 값
    // next = prev6h +  6시간 : 다음 전송 타임  
    // remainedTimeUntil =  next - d : 다음 전송까지 남은 시간
    let d = +new Date;  //get as milliseconds
    let h = Math.floor(d / 21600000);  // 6Hours (1000*60*60*6)
    let prev6h = h * 21600000;
    let next = prev6h + 21600000;
    let remainedTimeUntil = next - d - 60000;

    let str = getcountdownnum(remainedTimeUntil / 1000 );
    logger.info("remainedTimeUntil: " + str);
    
    this.getNodeAccArr();
    //setTimeout(periodicSupplW2DgosW, 5000);  
    setTimeout(periodicSupplW2DgosW, remainedTimeUntil - 60000);  //send 1 min(1000 * 60) before dgos2node tx
}

function periodicSupplW2DgosW() {
    //send token immediately 
    tickSupplW2DgosW2();
    // every 6 Hours   
    timerSD.timerObjTxSupplW2DgosW = setInterval(tickSupplW2DgosW2, 21600000);   //send every 6H (1000 * 60 * 60 * 6)
}

async function tickSupplW2DgosW2() {
    // send TKN supply2dgos  
    try {
        //get the current time in milliseconds
        let oDate = new Date();
        let oHour = new Date().getHours();
        let oMin = new Date().getMinutes();
        //name of timezone: Coordinated Universal Time (UTC)
        let tz = oDate.toString().split("GMT")[1];
        let dt = oDate.toDateString();
        let tm = oDate.toLocaleTimeString();

        logger.info("===================================================================================");
        logger.info("timezone:" + tz);
        logger.info("date:" + dt);
        logger.info("time:" + tm);
        logger.info("=========================now we send token(supply2dgos)============================");

        timerSD.timestamp = +new Date;
        await txDgos.sendTknFromSupplyWToDgosW(nodeAccArrNo);

    } catch (error) {
        logger.error("========================================");
        logger.error("SupplW2DgosW_error:" + error);
        logger.error("========================================");
    }
}


//stop calling function periodically
module.exports.clrIntervalTxSupplW2DgosW = () => {
    if (!timerSD.timerObjTxSupplW2DgosW) {
        return false;
    }

    try {
        clearInterval(timerSD.timerObjTxSupplW2DgosW);
        timerSD.started = false;
        timerSD.timestamp = 0;

        logger.info("======================================================================");
        logger.info("stop SupplW2DgosW scheduller success");
        logger.info("======================================================================");
    } catch (error) {
        logger.error("======================================================================");
        logger.error("error:" + error);
        logger.error("======================================================================");
    }

    return true;
}

//check remaining time for next sending
module.exports.checkRemainedTimeSD = () => {
  
    //next sending time(last sending time + 6H) - current time
    if(timerSD.timestamp)
    {
        let d = +new Date;
        timerSD.timeRemained = new Date((timerSD.timestamp + 21600000) - d);
        let str = getcountdownnum(timerSD.timeRemained / 1000);
        logger.info("timeRemainedForSD: " + str);
    }
    else
    {
        logger.info("Timer for supply2dgos has not been started yet!!!");
    }
}

//////////////////////////////////////////////////
//              DgosW2NodeW                     //   
//////////////////////////////////////////////////

//stt dgos2node
module.exports.setIntervalTxDgosW2NodeW = () => {
    if (timerDN.timerObjTxDgosW2NodeW) {
        return false;
    }
    //Indicates the timer has been started
    timerDN.started = true;              
    // h =   Math.floor(현재시간/ 6시간) : 나머지 버린 결과값
    // prev6h = h * 6시간 : 현재시간에서 이전 6시간 단위 값
    // next = prev6h +  6시간 : 다음 전송 타임  
    // remainedTimeUntil =  next - d : 다음 전송까지 남은 시간
    let d = +new Date;  //get as milliseconds
    let h = Math.floor(d / 21600000);  // 6Hours (1000*60*60*6)
    let prev6h = h * 21600000;
    let next = prev6h + 21600000;
    let remainedTimeUntil = next - d;

    let str = getcountdownnum(remainedTimeUntil / 1000);
    logger.info("remainedTimeUntil: " + str);      

    this.getNodeAccArr();    
   // setTimeout(periodicDgosW2NodeW, 5000);  //send dgos2node tx
    setTimeout(periodicDgosW2NodeW, remainedTimeUntil);  //send dgos2node tx
}

async function periodicDgosW2NodeW() {
    // send TKN DgosW2NodeW  
    tickDgosW2NodeW();
    // every 6 Hours       
    timerDN.timerObjTxDgosW2NodeW = setInterval(tickDgosW2NodeW, 21600000 ); // 1000 * 60 * 60 * 6
}

async function tickDgosW2NodeW() {
  
    let transferArray = [...nodeAccArr];
    //console.log("transferArray:"+JSON.stringify(transferArray));
    //get the current time in milliseconds
    let oDate = new Date();
    let oHour = new Date().getHours();
    let oMin = new Date().getMinutes();
    //name of timezone: Coordinated Universal Time (UTC)
    let tz = oDate.toString().split("GMT")[1];
    let dt = oDate.toDateString();
    let tm = oDate.toLocaleTimeString();

    // send TKN dgos2node   
    try {
        logger.info("===================================================================================");
        logger.info("timezone:" + tz);
        logger.info("date:" + dt);
        logger.info("time:" + tm);
        logger.info("==========================now we send token(dgos2node)=============================");
        
        timerDN.timestamp = +new Date;
        let failedNodeName = [];
        for (let i = 0; i < transferArray.length; i++) {
            delay6sec(i);    
        }              
       
        //send token every 6sec. if failed, save node account name for sending again.
        function delay6sec(i) {
          
            setTimeout(function () 
            { 
                //let res = txNode.sendTknFromDgosWToNFTnodeW( nodeAccArrNo, transferArray[i])
                //logger.debug("res :" + res);
                if(!txNode.sendTknFromDgosWToNFTnodeW( nodeAccArrNo, transferArray[i]))  
                {                       
                    failedNodeName.push(transferArray[i]);
                    logger.debug("failedNodeName:" + JSON.stringify(failedNodeName));
                }          

            }, i * 6000)      
        }      
      
        //if fail, try to send one more time      
        //  failedNodeName = ["HYPNOS","LATO","METIS","MOUSAI","NEMESIS"];
        if (failedNodeName.length > 0) {
            failedNodeName.forEach(function (item, index) {
                delay6secForFailed(item, index);
            });
        }       

        function delay6secForFailed(item, index) {
            logger.info("=====================we send to failed one again(dgos2node)========================");
            setTimeout(function () { txNode.sendTknFromDgosWToNFTnodeW( nodeAccArrNo, item) }, index * 6000);      
        }    

    } catch (error) {
            logger.error("========================================");   
           // logger.error("FailedNodeName:" + JSON.stringify(failedNodeName));   
            logger.error("DgosW2NodeW_error:" + error);   
            logger.error("========================================");   
    }
}

//stop calling function periodically
module.exports.clrIntervalTxDgosW2NodeW = () => {
    if (!timerDN.timerObjTxDgosW2NodeW) {
        return false;
    }

    try {
        clearInterval(timerDN.timerObjTxDgosW2NodeW);
        timerDN.started = false;
        timerDN.timestamp = 0;

        logger.info("======================================================================");
        logger.info("stop DgosW2NodeW scheduller success");
        logger.info("======================================================================");
    } catch (error) {
        logger.error("======================================================================");
        logger.error("error:" + error);
        logger.error("======================================================================");
    }
    return true;
}

//check remaining time for next sending
module.exports.checkRemainedTimeDN = () => {
  
    //next sending time(last sending time + 6H) - current time
    if(timerDN.timestamp)
    {
        let d = +new Date;
        timerDN.timeRemained = new Date((timerDN.timestamp + 21600000) - d);
        let str = getcountdownnum(timerDN.timeRemained / 1000);
        logger.info("timeRemainedForDN: " + str);
    }
    else{
        logger.info("Timer for dgos2node has not been started yet!!!");
    } 
}

//////////////////////////////////////////////////


//display remained time 00:00:00 
function getcountdownnum(num) {
    let txt = num
    txt = Number(txt)
    let day = 0
    let hour = 0
    let min = 0
    let sec = 0
    for (i = 0; i > -1; i++) {
        if (txt >= 86400) {
            txt -= 86400
            day++
        } else {
            break
        }
    }
    for (i = 0; i > -1; i++) {
        if (txt >= 3600) {
            txt -= 3600
            hour++
        } else {
            break
        }
    }
    for (i = 0; i > -1; i++) {
        if (txt >= 60) {
            txt -= 60
            min++
        } else {
            break
        }
    }
    sec = txt
    if (sec == 60) {
        sec = 0
    }
    var final = ""
    if (day != 0) {
        final = day + ((day == 1) ? " day " : " days ")
    }
    if (hour < 10) {
        hour = "0" + hour
    }
    if (min < 10) {
        min = "0" + min
    }
    if (sec < 10) {
        sec = "0" + sec
    }
    final = final + hour + ":" + min + ":" + Math.round(sec)
    return final
}