const moment = require('moment-timezone')
const db = require('../models')
const Manpower = db.manpower
const User = db.users

exports.viewUserManpower = async function (req, res) {
    const user = await User.findOne({ '_id': req.query.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!user) 
    return res.status(500).json({
        status: 'error',
        msg: 'User not found!',
        data: {}
    });
    
    const manpowers = await Manpower.find({ 'owner': user.id, 'ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!manpowers) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Manpower resource successfully retrieved',
        data: { manpowers: manpowers }
    });
}