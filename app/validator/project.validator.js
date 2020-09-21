const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.viewProject = [
    query('code').exists()
]

exports.searchProjects = [
    query('code').exists()
]

exports.createProject = [
    body('title').exists(),
    body('desc').exists(),
    body('rating').exists().custom(async value => {
        if(value<1 || value>5)
            return Promise.reject('Rating is not valid')
    }),
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

exports.updateProject = [
    body('projectId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('rating').exists().custom(async value => {
        if(value<1 || value>5)
            return Promise.reject('Rating is not valid')
    }),
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

exports.deleteProject = [
    body('projectId').exists()
]

exports.editAdmin = [
    body('admins').exists()
]