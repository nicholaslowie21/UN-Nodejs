const moment = require('moment-timezone')
const { contribution } = require('../models')
const db = require('../models')
const Target = db.target
const User = db.users
const Institution = db.institution
const Project = db.project
const Money = db.money
const Knowledge = db.knowledge
const Manpower = db.manpower
const Venue = db.venue
const Item = db.item
const Contribution = db.contribution
const Helper = require('../service/helper.service')

exports.getDashboard = async function (req, res){
    var users = await User.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the users!',
            data: {}
        });
    }); 

    var institutions = await Institution.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the institutions!',
            data: {}
        });
    });
    
    var activeAccNum = users.length + institutions.length
    
    var knowledges = await Knowledge.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var manpowers = await Manpower.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var venues = await Venue.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var items = await Item.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var resourcesNum = knowledges.length + manpowers.length + venues.length + items.length

    var contributions = await Contribution.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var contributionsNum = contributions.length

    var fundings = await Money.find({ 'status': 'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var fundingRaised = 0

    for(var i = 0; i < fundings.length; i++) {
        fundingRaised += fundings[i].sum
    }

    var projectsOngoing = await Project.find({ 'status': 'ongoing' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var projectsCompleted = await Project.find({ 'status': 'completed' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var projectsOngoingNum = projectsOngoing.length
    var projectsCompletedNum = projectsCompleted.length

    var resourcesTypesNum = []
    resourcesTypesNum.push(manpowers.length)
    resourcesTypesNum.push(items.length)
    resourcesTypesNum.push(venues.length)
    resourcesTypesNum.push(knowledges.length)

    var fundingContribution = 0;
    var knowledgeContribution = 0;
    var itemContribution = 0;
    var venueContribution = 0;
    var manpowerContribution = 0;

    for(var i = 0; i < contributions.length; i++){
        if(contributions[i].resType === "money") fundingContribution++;
        else if(contributions[i].resType === "knowledge") knowledgeContribution++;
        else if(contributions[i].resType === "item") itemContribution++;
        else if(contributions[i].resType === "venue") venueContribution++;
        else if(contributions[i].resType === "manpower") manpowerContribution;
    }

    var contributionsTypesNum = []
    contributionsTypesNum.push(manpowerContribution)
    contributionsTypesNum.push(itemContribution)
    contributionsTypesNum.push(venueContribution)
    contributionsTypesNum.push(knowledgeContribution)
    contributionsTypesNum.push(fundingContribution)

    return res.status(200).json({
        status: 'success',
        msg: 'Dashboard data retrieved',
        data: { 
            activeAccNum: activeAccNum,
            resourcesNum: resourcesNum,
            contributionsNum: contributionsNum,
            fundingRaised: fundingRaised,
            projectsOngoingNum: projectsOngoingNum,
            projectsCompletedNum: projectsCompletedNum,
            resourcesTypesNum: resourcesTypesNum,
            contributionsTypesNum: contributionsTypesNum
        }
    });
}

exports.accountsChart = async function (req, res){
    
    var startString = req.query.year+"-01-01"
    var startDate = moment(startString).tz('Asia/Singapore')
    var endString = req.query.year+"-12-31"
    var endDate = moment(endString).tz('Asia/Singapore')

    var users = await User.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the users!',
            data: {}
        });
    }); 

    var usersPerMonth = [0,0,0,0,0,0,0,0,0,0,0,0]
    for(var i = 0; i < users.length; i++) {
        var theEntryMonth = moment(users[i].createdAt).format("MM")
        usersPerMonth[theEntryMonth-1]++
    }

    var institutions = await Institution.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the institutions!',
            data: {}
        });
    }); 
    
    var institutionsPerMonth = [0,0,0,0,0,0,0,0,0,0,0,0]
    for(var i = 0; i < institutions.length; i++) {
        var theEntryMonth = moment(institutions[i].createdAt).format("MM")
        institutionsPerMonth[theEntryMonth-1]++
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Accounts Bar Chat data retrieved',
        data: { 
            usersPerMonth: usersPerMonth,
            institutionsPerMonth: institutionsPerMonth
        }
    });
}

exports.cumulativeProjects = async function (req, res){
    
    var startString = req.query.year+"-01-01"
    var startDate = moment(startString).tz('Asia/Singapore')
    var endString = req.query.year+"-12-31"
    var endDate = moment(endString).tz('Asia/Singapore')

    var projectsPrior = await Project.find({ createdAt: {$lt: startDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the projects!',
            data: {}
        });
    }); 

    var totalPrior = projectsPrior.length

    var projectsThisYear = await Project.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the projects!',
            data: {}
        });
    }); 
    
    var cumulativeThisYear = [0,0,0,0,0,0,0,0,0,0,0,0]
    for(var i = 0; i < projectsThisYear.length; i++) {
        var theEntryMonth = moment(projectsThisYear[i].createdAt).format("MM")
        cumulativeThisYear[theEntryMonth-1]++
    }

    for(var i = 1; i <= 11; i++) {
        cumulativeThisYear[i] += cumulativeThisYear[i-1]
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Cumulative projects graph data retrieved',
        data: { 
            cumulativeThisYear: cumulativeThisYear
        }
    });
}