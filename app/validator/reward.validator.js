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
    body('minTier').exists().custom(async value => {
        if(value != "gold" && value != "silver" && value != "bronze")
            return Promise.reject('the tier is invalid!')
    }),
    body('startDate').exists()
]

exports.createRequestReward = [
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
    body('minTier').exists().custom(async value => {
        if(value != "gold" && value != "silver" && value != "bronze")
            return Promise.reject('the tier is invalid!')
    }),
    body('startDate').exists(),
    body('externalName').exists()
]

exports.updateReward = [
    body('rewardId').exists(),
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
    body('minTier').exists().custom(async value => {
        if(value != "gold" && value != "silver" && value != "bronze")
            return Promise.reject('the tier is invalid!')
    }),
    body('startDate').exists()
]

exports.cancelReward = [
    body('rewardId').exists()
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
    query('tier').exists().custom(async value => {
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

exports.transferVoucher = [
    body('voucherId').exists(),
    body('targetId').exists()
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