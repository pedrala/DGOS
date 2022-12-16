//
const fs = require('fs');
const os = require('os');

//
const cryptoSsl = require("./../../../addon/crypto-ssl");

//
const NETCONF_JSON = JSON.parse(fs.readFileSync("./../../conf/netconf.json"));

//
module.exports.KEY_PATH = {
    PW_SEED: NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.SEED, 
    PW_MARIA : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.MARIA, 
    PW_SHARD : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.SHARD, 
    PW_REPL_NN : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.REPL_NN, 
    PW_REPL_ISAG : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.REPL_ISAG, 
}

// 
module.exports.CFG_PATH = {
    CONTRACT_ACTIONS : NETCONF_JSON.DEF_INFO.CONTRACT_ACTIONS, 
    CONTRACT_ERROR : NETCONF_JSON.DEF_INFO.CONTRACT_ERROR, 
    NODE_CFG : NETCONF_JSON.DEF_INFO.NODE_CFG,
    MARIA : {
        DB_HOST : NETCONF_JSON.DB.MARIA.HOST, 
        DB_PORT : NETCONF_JSON.DB.MARIA.PORT, 
        DB_USER : NETCONF_JSON.DB.MARIA.USER, 
        PW_MARIA : cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_MARIA),
        REPL_USERS : [
            NETCONF_JSON.DB.REPL.USER_ISAG, 
            NETCONF_JSON.DB.REPL.USER_NN, // Temperary Used
        ],
        REPL_USERS_PW : [
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_REPL_ISAG), 
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_REPL_NN), // Temperary Used
        ], 
        SHARD_USERS : [
            NETCONF_JSON.DB.SHARD.USER_IS, 
        ],
        SHARD_USERS_PW : [
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_SHARD), 
        ]
    },
}

module.exports.MARIA_CONFIG = {
    host: this.CFG_PATH.MARIA.DB_HOST,
    port: this.CFG_PATH.MARIA.DB_PORT,
    user: this.CFG_PATH.MARIA.DB_USER,
    password: this.CFG_PATH.MARIA.PW_MARIA,
    // database: ...
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectionLimit : 10
};

// Contract Error Code
module.exports.CONTRACT_ERROR_JSON = JSON.parse(fs.readFileSync(this.CFG_PATH.CONTRACT_ERROR));

// Contract Class
module.exports.CONTRACT_ACTIONS_JSON = JSON.parse(fs.readFileSync(this.CFG_PATH.CONTRACT_ACTIONS));

// Version info
module.exports.paddy = (num, padLen, padChar) => {
    var pad_char = typeof padChar !== 'undefined' ? padChar : '0';
    var pad = new Array(1 + padLen).join(pad_char);

    return (pad + num).slice(-pad.length);
}

const getVerInfo = () => {
    //
    let mainVerInfo = '0';
    let subVerInfo = '0';

    //
    let lineArr = fs.readFileSync(this.CFG_PATH.NODE_CFG).toString().split('\n');

    for (idx in lineArr) {
        if (lineArr[idx].includes('VER_INFO_MAIN')) {
            mainVerInfo = lineArr[idx].split(' ')[2];
        }
        else if (lineArr[idx].includes('VER_INFO_SUB')) {
            subVerInfo = lineArr[idx].split(' ')[2];
        }
    }

    let verInfo = mainVerInfo + '.' + this.paddy(subVerInfo, 4);

    return verInfo;
}

//
module.exports.VERSION_INFO = getVerInfo();

module.exports.CMD_ENCODING = {
    encoding: 'utf8'
}

module.exports.DB_TEST_MODE = false;
module.exports.DB_TEST_MODE_DROP = false;

// VM true? 1, false? 0
module.exports.IS_VM = 1;

module.exports.TEST_HW_INO = {
    CPU: "Test CPU",
    MEMSIZE: 8,
    MEMSPEED: 1200
}

// IP Control
module.exports.IP_ASSIGN = {
    CTRL: 0,
    DATA: 0,
    REPL: 0
};

// ISAG URL
module.exports.ISAG_URL = "api.finlscan.org"; // '203.238.181.162'; // FINL
if (os.hostname().includes('puri'))
{
    // module.exports.ISAG_URL = '220.86.111.197' // PURI
    // module.exports.ISAG_URL = "http://purichain.com"
    this.ISAG_URL = "www.purichain.com";
}
else if (os.hostname().includes('finlt'))
{
    this.ISAG_URL = "apih.finlscan.org"; // '203.238.181.164'; // FINLT
}
else if (os.hostname().includes('finld'))
{
    // this.ISAG_URL = '10.10.11.220'; // FINLD
    this.ISAG_URL = 'apid.finlscan.org'; // FINLD
}
else if (os.hostname().includes('purit'))
{
    this.ISAG_URL = "www.purichain.com"; // PURIT
}

module.exports.ISAG_PORT = '3000';

module.exports.ISAG_CONFIG = {
    family: 4,
    host: this.ISAG_URL,
    port: this.ISAG_PORT,
    json: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
}

// FBN URL
module.exports.FBN_URL = "api.finlscan.org"; // '203.238.181.162'; // FINL
if (os.hostname().includes('puri'))
{
    // module.exports.FBN_URL = '220.86.111.197' // PURI
    // module.exports.FBN_URL = "http://purichain.com"
    this.FBN_URL = "www.purichain.com";
}
else if (os.hostname().includes('finlt'))
{
    this.FBN_URL = "apih.finlscan.org"; // '203.238.181.164'; // FINLT
}
else if (os.hostname().includes('finld'))
{
    // this.FBN_URL = '10.10.11.220'; // FINLD
    this.FBN_URL = 'apid.finlscan.org'; // FINLD
}

module.exports.FBN_PORT = '4000';

module.exports.FBN_CONFIG = {
    family: 4,
    host: this.FBN_URL,
    port: this.FBN_PORT,
    json: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
}

// User CLI URL
module.exports.USER_CLI_URL = "127.0.0.1";
module.exports.USER_CLI_PORT = '3000';

module.exports.USER_CLI_CONFIG = {
    family: 4,
    host: this.USER_CLI_URL,
    port: this.USER_CLI_PORT,
    json: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
}

//
// FBN URL
module.exports.SCH_URL = '175.207.29.22';
//module.exports.SCH_URL = '220.86.111.196';
// module.exports.SCH_URL = '10.10.11.12';
module.exports.SCH_PORT = '14501';

module.exports.SCH_CONFIG = {
    family: 4,
    host: this.SCH_URL,
    port: this.SCH_PORT,
    json: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
}
