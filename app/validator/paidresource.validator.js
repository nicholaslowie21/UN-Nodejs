const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.createPaidResource = [
    body('title').exists(),
    body('desc').exists(),
    body('category').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('price').exists().custom(async value => {
        var temp = parseFloat(value)
        if(!temp)
            return Promise.reject('Price is not valid');
        
    })
]

exports.updatePaidResource = [
    body('paidResourceId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('category').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('price').exists().custom(async value => {
        var temp = parseFloat(value)
        if(!temp)
            return Promise.reject('Price is not valid');
        
    })
]

exports.purchaseRequest = [
    body('paidResourceId').exists(),
    body('projectId').exists()
]

exports.deletePaidResPicture = [
    body('paidResourceId').exists(),
    body('indexes').exists()
]

exports.statusPaidResPicture = [
    body('paidResourceId').exists(),
    body('status').exists().custom(async value => {
        if(value != 'active' && value != 'inactive' && value !='deleted')
        return Promise.reject('Status is invalid!')
    })
]

exports.paidResDetail = [
    query('paidResourceId').exists()
]

exports.othersPaidResources = [
    query('accountId').exists(),
    query('accountType').exists()
]