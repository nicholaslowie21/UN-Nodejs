const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.viewProject = [
    query('projectId').exists()
]

exports.searchProjects = [
    query('code').exists()
]

exports.getAdmins = [
    query('projectId').exists()
]

exports.getKPIs = [
    query('projectId').exists()
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

exports.deleteKPI = [
    body('kpiId').exists()
]

exports.createKPI = [
    body('projectId').exists(),
    body('title').exists(),
    body('desc').exists()
]

exports.updateKPI = [
    body('kpiId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('completion').exists().custom(async value => {
        if(value<0 || value >100)
            return Promise.reject('Completion rate is not valid')
    })
]

exports.editAdmin = [
    body('projectId').exists(),
    body('admins').exists()
]

exports.completeProject = [
    body('projectId').exists()
]

exports.createResourceNeed = [
    body('projectId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('resourceType').exists().custom(async value =>{
        if(value!="manpower" && value!="venue" && value!="knowledge" && value!="money" && value!="item")
        return Promise.reject('Resource Need type is not valid')
    })
]

exports.searchUsers = [
    query('username').exists()
]
