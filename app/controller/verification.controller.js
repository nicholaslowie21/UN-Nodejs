const moment = require('moment-timezone')
const db = require('../models')
const Users = db.users
const Institutions = db.institution
const Helper = require('../service/helper.service')

exports.institutionRequest = async function (req, res){
    const user = await Users.find({ '_id': req.body.id }, function (err, info) {
        if (err) return handleError(err);
    });

    const institutions = await Institutions.find({ 'status': 'pending' }, function (err, info) {
        if (err) return handleError(err);
    });

    if(!user) {
        return res.status(500).json({
            status: 'error',
            msg: 'No such user found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for new institutions account request',
        data: { institutions: institutions }
    });
}