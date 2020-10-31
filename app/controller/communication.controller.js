const moment = require('moment-timezone')
const db = require('../models')
const Announcement = db.announcement
const User = db.users
const Helper = require('../service/helper.service')

exports.createAnnouncement = async function (req, res){
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    const announcement = new Announcement({
		title: req.body.title,
        desc: req.body.desc,
        isDeleted: false
    });
    
    announcement.save(announcement)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Announcement successfully created',
            data: { announcement: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.editAnnouncement = async function (req, res) {
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    var announcement = await Announcement.findOne({ '_id': req.body.announcementId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!announcement)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such announcement!',
        data: {}
    });

    announcement.title = req.body.title
    announcement.desc = req.body.desc
    
    announcement.save(announcement)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Announcement successfully updated',
            data: { announcement: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.deleteAnnouncement = async function (req, res) {
    let account; 

    account = await User.findOne({ '_id': req.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!account)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    if(account.role === "user")
    return res.status(500).json({
        status: 'error',
        msg: 'Only admin is authorized to perform this!',
        data: {}
    });

    const announcement = await Announcement.findOne({ '_id': req.query.announcementId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the announcement!',
            data: {}
        });
    });

    if(!announcement) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such announcement!',
        data: {}
    });

    announcement.isDeleted = true;

    announcement.save(announcement)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Announcement successfully deleted',
            data: { announcement: data }
        });
     }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.getAnnouncement = async function (req, res) {

    const announcements = await Announcement.find({ 'isDeleted': false }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving announcements!',
            data: {}
        });
    });

    if(!announcements) 
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such announcements!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Announcements successfully retrieved',
        data: { announcements: announcements }
    });
}
