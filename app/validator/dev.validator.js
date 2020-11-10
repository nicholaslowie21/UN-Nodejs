const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.addTarget = [
    body('desc').exists(),
    body('SDG').exists().custom(async value => {
        let valid = true;

            if(value < 1 || value > 17) {
                valid = false;
            }
        
        if(!valid) 
            return Promise.reject('SDG are not valid')
    }),
    body('targetCode').exists()
]
