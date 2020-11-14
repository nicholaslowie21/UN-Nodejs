const { body, query, validationResult, oneOf, check } = require('express-validator');
const nodeCountries =  require("node-countries");

exports.viewProject = [
    query('projectId').exists()
]

exports.searchProjects = [
    query('code').exists()
]

exports.getAdmins = [
    query('projectId').exists()
]

exports.getKPIs = [
    query('projectId').exists()
]

exports.getResourceNeeds = [
    query('projectId').exists()
]

exports.createPost = [
    body('projectId').exists(),
    body('title').exists(),
    body('desc').exists()
]

exports.createPostComment = [
    body('postId').exists(),
    body('comment').exists()
]

exports.createProjectEvent = [
    body('projectId').exists(),
    body('title').exists(),
    body('start').exists(),
    body('end').exists(),
    body('eventType').exists().custom(async value => {
        if(value != 'public' && value != 'private')
            return Promise.reject('Event type is not valid')
    })
]

exports.updateProjectEvent = [
    body('eventId').exists(),
    body('title').exists(),
    body('start').exists(),
    body('end').exists(),
    body('eventType').exists().custom(async value => {
        if(value != 'public' && value != 'private')
            return Promise.reject('Event type is not valid')
    })
]

exports.deleteProjectEvent = [
    query('eventId').exists()
]

exports.deletePostComment = [
    body('commentId').exists()
]

exports.updatePost = [
    body('postId').exists(),
    body('title').exists(),
    body('desc').exists()
]

exports.deletePost = [
    body('postId').exists()
]

exports.getPost = [
    query('projectId').exists()
]

exports.getPostDetail = [
    query('postId').exists()
]

exports.getComment = [
    query('postId').exists()
]

exports.getEvent = [
    query('projectId').exists()
]

exports.getContributions = [
    query('projectId').exists()
]

exports.getAccountContributions = [
    query('accountId').exists(),
    query('accountType').exists()
]

exports.createProject = [
    body('title').exists(),
    body('desc').exists(),
    body('rating').exists().custom(async value => {
        if(value<1 || value>5)
            return Promise.reject('Rating is not valid')
    }),
    body('SDGs').exists().custom(async value => {
        let valid = true;

        value.forEach( sdg => {
            if(sdg<1 || sdg > 17) {
                valid = false;
            }
        })

        if(!valid) 
            return Promise.reject('SDGs are not valid')
    })
]

exports.updateProject = [
    body('projectId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('country').exists().custom(async value => {
        let theCountry = nodeCountries.getCountryByName(value);
        if (!theCountry)
            return Promise.reject('Country is not valid');
    }),
    body('rating').exists().custom(async value => {
        if(value<1 || value>5)
            return Promise.reject('Rating is not valid')
    }),
    body('SDGs').exists().custom(async value => {
        let valid = true;

        value.forEach( sdg => {
            if(sdg<1 || sdg > 17) {
                valid = false;
            }
        })

        if(!valid) 
            return Promise.reject('SDGs are not valid')
    })
]

exports.deleteProject = [
    body('projectId').exists()
]

exports.deleteKPI = [
    body('kpiId').exists()
]

exports.createKPI = [
    body('projectId').exists(),
    body('title').exists(),
    body('desc').exists()
]

exports.updateKPI = [
    body('kpiId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('completion').exists().custom(async value => {
        if(value<0 || value >100)
            return Promise.reject('Completion rate is not valid')
    })
]

exports.editAdmin = [
    body('projectId').exists(),
    body('admins').exists()
]

exports.addAdmin = [
    body('projectId').exists(),
    body('userId').exists()
]

exports.completeProject = [
    body('projectId').exists()
]

exports.createResourceNeed = [
    body('projectId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('resourceType').exists().custom(async value =>{
        if(value!="manpower" && value!="venue" && value!="knowledge" && value!="money" && value!="item")
        return Promise.reject('Resource Need type is not valid')
    })
]

exports.editResourceNeed = [
    body('needId').exists(),
    body('title').exists(),
    body('desc').exists(),
    body('total').exists().toInt(),
    body('completion').exists().custom(async value =>{
        if(value<0 || value >100)
        return Promise.reject('Completion rate is invalid');
    })
]

exports.deleteResourceNeed = [
    body('needId').exists()
]

exports.removeContribution = [
    body('contributionId').exists()
]

exports.updateContributionRating = [
    body('contributionId').exists(),
    body('theRating').exists().custom(async value => {
        if(value < 1 || value > 5)
            return Promise.reject('The rating is invalid')
    })
]

exports.searchUsers = [
    query('username').exists()
]
