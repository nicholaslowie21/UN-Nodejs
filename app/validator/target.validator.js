const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.possibleTarget = [
    body('SDGs').exists().custom(async value => {
        let valid = true;
        
        value.forEach( sdg => {
            if(sdg<1 || sdg > 17) {
                valid = false;
            }
        })

        if(!valid) 
            return Promise.reject('SDGs are not valid')
    })
]

exports.updateAccountTarget = [
    body('targetIds').exists()
]

exports.updateProjectTarget = [
    body('targetIds').exists(),
    body('projectId').exists()
]

exports.getProjectTarget = [
    query('projectId').exists()
]

exports.getAccountTarget = [
    query('accountId').exists(),
    query('accountType').exists()
]

exports.redeemReward = [
    body('rewardId').exists()
]

exports.rewardDetail = [
    query('rewardId').exists()
]

exports.filteredReward = [
    query('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    query('status').exists()
]

exports.filteredMarketplaceReward = [
    query('minTier').exists().custom(async value => {
        if(value != "gold" && value != "silver" && value != "bronze")
            return Promise.reject('the tier is invalid!')
    })
]

exports.allReward = [
    query('status').exists()
]

exports.getVoucher = [
    query('status').exists()
]

exports.claimVoucher = [
    body('voucherId').exists()
]

exports.validateReward = [
    body('rewardId').exists(),
    body('action').exists().custom(async value => {
        if(value != "approve" && value !="reject")
            return Promise.reject('Invalid action!')
    })
]

exports.deleteReward = [
    body('rewardId').exists()
]