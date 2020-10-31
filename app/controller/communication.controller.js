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

    const announcement = await Announcement.findOne({ '_id': req.body.announcementId }, function (err) {
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
    // Like reward marketplace to not have this
    // let account; 

    // account = await User.findOne({ '_id': req.id }, function (err) {
    //     if (err)
    //     return res.status(500).json({
    //         status: 'error',
    //         msg: 'There was no such account!',
    //         data: {}
    //     });
    // });

    // if(!account)
    // return res.status(500).json({
    //     status: 'error',
    //     msg: 'There was no such account!',
    //     data: {}
    // });

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

    var theList = [];

    for(var i = 0; i < announcements.length; i++) {
        var announcement = {
            id:"",
            title: "",
            desc: "",
            isDeleted: false,
            createdAt:""
        }

        announcement.id = announcements[i].id
        announcement.title = announcements[i].title
        announcement.desc = announcements[i].desc
        announcement.isDeleted = announcements[i].isDeleted
        announcement.createdAt = announcements[i].createdAt

        // I think don't need this
        // await getRequesterInfo(announcement)
        // if(announcement.accountName === "") continue

        theList.push(announcement)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Announcements successfully retrieved',
        data: { announcements: theList }
    });
}
