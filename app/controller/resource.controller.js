const moment = require('moment-timezone')
const db = require('../models')
const Manpower = db.manpower
const User = db.users
const Knowledge = db.knowledge
const Item = db.item
const Venue = db.venue
const Institution = db.institution

exports.viewUserKnowledge = async function (req, res) {
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
    
    const knowledges = await Knowledge.find({ 'owner.theId': user.id, 'owner.ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledges) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Knowledge resource successfully retrieved',
        data: { knowledges: knowledges }
    });
}

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

exports.viewUserItem = async function (req, res) {
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
    
    const items = await Item.find({ 'owner': user.id, 'ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!items) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Item resource successfully retrieved',
        data: { items: items }
    });
}

exports.viewUserVenue = async function (req, res) {
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
    
    const venues = await Venue.find({ 'owner': user.id, 'ownerType': 'user', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venues) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Venue resource successfully retrieved',
        data: { venues: venues }
    });
}

exports.viewInstitutionKnowledge = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const knowledges = await Knowledge.find({ 'owner.theId': institution.id, 'owner.ownerType': 'institution', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!knowledges) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Knowledge resource successfully retrieved',
        data: { knowledges: knowledges }
    });
}

exports.viewInstitutionItem = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const items = await Item.find({ 'owner': institution.id, 'ownerType': 'institution', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!items) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Item resource successfully retrieved',
        data: { items: items }
    });
}

exports.viewInstitutionVenue = async function (req, res) {
    const institution = await Institution.findOne({ '_id': req.query.institutionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!institution) 
    return res.status(500).json({
        status: 'error',
        msg: 'Institution not found!',
        data: {}
    });
    
    const venues = await Venue.find({ 'owner': institution.id, 'ownerType': 'institution', 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    if(!venues) 
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong while retrieving!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Venue resource successfully retrieved',
        data: { venues: venues }
    });
}