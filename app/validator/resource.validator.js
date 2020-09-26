const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.viewResource = [
    query('userId').exists()
]

exports.viewKnowledgeDetails = [
    query('knowledgeId').exists()
]

exports.viewManpowerDetails = [
    query('manpowerId').exists()
]

exports.viewVenueDetails = [
    query('venueId').exists()
]

exports.activateItem = [
    body('itemId').exists()
]

exports.viewItemDetails = [
    query('itemId').exists()
]

exports.viewKnowledgeDetails = [
    query('knowledgeId').exists()
]

exports.activateManpower = [
    body('manpowerId').exists()
]

exports.activateKnowledge = [
    body('knowledgeId').exists()
]

exports.activateVenue = [
    body('venueId').exists()
]

exports.viewInstitutionResource = [
    query('institutionId').exists()
]

exports.createItemResource = [
    body('title').exists(),
    body('desc').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    })
]

exports.createVenueResource = [
    body('title').exists(),
    body('desc').exists(),
    body('address').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    })
]

exports.createManpowerResource = [
    body('title').exists(),
    body('desc').exists()
]

exports.createKnowledgeResource = [
    body('title').exists(),
    body('desc').exists()
]

exports.updateKnowledgeResource = [
    body('knowledgeId').exists(),
    body('title').exists(),
    body('desc').exists()
]

exports.updateKnowledgeResourceOwner = [
    body('knowledgeId').exists(),
    body('owners').exists()
]

exports.addKnowledgeResourceOwner = [
    body('knowledgeId').exists(),
    body('userId').exists()
]

exports.deleteKnowledgeResourceOwner = [
    body('knowledgeId').exists(),
    body('targetId').exists(),
    body('targetType').exists()
]

exports.updateManpowerResource = [
    body('manpowerId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    })
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