const moment = require('moment-timezone')
const { project, report } = require('../models')
const db = require('../models')
const Institution = db.institution
const User = db.users
const Project = db.project
const Reward = db.reward
const Report = db.report
const Helper = require('../service/helper.service')
const nodeCountries = require('node-countries');


exports.createReport = async function (req, res){

    var theCountry = "false"

    if(req.body.reportType === "institution") theCountry =  await checkInstitutionCountry(req.body.targetId)
    else if(req.body.reportType === "user") theCountry =  await checkUserCountry(req.body.targetId)
    else if(req.body.reportType === "project") theCountry =  await checkProjectCountry(req.body.targetId)
    else if(req.body.reportType === "reward") theCountry =  await checkRewardCountry(req.body.targetId)
    
    if(theCountry === "false")
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such target!',
        data: {}
    });

    if(req.id === req.body.targetId)
    return res.status(500).json({
        status: 'error',
        msg: 'You cannot report your own account!',
        data: {}
    });

    var reporter;

    if(req.type === "institution") {
        reporter = await Institution.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    } else if (req.type === "user") {
        reporter = await User.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });
    }

    if(!reporter)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    
    const report = new Report({
        title: req.body.title,
        summary: req.body.summary,
        reportType: req.body.reportType,
        targetId: req.body.targetId,
        status:"pending",
        country: theCountry,
        reporterId: req.id,
        reporterType: req.type
    })
    
    report.save(report)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Report successfully created',
            data: { report: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.filteredStatus = async function (req, res){

    reports = await Report.find({ 'status': req.query.status }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such reports!',
            data: {}
        });
    });

    if(!reports)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such reports!',
        data: {}
    });

    reports.reverse();

    var theList = [];

    for(var i = 0; i < reports.length; i++) {
        var theReport = {
            id: reports[i].id,
            title: reports[i].title,
            summary: reports[i].summary,
            reportType: reports[i].reportType,
            targetId: reports[i].targetId,
            status: reports[i].status,
            country: reports[i].country,
            reporterId: reports[i].reporterId,
            reporterType: reports[i].reporterType,
            createdAt: reports[i].createdAt,
            updatedAt: reports[i].updatedAt,
            targetName:"",
            targetUsername:"",
            targetImg:"",
            targetTitle:""
        }
        await getReporterInfo(theReport)
        
        if(theReport.reportType === "institution") await getInstitutionInfo(theReport)
        else if(theReport.reportType === "user") await getUserInfo(theReport)
        else if(theReport.reportType === "project") await getProjectInfo(theReport)
        else if(theReport.reportType === "reward") await getRewardInfo(theReport)

        if(theReport.targetUsername === "" && theReport.targetTitle === "") continue
        
        if(theReport.reporterName != "") theList.push(theReport)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Filtered reports successfully retrieved',
        data: { reports: theList }
    });
}

exports.updateReport = async function (req, res){
    var report = await Report.findOne({ '_id': req.body.reportId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such report!',
            data: {}
        });
    });

    if(!report)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such report!',
        data: {}
    });

    if(req.role === "user" || req.role === "institution")
    return res.status(500).json({
        status: 'error',
        msg: 'You are not authorized!',
        data: {}
    });

    report.status = req.body.status

    await report.save(report)
    .then(data => { 
        return res.status(200).json({
            status: 'success',
            msg: 'Report status successfully updated',
            data: { report: data }
        });
    }).catch( err => {
        return res.status(500).json({
            status: 'success',
            msg: 'Something went wrong! Error: '+err.message,
            data: { }
        });
    })
    var theTime = moment(report.updatedAt).tz('Asia/Singapore').format("LLL").toString()
    
    Helper.createNotification("Report", "Your report: "+ report.title + " status has been updated to "+req.body.status+" on "+theTime, report.reporterId, report.reporterType )

}

exports.filteredRegional = async function (req, res){

    let theCountry = nodeCountries.getCountryByName(req.query.country);
    req.query.country = theCountry.name;
    
    reports = await Report.find({ 'status': req.query.status, 'country':req.query.country }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such report!',
            data: {}
        });
    });

    if(!reports)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such reports!',
        data: {}
    });

    reports.reverse();

    var theList = [];

    for(var i = 0; i < reports.length; i++) {
        var theReport = {
            id: reports[i].id,
            title: reports[i].title,
            summary: reports[i].summary,
            reportType: reports[i].reportType,
            targetId: reports[i].targetId,
            status: reports[i].status,
            country: reports[i].country,
            reporterId: reports[i].reporterId,
            reporterType: reports[i].reporterType,
            createdAt: reports[i].createdAt,
            updatedAt: reports[i].updatedAt,
            targetName:"",
            targetUsername:"",
            targetImg:"",
            targetTitle:""
        }
        await getReporterInfo(theReport)

        if(theReport.reportType === "institution") await getInstitutionInfo(theReport)
        else if(theReport.reportType === "user") await getUserInfo(theReport)
        else if(theReport.reportType === "project") await getProjectInfo(theReport)
        else if(theReport.reportType === "reward") await getRewardInfo(theReport)

        if(theReport.targetUsername === "" && theReport.targetTitle === "") continue
        

        if(theReport.reporterName != "") theList.push(theReport)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Filtered reports successfully retrieved',
        data: { reports: theList }
    });
}

exports.reportDetail = async function (req, res){
    var report = await Report.findOne({ '_id': req.query.reportId}, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such report!',
            data: {}
        });
    });

    if(!report)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such report!',
        data: {}
    });

    var theReport = JSON.parse(JSON.stringify(report))

    await getReporterInfo(theReport)
    if(theReport.reportType === "institution") await getInstitutionInfo(theReport)
    else if(theReport.reportType === "user") await getUserInfo(theReport)
    else if(theReport.reportType === "project") await getProjectInfo(theReport)
    else if(theReport.reportType === "reward") await getRewardInfo(theReport)

    if(theReport.targetUsername === "" && theReport.targetTitle === "")
    return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong when retrieving target!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Report detail successfully retrieved',
        data: { report: theReport }
    });
}

exports.myReport = async function (req, res){

    reports = await Report.find({ 'status': req.query.status, 'reporterId':req.id, 'reporterType':req.type }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!reports)
    return res.status(500).json({
        status: 'error',
        msg: 'There was no such reports!',
        data: {}
    });

    reports.reverse();

    var theList = [];

    for(var i = 0; i < reports.length; i++) {
        var theReport = {
            id: reports[i].id,
            title: reports[i].title,
            summary: reports[i].summary,
            reportType: reports[i].reportType,
            targetId: reports[i].targetId,
            status: reports[i].status,
            country: reports[i].country,
            reporterId: reports[i].reporterId,
            reporterType: reports[i].reporterType,
            createdAt: reports[i].createdAt,
            updatedAt: reports[i].updatedAt,
            targetName:"",
            targetUsername:"",
            targetImg:"",
            targetTitle:""
        }
        await getReporterInfo(theReport)

        if(theReport.reportType === "institution") await getInstitutionInfo(theReport)
        else if(theReport.reportType === "user") await getUserInfo(theReport)
        else if(theReport.reportType === "project") await getProjectInfo(theReport)
        else if(theReport.reportType === "reward") await getRewardInfo(theReport)

        if(theReport.targetUsername === "" && theReport.targetTitle === "") continue
        if(theReport.reporterName != "") theList.push(theReport)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'My filtered reports successfully retrieved',
        data: { reports: theList }
    });
}

async function checkInstitutionCountry(theId) {
    var institution = await Institution.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return "false"
            }
        });
    

    if(!institution) {
        console.log("error [reportController]: Such account not found!")
        return "false"
    }

    return institution.country
}

async function getInstitutionInfo(theItem) {
    var institution = await Institution.findOne({ '_id': theItem.targetId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    

    if(!institution) {
        console.log("error [reportController]: Such account not found!")
        return
    }

    theItem.targetName = institution.name
    theItem.targetUsername = institution.username
    theItem.targetImg = institution.ionicImg
}

async function getUserInfo(theItem) {
    var user = await User.findOne({ '_id': theItem.targetId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    

    if(!user) {
        console.log("error [reportController]: Such account not found!")
        return
    }

    theItem.targetName = user.name
    theItem.targetUsername = user.username
    theItem.targetImg = user.ionicImg
}

async function getProjectInfo(theItem) {
    var project = await Project.findOne({ '_id': theItem.targetId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    

    if(!project) {
        console.log("error [reportController]: Such account not found!")
        return
    }

    theItem.targetTitle = project.title
}

async function getRewardInfo(theItem) {
    var reward = await Reward.findOne({ '_id': theItem.targetId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    

    if(!reward) {
        console.log("error [reportController]: Such account not found!")
        return
    }

    theItem.targetTitle = reward.title
}

async function checkUserCountry(theId) {
    var user = await User.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return "false"
            }
        });
    

    if(!user) {
        console.log("error [reportController]: Such account not found!")
        return "false"
    }

    return user.country
}

async function checkProjectCountry(theId) {
    var project = await Project.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return "false"
            }
        });
    

    if(!project) {
        console.log("error [reportController]: Such account not found!")
        return "false"
    }

    return project.country
}

async function checkRewardCountry(theId) {
    var reward = await Reward.findOne({ '_id': theId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return "false"
            }
        });
    

    if(!reward) {
        console.log("error [reportController]: Such account not found!")
        return "false"
    }

    return reward.country
}

async function getReporterInfo(theItem) {
    var owner;

    if(theItem.reporterType === "user") {
        owner = await User.findOne({ '_id': theItem.reporterId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.reporterType === 'institution') {
        owner = await Institution.findOne({ '_id': theItem.reporterId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getReporterInfo) Such account not found!")
        return
    }

    theItem.reporterImgPath = owner.ionicImg
    theItem.reporterUsername = owner.username
    theItem.reporterName = owner.name 
}