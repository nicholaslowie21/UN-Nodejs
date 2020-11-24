const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.accountsChart = [
    query('year').exists().custom(async value => {
        value = parseInt(value)
        if(Number.isInteger(value) === false)
            return Promise.reject('Year not valid!')
        if(value < 1800 && value >2100)
            return Promise.reject('Year is out of range!')
        
    })
]

exports.cumulativeProjects = [
    query('year').exists().custom(async value => {
        value = parseInt(value)
        if(Number.isInteger(value) === false)
            return Promise.reject('Year not valid!')
        if(value < 1800 && value >2100)
            return Promise.reject('Year is out of range!')
        
    })
]

exports.dataBySDG = [
    query('startDate').exists(),
    query('endDate').exists()
]

exports.dataByCountries = [
    query('startDate').exists(),
    query('endDate').exists()
]