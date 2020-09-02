const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users;
const nodeCountries = require('node-countries');

exports.updateUserProfile = async function (req, res, next) {
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
    const user = await Users.findOne({ 'username': req.body.username }, function (err, person) {
        if (err) return handleError(err);
    });
    
    user.name = req.body.name;
    user.email = req.body.email;
    user.bio = req.body.bio;
    user.occupation = req.body.occupation;
    user.country = req.body.country;

    user.save(user)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'User profile successfully updated',
            data: { user: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });   
}