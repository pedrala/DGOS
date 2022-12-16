//
const cryptoSsl = require('./../../../../addon/crypto-ssl');
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

//finlchain block start time
module.exports.BASE_UTC_MS = 1554076800000; // Tue Apr 01 2019 00:00:00"

//calculate past days since Tue Apr 01 2019 00:00:00"
module.exports.ecoCountDays = () => {
    //
    let curMs = util.getDateMS();

    let pastMs = curMs - this.BASE_UTC_MS;

    let countDays = Math.ceil(pastMs / define.FIXED_VAL.ONE_DAY_MS);

    return (countDays);
}

//calculate past years since Tue Apr 01 2019 00:00:00"  =3
module.exports.ecoCountYears = () => {
    //
    let countDays = this.ecoCountDays();

    //
    let countYears = Math.floor(countDays / define.FIXED_VAL.MAX_PERIOD);
    //let countYears = Math.ceil(countDays / define.FIXED_VAL.MAX_PERIOD);

    return (countYears);
}

//calculate years to give a reward since Tue Apr 01 2019 00:00:00"  = 4
module.exports.ecoCountYearsForReward = () => {
    //
    let countDays = this.ecoCountDays();

    //
    let countYears = Math.ceil(countDays / define.FIXED_VAL.MAX_PERIOD);

    return (countYears);
}


//get leftOver days after last reward day.
module.exports.ecoCountDaysOfLastYear = () => {
    //
    let countDays = this.ecoCountDays();

    let countDaysOfLastYear = countDays % define.FIXED_VAL.MAX_PERIOD;

    return (countDaysOfLastYear);
}
