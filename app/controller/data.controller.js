const moment = require('moment-timezone')
const { contribution, institution } = require('../models')
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
const PaidResource = db.paidresource
const ProjectReq = db.projectreq
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
    
    var knowledges = await Knowledge.find( {}, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var manpowers = await Manpower.find({  }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var venues = await Venue.find({  }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var items = await Item.find({ }, function (err) {
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

    var paidresources = await PaidResource.find({ }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var paidResourcesNum = paidresources.length

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
            paidResourcesNum: paidResourcesNum
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

exports.resourcesTypesNumbers = async function (req, res){
    
    var startString = req.query.year+"-01-01"
    var startDate = moment(startString).tz('Asia/Singapore')
    var endString = req.query.year+"-12-31"
    var endDate = moment(endString).tz('Asia/Singapore')

    var knowledges = await Knowledge.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var manpowers = await Manpower.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var venues = await Venue.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var items = await Item.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

    var resourcesTypesNum = []
    resourcesTypesNum.push(manpowers.length)
    resourcesTypesNum.push(items.length)
    resourcesTypesNum.push(venues.length)
    resourcesTypesNum.push(knowledges.length)

    return res.status(200).json({
        status: 'success',
        msg: 'Resource Types Numbers data retrieved',
        data: { 
            resourcesTypesNum: resourcesTypesNum
        }
    });
}

exports.contributionsNumbers = async function (req, res){
    
    var startString = req.query.year+"-01-01"
    var startDate = moment(startString).tz('Asia/Singapore')
    var endString = req.query.year+"-12-31"
    var endDate = moment(endString).tz('Asia/Singapore')

    var contributions = await Contribution.find({ 'status': 'active', 'createdAt': {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: '+err,
            data: {}
        });
    });

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
        msg: 'Contributions Numbers data retrieved',
        data: { 
            contributionsTypesNum: contributionsTypesNum
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
    cumulativeThisYear[0] += totalPrior
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

exports.dataBySDG = async function (req, res){
    
    var startDate = moment(req.query.startDate).tz('Asia/Singapore')
    var endDate = moment(req.query.endDate).tz('Asia/Singapore')

    var dataItems = await createDataBySDGItems();

    var users = await User.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    var institutions = await Institution.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    for(var i = 0; i < users.length; i++) {
        var accountSDGs = users[i].SDGs

        for(var j = 0; j < accountSDGs.length; j++) {
            dataItems[accountSDGs[j]-1].accountsNum++
        }
    }

    for(var i = 0; i < institutions.length; i++) {
        var accountSDGs = institutions[i].SDGs

        for(var j = 0; j < accountSDGs.length; j++) {
            dataItems[accountSDGs[j]-1].accountsNum++
        }
    }

    var projects = await Project.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    for(var i = 0; i < projects.length; i++) {
        var projectSDGs = projects[i].SDGs

        for(var j = 0; j < projectSDGs.length; j++) {
            dataItems[projectSDGs[j]-1].projectsNum++
        }
    }

    var contributions = await Contribution.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });
    
    for(var i = 0; i < contributions.length; i++) {
        var projectId = contributions[i].projectId

        var project = await getProject(projectId)
        if(!project) continue

        var projectSDGs = project.SDGs

        for(var j = 0; j < projectSDGs.length; j++) {
            dataItems[projectSDGs[j]-1].contributionsNum++
        }

        if(contributions[i].resType != 'money') continue
        var projectRequest = await getProjectReq(contributions[i].requestId)
        if(!projectRequest) continue
        
        for(var j = 0; j < projectSDGs.length; j++) {
            dataItems[projectSDGs[j]-1].fundingRaisedSum += projectRequest.moneySum
        }
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Data by SDGs successfully retrieved',
        data: { dataBySDGs: dataItems }
    });
}

exports.dataByCountries = async function (req, res){
    
    var startDate = moment(req.query.startDate).tz('Asia/Singapore')
    var endDate = moment(req.query.endDate).tz('Asia/Singapore')

    let dataItemsMap = new Map()
    
    var users = await User.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    var institutions = await Institution.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    for(var i = 0; i < users.length; i++) {
        var country = users[i].country
        if(country ==='') continue

        updateItemMap(dataItemsMap,country,1,0,0,0)
    }

    for(var i = 0; i < institutions.length; i++) {
        var country = institutions[i].country
        if(country ==='') continue

        updateItemMap(dataItemsMap,country,1,0,0,0)
    }

    var projects = await Project.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    for(var i = 0; i < projects.length; i++) {
        var country = projects[i].country
        if(country ==='') continue

        updateItemMap(dataItemsMap,country,0,1,0,0)
    }

    var contributions = await Contribution.find({ createdAt: {$gte: startDate, $lte: endDate} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! '+err,
            data: {}
        });
    });

    for(var i = 0; i < contributions.length; i++) {
        var country = contributions[i].country
        if(country ==='') continue

        updateItemMap(dataItemsMap,country,0,0,1,0)

        if(contributions[i].resType != 'money') continue
        var projectRequest = await getProjectReq(contributions[i].requestId)
        if(!projectRequest) continue
        
        updateItemMap(dataItemsMap,country,0,0,0,projectRequest.moneySum)
    }

    var theList = [];
    for(let value of dataItemsMap.values()){
        theList.push(value)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Data by countries successfully retrieved',
        data: { dataByCountries: theList }
    });
}

function updateItemMap(hm, country, accountsNum, projectsNum, contributionsNum, fundingRaised) {
    var dataItem;

    if(!hm.has(country)) dataItem = createDataByCountryItem(country)
    else dataItem = hm.get(country)
    
    dataItem.accountsNum += accountsNum
    dataItem.projectsNum += projectsNum
    dataItem.contributionsNum += contributionsNum,
    dataItem.fundingRaised += fundingRaised

    hm.set(country, dataItem)
}

function createDataByCountryItem(country) {
    var dataItem = {
        country: country, 
        accountsNum: 0, 
        projectsNum: 0, 
        contributionsNum: 0, 
        fundingRaised: 0
    }

    return dataItem
}

async function getProjectReq(projectReqId) {
    var projectreq = await ProjectReq.findOne({ '_id': projectReqId }, function (err) {
        if (err){
            console.log(err)
            return
        } 
    });

    if(!projectreq) return
    return projectreq
}

async function getProject(projectId) {
    var project = await Project.findOne({ '_id': projectId }, function (err) {
        if (err){
            console.log(err)
            return
        } 
    });

    if(!project) return
    return project
}

async function createDataBySDGItems () {
    var theList = []

    for(var i = 0; i < 17; i++){
        var dataItem = {
            sdgTitle:'',
            accountsNum:0, 
            projectsNum:0, 
            contributionsNum: 0, 
            fundingRaisedSum: 0
        }
        theList.push(dataItem)
    }
    
    theList[0].sdgTitle = '1: No Poverty'
    theList[1].sdgTitle = '2: Zero Hunger'
    theList[2].sdgTitle = '3: Good Health and Well-Being'
    theList[3].sdgTitle = '4: Quality Education'
    theList[4].sdgTitle = '5: Gender Equality'
    theList[5].sdgTitle = '6: Clean Water and Sanitation'
    theList[6].sdgTitle = '7: Affordable and Clean Energy'
    theList[7].sdgTitle = '8: Decent Work and Economic Growth'
    theList[8].sdgTitle = '9: Industry, Innovation, and Infrastructure'
    theList[9].sdgTitle = '10: Reduced Inequalities'
    theList[10].sdgTitle = '11: Sustainable Cities and Communities'
    theList[11].sdgTitle = '12: Responsible Consumption and Production'
    theList[12].sdgTitle = '13: Climate Action'
    theList[13].sdgTitle = '14: Life Below Water'
    theList[14].sdgTitle = '15: Life on Land'
    theList[15].sdgTitle = '16: Peace, Justice, and Strong Institutions'
    theList[16].sdgTitle = '17: Partnerships for the Goals'

    return theList
}