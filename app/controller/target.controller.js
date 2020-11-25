const moment = require('moment-timezone')
const db = require('../models')
const Target = db.target
const User = db.users
const Institution = db.institution
const Project = db.project
const fs = require('fs');
const multer = require('multer');
const csvtojson = require("csvtojson");
const path = require('path');
const Helper = require('../service/helper.service')

exports.possibleTarget = async function (req, res){
    
    var sdgs = req.body.SDGs

    var targets = await Target.find({ 'SDG': {$in: sdgs} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the targets!',
            data: {}
        });
    }); 
    targets.sort(function(a, b){
        if(a.SDG === b.SDG) {
            var theA = ""+a.targetCode
            var theB = ""+b.targetCode
            if(theA<theB) return -1
            else return 1
        }            
        else
            return a.SDG - b.SDG
            
    })
    
    return res.status(200).json({
        status: 'success',
        msg: 'Possible targets retrieved',
        data: { targets: targets }
    });
}

exports.updateAccountTarget = async function (req, res){
    
    var account;

    if(req.type === "user") {
        account = await User.findOne({ '_id': req.id }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    } else if (req.type === 'institution') {
        account = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    }

    if(!account) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account!',
        data: {}
    });
    
    var targetIds = req.body.targetIds
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 
    }

    account.targets = targetIds

    account.save(account)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Account targets updated',
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

exports.updateProjectTarget = async function (req, res){
    
    var project = await Project.findOne({ '_id': req.body.projectId }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
    });
    

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving project!',
        data: {}
    });
    

    var targetIds = req.body.targetIds
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 
    }

    project.targets = targetIds

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project targets updated',
            data: { project: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.accountTargetLists = async function (req, res){
    
    var account;

    if(req.query.accountType === "user") {
        account = await User.findOne({ '_id': req.query.accountId }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    } else if (req.query.accountType === 'institution') {
        account = await Institution.findOne({ '_id': req.query.accountId }, function (err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong!'+err.message,
                    data: {}
                });
            }
        });
    }

    if(!account) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving account!',
        data: {}
    });
    
    var targetIds = account.targets
    var theList = [];
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 

        theList.push(target)
    }

    theList.sort(function(a, b){
        if(a.SDG === b.SDG) {
            var theA = ""+a.targetCode
            var theB = ""+b.targetCode
            if(theA<theB) return -1
            else return 1
        }            
        else
            return a.SDG - b.SDG
            
    })

    return res.status(200).json({
        status: 'success',
        msg: 'Account targets retrieved',
        data: { targets: theList }
    });
}

exports.getProjectTarget = async function (req, res){
    
    var project = await Project.findOne({ '_id': req.query.projectId }, function (err) {
        if (err) {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong!'+err.message,
                data: {}
            });
        }
    });


    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Something went wrong while retrieving project!',
        data: {}
    });

    var targetIds = project.targets
    var theList = [];
    for(var i = 0; i < targetIds.length; i++){
        var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the target!',
                data: {}
            });
        }); 

        theList.push(target)
    }

    theList.sort(function(a, b){
        if(a.SDG === b.SDG) {
            var theA = ""+a.targetCode
            var theB = ""+b.targetCode
            if(theA<theB) return -1
            else return 1
        }            
        else
            return a.SDG - b.SDG
            
    })

    return res.status(200).json({
        status: 'success',
        msg: 'Project targets retrieved',
        data: { targets: theList }
    });
}


