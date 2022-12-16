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
const ecoReward = require("./../eco/ecoReward.js");
const ecoSupply = require("./../eco/ecoSupply.js");
const ecoUtil = require("./../eco/ecoUtil.js");
const txDgos = require('./../tx/txDgos.js');
const txNode = require('./../tx/txNode.js');
const txSchNode = require('./../tx/txSchNode.js');
const txSchUser = require('./../tx/txSchUser.js');
const cryptoApi = require('./../sec/cryptoApi.js');
const webApi = require("./../net/webApi.js");
const timer = require("./../utils/timer.js");
const logger = require('./../utils/winlog.js');
const crypto = require('crypto');
const dbUtil = require('./../db/dbUtil.js');

//
module.exports.handler = async (cmd) => {
    let retVal = true;

    logger.info('DGOS CLI Received Data : ' + cmd);
   
    let cmdSplit = cmd.split(' ');
 
    if (cmd.slice(0,10) === define.CMD.wallet_add)
    {
        // 
        // let keyPath = cmdSplit[3];

        let supplyRole = cmdSplit[cmdSplit.indexOf(define.CMD.wallet_add_option1) + 1];
        // logger.info('supplyRole : ' + supplyRole);

        let supplyRoleInt = define.getSupplyRoleInt(supplyRole);
        if (supplyRoleInt === define.ERR_CODE.ERROR)
        {
            logger.error('supplyRoleInt : ' + supplyRoleInt);
            retVal = false;
            return (retVal);
        }

        // let keyPath = cmdSplit[cmdSplit.indexOf(define.CMD.wallet_add_option2) + 1];
        // logger.info('keyPath : ' + keyPath);

        // let keyStore = fs.readFileSync(keyPath, 'binary');
        // // logger.debug('keyStore : ' + keyStore);

        // let keyStoreJson = JSON.parse(keyStore);
        // // logger.debug('keyStoreJson : ' + JSON.stringify(keyStoreJson));

        // let pubkey = await cryptoUtil.getPubkeyNoFile(keyStoreJson.edPubkeyPem);
        // // logger.debug('pubkey : ' + pubkey);

        // let myPubkey = '05' + pubkey;
        // // logger.debug('myPubkey : ' + myPubkey);

        let accountId = cmdSplit[cmdSplit.indexOf(define.CMD.wallet_add_option3) + 1];
        let snHash = cmdSplit[cmdSplit.indexOf(define.CMD.wallet_add_option4) + 1];
        let nodePrice = cmdSplit[cmdSplit.indexOf(define.CMD.wallet_add_option5) + 1];
        let startTs = cmdSplit[cmdSplit.indexOf(define.CMD.wallet_add_option6) + 1];

        logger.info('accountId : ' + accountId);
        logger.info('snHash : ' + snHash);
        logger.info('nodePrice : ' + nodePrice);
        logger.info('startTs : ' + startTs);

        //
        let apiPath;
        let apiRes;

        // apiPath = `/account/chk/info?pubkeySimple=${myPubkey}`;
        apiPath = `/account/chk/info?accountId=${accountId}`;
        apiRes = await webApi.APICallProc(apiPath, config.FBN_CONFIG, webApi.WEBAPI_DEFINE.METHOD.GET);
        logger.debug("apiRes result : " + JSON.stringify(apiRes));
        //if account exist, proceed
        if (apiRes.errorCode === 0)
        {
            // let accountId = apiRes.contents.uAccountInfo.account_id;
            let accountNum = apiRes.contents.uAccountInfo.account_num;
 
            logger.debug("accountId : " + accountId);
            logger.debug("accountNum : " + accountNum);
            logger.debug("supplyRoleInt : " + supplyRoleInt);
            logger.debug("snHash : " + snHash);

            let nodeInfo = await dbDgosHandler.getNodeInfoByAccountId(accountId);
            // add node info
            if (nodeInfo.length === 0)
            {
                // 
                await dbDgosHandler.addNodeInfo(parseInt(startTs), accountId, accountNum, supplyRoleInt, snHash, nodePrice);

                //
                let nodeInsert = true;
                //
                let apiRes;
                apiRes = await txSchNode.txNodeSelectReq(accountId);

                if (util.isJsonString(apiRes))
                {
                    if (apiRes.message === "Success")
                    {
                        nodeInsert = false;
                    }
                }
                // register node
                // if (nodeInsert === true)
                // {
                //     let nodeMaxReward = "100";
                //     apiRes = await txSchNode.txNodeRegReq(snHash, nodePrice, nodeMaxReward, parseInt(startTs), accountId);
                // }
            }
            else
            {
                logger.error("account id[" + accountId + "] is already existed.");
            }
        }
    }
    else if (cmd.slice(0,16) === define.CMD.set_supply_token)
    {
        timer.setIntervalTxSupplW2DgosW();
    }
    else if (cmd.slice(0,16) === define.CMD.clr_supply_token)
    {
        timer.clrIntervalTxSupplW2DgosW();
    }
    else if (cmd.slice(0,16) === define.CMD.set_reward_token)
    {
        timer.setIntervalTxDgos2Node();
    }
    else if (cmd.slice(0,16) === define.CMD.clr_reward_token)
    {
        timer.clrIntervalTxDgos2Node();
    }
    else if (cmd.slice(0,10) === define.CMD.eco_supply)
    {
        let supply = ecoSupply.ecoSupplyYear(37, 4);
        logger.debug('supply : ' + supply);
    }
    else if (cmd.slice(0,10) === define.CMD.eco_reward)
    {
        let reward = ecoReward.ecoRewardYear(37, 4);
        logger.debug('reward : ' + reward);
    }
    // test
    else if (cmd.slice(0,15) === define.CMD.test_count_days)
    {
        let countDays = ecoUtil.ecoCountDays();
        logger.debug('countDays : ' + countDays);

        let countDaysOfLastYear = ecoUtil.ecoCountDaysOfLastYear();
        logger.debug('countDaysOfLastYear : ' + countDaysOfLastYear);
    }
    else if (cmd.slice(0,16) === define.CMD.test_count_years)
    {
        let countYears = ecoUtil.ecoCountYears();
        logger.debug('countYears : ' + countYears);
    }
    else if (cmd.slice(0,15) === define.CMD.test_gen_apisig)
    {
        let keyHex = '38df3a8e044d47e891a51f539633a392';
        let data = "apiKey=a2310fb0bb92478a93d0608e2507955e&timeStamp=2022-07-12 04:22:01.000&version=V1.0.0";
        //signature is input parameter for USER API 
        let sig = cryptoApi.generateSignature(keyHex, data);
        logger.debug('sig : ' + sig);
    }
    // else if (cmd.slice(0,13) === define.CMD.test_gen_skey)
    // {
    //     //
    //     let xaPrikeyPath = './../../conf/test/key/x25519/01_x_privkey.pem';
    //     let xaPubkeyPath = './../../conf/test/key/x25519/01_x_pubkey.pem';
    //     let xbPrikeyPath = './../../conf/test/key/x25519/02_x_privkey.pem';
    //     let xbPubkeyPath = './../../conf/test/key/x25519/02_x_pubkey.pem';

    //     //
    //     let xaPrikeyFile = fs.readFileSync(xaPrikeyPath, 'binary');
    //     let xaPubkeyFile = fs.readFileSync(xaPubkeyPath, 'binary');
    //     let xbPrikeyFile = fs.readFileSync(xbPrikeyPath, 'binary');
    //     let xbPubkeyFile = fs.readFileSync(xbPubkeyPath, 'binary');

    //     //
    //     let xaPrikey = cryptoSsl.ed25519GetPrikey(xaPrikeyPath);
    //     console.log("xaPrikey : " + xaPrikey);
        
    //     let xaPubkey = cryptoSsl.ed25519GetPubkey(xaPubkeyPath);
    //     console.log("xaPubkey : " + xaPubkey);

    //     let xbPrikey = cryptoSsl.ed25519GetPrikey(xbPrikeyPath);
    //     console.log("xbPrikey : " + xbPrikey);
        
    //     let xbPubkey = cryptoSsl.ed25519GetPubkey(xbPubkeyPath);
    //     console.log("xbPubkey : " + xbPubkey);

        //
        // let sharedKey1 = cryptoApi.generateX25519PemSKey(xaPrikeyFile, xbPubkeyFile);
        // logger.debug('sharedKey1 : ' + sharedKey1);

        // let sharedKey2 = cryptoApi.generateX25519PemSKey(xbPrikeyFile, xaPubkeyFile);
        // logger.debug('sharedKey2 : ' + sharedKey2);

        // //
        // let sharedKey3 = cryptoApi.generateX25519HexSKey(xaPrikey, xbPubkey);
        // logger.debug('sharedKey3 : ' + sharedKey3);

        // let sharedKey4 = cryptoApi.generateX25519HexSKey(xbPrikey, xaPubkey);
        // logger.debug('sharedKey4 : ' + sharedKey4);

        // //
        // let sharedKey5 = cryptoApi.generateX25519MixSKey(xaPrikeyFile, xbPubkey);
        // logger.debug('sharedKey5 : ' + sharedKey5);

        // let sharedKey6 = cryptoApi.generateX25519MixSKey(xbPrikeyFile, xaPubkey);
        // logger.debug('sharedKey6 : ' + sharedKey6);

    //}
    //send token from SupplW to dgosW manually
    else if (cmd.slice(0,16) === define.CMD.send_tkn_fromSupplyW_todgosW)
    {
        txDgos.sendTknFromSupplyWToDgosW();         
    }
    //send token from dgosW to NFTnodeW manually
    else if (cmd.slice(0,14) === define.CMD.send_tkn_fromDgosW_toNFTnodeW)
    {
        let cmdSplit = cmd.split(' ');
        let nodeNm = cmdSplit[2];
        //logger.info("nodeNm:" + nodeNm );
        txNode.sendTknFromDgosWToNFTnodeWManually(nodeNm);        
    }
    //start timer supply2dgos when it's 00:00      
    else if (cmd.slice(0,15) === define.CMD.start_timer_supply2dgos && cmd.slice(-3) === 'gos')
    {
        timer.setIntervalTxSupplW2DgosW();
      //  timer.timerInitSD(); //start timer when it's 00:00           
    } 
    //stop timer supply2dgos
    else if (cmd.slice(0,15) === define.CMD.stop_timer_supply2dgos)
    {
        timer.clrIntervalTxSupplW2DgosW();
    } 
    //start timer dgos2node when it's 00:00      
    else if (cmd.slice(0,13) === define.CMD.start_timer_dgos2node && cmd.slice(-3) === 'ode')
    {
        timer.setIntervalTxDgosW2NodeW();   
        //timer.timerInitDN(); //start timer when it's 00:00        
    }   
    //stop timer supply2dgos
    else if (cmd.slice(0,13) === define.CMD.stop_timer_dgos2node)
    {
        timer.clrIntervalTxDgosW2NodeW();
    } 
    //check remained time for next sending
    else if (cmd.slice(0,17) === define.CMD.check_remainedtime_supply2dgos)
    {
        timer.checkRemainedTimeSD(); 
    } 
    //check remained time for next sending
    else if (cmd.slice(0,15) === define.CMD.check_remainedtime_dgos2node)
    {
        timer.checkRemainedTimeDN(); 
    }    
    //calculate supply for tokens until last reward day and send at once
    // else if (cmd.slice(0,22) === define.CMD.send_supply2dgos_atonce && cmd.slice(-3) === 'gos')
    // {     
    //     txDgos.sendSupply2dgosAtonce(); 
    // }    
    //calculate reward tokens until last reward day and send at once
    else if (cmd.slice(0,20) === define.CMD.send_dgos2node_atonce && cmd.slice(-3) === 'ode')
    {
        txNode.sendDgos2nodeAtonce(); 
    }
    else if (cmd.slice(0,7) === define.CMD.DATE_TO_TS)
    {
        //
        let cmdSplit = cmd.split(' ');
        let startDate = cmdSplit[cmdSplit.indexOf(define.CMD.DATE_TO_TS_OPT1) + 1] + ' ' + cmdSplit[cmdSplit.indexOf(define.CMD.DATE_TO_TS_OPT1) + 2];
        let endDate = cmdSplit[cmdSplit.indexOf(define.CMD.DATE_TO_TS_OPT2) + 1] + ' ' + cmdSplit[cmdSplit.indexOf(define.CMD.DATE_TO_TS_OPT2) + 2];
        
        logger.debug('startDate : ' + startDate);
        logger.debug('endDate : ' + endDate);

        // let startDate = '04/01/2019 00:00:00';
        let startTs = util.date2Timestamp(startDate);
        logger.debug('startTs : ' + startTs);

        // let endDate = '07/28/2022 00:00:00';
        let endTs = util.date2Timestamp(endDate);
        logger.debug('endTs : ' + endTs);

        let curTs = Date.now();
        logger.debug('curTs : ' + curTs);
    }
    else if (cmd.slice(0,16) === define.CMD.test_node_insert)
    {
        let nodeSN = "0dd3d4fa02705c6c9566942f393350dfa399d79f43cfe31349b8d548118fb7e1";
        let nodePrice = "1000000";
        let nodeMaxReward = "100";//"74";
        let startTs = 1554076800000;
        let walletName = "GAIA";

        await txSchNode.txNodeRegReq(nodeSN, nodePrice, nodeMaxReward, startTs, walletName);
    }
    else if (cmd.slice(0,12) === define.CMD.test_node_tx)
    {
        let fromWalletName = "0x8D035BA57455a180B9bfcFF9DC512Dfa3ebCE1F3";
        let toWalletName = "ZEUS";
        let sendAmount = "10.123456789";
        await txSchNode.txNodeTxReq(fromWalletName, toWalletName, sendAmount);
    }
    else if (cmd.slice(0,16) === define.CMD.test_node_select)
    {
        let walletName = "GAIA";
        await txSchNode.txNodeSelectReq(walletName);
    }
    else if (cmd.slice(0,16) === define.CMD.test_user_insert)
    {
        // let walletName = "SALUSSALUS";
        // let accountNum = "51980BFB62E7C40C";

        // let walletName = "ADMIN1";
        // let accountNum = "51980B0662E8248C";

        let walletName = "DYUNE";
        let accountNum = "21980BB962E79151";

        await txSchUser.txUserInsertReq(walletName, accountNum);

        // let walletName = "BIGMONEY2022";
        // let accountNum = "21980B3362E845B7";

        // await txSchUser.txUserInsertReq(walletName, accountNum);

        // let walletName = "IMJONMILLER";
        // let accountNum = "61980BA562E84A32";

        // await txSchUser.txUserInsertReq(walletName, accountNum);

        // let walletName = "LEXIE1980";
        // let accountNum = "31980B5C62E85016";

        // await txSchUser.txUserInsertReq(walletName, accountNum);

        // let walletName = "EASYWALLET";
        // let accountNum = "61980B1262E86F9F";

        // await txSchUser.txUserInsertReq(walletName, accountNum);

        // let walletName = "HALOPOWER";
        // let accountNum = "61980BAF62E85DE1";

        // await txSchUser.txUserInsertReq(walletName, accountNum);
    }
    else if (cmd.slice(0,16) === define.CMD.test_user_select)
    {
        let walletName = "USER_01";

        await txSchUser.txUserSelectReq(walletName);
    }
    else if (cmd.slice(0,16) === define.CMD.test_user_buyadd)
    {
        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659361534667;
        // let userWalletName = "SALUSSALUS";
        // let purchaseSiteId = "salussalus";
        // let nodeWalletName = "GAIA";
        // let nftId = "1";
        // let nftHash = "2FCE8EEDB76D9E3149525B0D1E187E5BF81446F6B372AA9808B223E387CC2547";

        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659361828214;
        // let userWalletName = "SALUSSALUS";
        // let purchaseSiteId = "salussalus";
        // let nodeWalletName = "GAIA";
        // let nftId = "2";
        // let nftHash = "98FD0914837755924C26FD83E712499C4CCA389784704CD437254FA4D1BA4028";

        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659372769087;
        // let userWalletName = "SALUSSALUS";
        // let purchaseSiteId = "salussalus";
        // let nodeWalletName = "GAIA";
        // let nftId = "3";
        // let nftHash = "2971CC4CF48373AD621DE610358B32D751AF2BFD66B8D731DADA8E8C9DF0C0BA";

        let purchasePrice = "500";
        let userMaxReward = "1";
        let startTs = 1659380979749;
        let userWalletName = "ADMIN1";
        let purchaseSiteId = "admin1";
        let nodeWalletName = "GAIA";
        let nftId = "4";
        let nftHash = "9C671974F798DBAE13CA96B0D4460D37B719E377B07FD51A7919E4CED0506BAD";

        await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659382824611;
        // let userWalletName = "ADMIN1";
        // let purchaseSiteId = "admin1";
        // let nodeWalletName = "GAIA";
        // let nftId = "5";
        // let nftHash = "B4E7DE6323305EAE3E4D1EDB8F6DA69044074805D09E464EDB8D762AD215839D";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "1500";
        // let userMaxReward = "3";
        // let startTs = 1659383349242;
        // let userWalletName = "ADMIN1";
        // let purchaseSiteId = "admin1";
        // let nodeWalletName = "GAIA";
        // let nftId = "6";
        // let nftHash = "F55F3BE52E11C0825C2C401B5E54D0F038C6026CE354BD68F4D60C84AF771721";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "2500";
        // let userMaxReward = "5";
        // let startTs = 1659384628694;
        // let userWalletName = "ADMIN1";
        // let purchaseSiteId = "admin1";
        // let nodeWalletName = "GAIA";
        // let nftId = "7";
        // let nftHash = "2BB82F8AA677D58EE24DD17C91A32A3921B241876F55093C19570E50A7A5AC29";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659387406234;
        // let userWalletName = "DYUNE";
        // let purchaseSiteId = "DYune";
        // let nodeWalletName = "GAIA";
        // let nftId = "8";
        // let nftHash = "2DE61611E3457A8DA6575D1A8E37514AC1254887821D5D09FA4F1D806A663E10";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "1000";
        // let userMaxReward = "2";
        // let startTs = 1659390035505;
        // let userWalletName = "BIGMONEY2022";
        // let purchaseSiteId = "bigmoney";
        // let nodeWalletName = "GAIA";
        // let nftId = "9";
        // let nftHash = "01E4C0D4C1EB77AA4DA21D79FBD45AF048D9A4790E8189FB527428866F9CDF8C";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "1000";
        // let userMaxReward = "2";
        // let startTs = 1659390036914;
        // let userWalletName = "BIGMONEY2022";
        // let purchaseSiteId = "bigmoney";
        // let nodeWalletName = "GAIA";
        // let nftId = "10";
        // let nftHash = "278CAEDB8C1C324BB06CB67E8F33C97D934D92B4E8EBCDE5A0FC8734902D6889";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659392032325;
        // let userWalletName = "IMJONMILLER";
        // let purchaseSiteId = "imjonmiller";
        // let nodeWalletName = "GAIA";
        // let nftId = "11";
        // let nftHash = "879AC47859D43EBB3525FADDE74AE60A29C2BB267B9660BD7452879225C09F0C";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659396578533;
        // let userWalletName = "LEXIE1980";
        // let purchaseSiteId = "Lexie1984";
        // let nodeWalletName = "GAIA";
        // let nftId = "12";
        // let nftHash = "1E584CAE5FA217E3E15A83D9E2CEF5F840FDF9FA693574821CF4A92D2EE58225";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "500";
        // let userMaxReward = "1";
        // let startTs = 1659400408935;
        // let userWalletName = "EASYWALLET";
        // let purchaseSiteId = "Easy";
        // let nodeWalletName = "GAIA";
        // let nftId = "13";
        // let nftHash = "03E00E0F4AB362DBEF34CFB17C6120DF358B59290E370F7A7168150E12AAF088";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);

        // let purchasePrice = "10000";
        // let userMaxReward = "20";
        // let startTs = 1659404317525;
        // let userWalletName = "HALOPOWER";
        // let purchaseSiteId = "HaloPower";
        // let nodeWalletName = "GAIA";
        // let nftId = "14";
        // let nftHash = "2F9970730F4F1915096EA030F34A1B28F9035626ABF2B0CFC1F1819AFFC726F0";

        // await txSchUser.txUserBuyAddReq(userWalletName, purchaseSiteId, nodeWalletName, nftId, nftHash, purchasePrice, userMaxReward, startTs);
    }
    else
    {
        retVal = false;
        logger.error("[CLI] " + cmd + ' is an incorrect command. See is --help');
    }

    return retVal;
}
