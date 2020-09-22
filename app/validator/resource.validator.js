const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.viewResource = [
    query('userId').exists()
]

exports.viewInstitutionResource = [
    query('institutionId').exists()
]

exports.createItemResource = [
    body('title').exists(),
    body('desc').exists()
]

exports.createVenueResource = [
    body('title').exists(),
    body('desc').exists(),
    body('address').exists()
]

exports.updateItemResource = [
    body('itemId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    })
]

exports.updateVenueResource = [
    body('venueId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('address').exists()
]