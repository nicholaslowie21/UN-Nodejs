const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.requestReward = [
    body('title').exists(),
    body('desc').exists(),
    body('point').exists().custom(async value => {
        if(value<=0)
            return Promise.reject('Point is invalid')
    }),
    body('quota').exists().custom(async value => {
        if(value<=0)
            return Promise.reject('Quota is invalid')
    }),
    body('endDate').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('minTier').exists()
]

exports.cancelReward = [
    body('rewardId').exists()
]

exports.rewardDetail = [
    query('rewardId').exists()
]