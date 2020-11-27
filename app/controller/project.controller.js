const moment = require('moment-timezone')
const db = require('../models')
const Projects = db.project
const Institutions = db.institution
const Users = db.users
const KPI = db.kpi
const ResourceNeed = db.resourceneed
const Contribution = db.contribution
const ProjectReq = db.projectreq
const ResourceReq = db.resourcereq
const Manpower = db.manpower
const Knowledge = db.knowledge
const Item = db.item
const Venue = db.venue
const Money = db.money
const Badge = db.badge
const ProjectPost = db.projectpost
const PostComment = db.postcomment
const ProjectEvent = db.projectevent
const { default: ShortUniqueId } = require('short-unique-id');
const uid = new ShortUniqueId();
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const nodeCountries =  require("node-countries");
const Helper = require('../service/helper.service')
const sharp = require('sharp')

var postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/postPictures'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = "PostPicture-"+req.body.projectId+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var createPost = multer({ 
    storage: postStorage,
    fileFilter: function(_req, file, cb){
        checkFileType(file, cb);
    }   
})

var updatePostStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/postPictures'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = "PostPicture-"+req.body.postId+"-"+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var updatePost = multer({ 
    storage: updatePostStorage,
    fileFilter: function(_req, file, cb){
        checkFileType(file, cb);
    }   
})

function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
}

exports.multerCreatePost = createPost.single('postImg');

exports.multerUpdatePost = updatePost.single('postImg');

exports.createPost = async function (req, res){

    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to create this project post!',
        data: {}
    });

    var pathString = ""
    
    if(req.file) {
        sharp('./'+req.file.path).toBuffer().then(
            (data) => {
                sharp(data).resize(800).toFile('./'+req.file.path, (err,info) => {
                    if(err)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'Something went wrong during image upload! ',
                        data: {}
                    });
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong during upload! ',
                    data: {}
                });
            }
        )

        pathString = "/public/uploads/postPictures/"+req.thePath;
    }

    const projectPost = new ProjectPost({
		title: req.body.title,
		desc: req.body.desc,
		accountId: req.id,
		accountType: req.type,
		status: 'active',
        projectId: req.body.projectId,
        imgPath: pathString
    });
    
    projectPost.save(projectPost)
    .then(data => {
        var action = "Account created a Project Post: "+ data.title +" ("+data.id+")" +" for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project added a post: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Post successfully created',
            data: { projectPost: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.updatePost = async function (req, res){

    const projectPost = await ProjectPost.findOne({ '_id': req.body.postId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!projectPost) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project post not found!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': projectPost.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this project post!',
        data: {}
    });


    projectPost.title = req.body.title
	projectPost.desc = req.body.desc
	projectPost.accountId = req.id
	projectPost.accountType = req.type
		
    
    if(req.file) {
        sharp('./'+req.file.path).toBuffer().then(
            (data) => {
                sharp(data).resize(800).toFile('./'+req.file.path, (err,info) => {
                    if(err)
                    return res.status(500).json({
                        status: 'error',
                        msg: 'Something went wrong during image upload! ',
                        data: {}
                    });
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong during upload! ',
                    data: {}
                });
            }
        )
        projectPost.imgPath = "/public/uploads/postPictures/"+req.thePath
    }
    
    projectPost.save(projectPost)
    .then(data => {
        var action = "Account updated a Project Post: "+ data.title +" ("+data.id+")" +" for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project updated a post: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Post successfully updated',
            data: { projectPost: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deletePost = async function (req, res){
    const projectPost = await ProjectPost.findOne({ '_id': req.body.postId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!projectPost) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project post not found!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': projectPost.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this project post!',
        data: {}
    });

    projectPost.status = "deleted"

    projectPost.save(projectPost)
    .then(data => {
        var action = "Account deleted a Project Post: "+ data.title +" ("+data.id+")" +" for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project deleted a post: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Post successfully deleted',
            data: { projectPost: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deletePostPic = async function (req, res){
    const projectPost = await ProjectPost.findOne({ '_id': req.body.postId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!projectPost) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project post not found!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': projectPost.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this project post!',
        data: {}
    });

    projectPost.imgPath = ""

    projectPost.save(projectPost)
    .then(data => {
        var action = "Account deleted a Project Post picture: "+ data.title +" ("+data.id+")" +" for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project deleted a post picture: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Post Picture successfully deleted',
            data: { projectPost: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.getPosts = async function (req, res){
    const projectPosts = await ProjectPost.find({ 'projectId': req.query.projectId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!projectPosts) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project post not found!',
        data: {}
    });

    var theList = []

    for(var i =0; i < projectPosts.length; i++) {
        var projectPost = {
            "id":"",
            "title": "",
            "desc": "",
            "accountId": "",
            "accountType": "",
            "status": "",
            "projectId": "",
            "imgPath": "",
            "accountName":"",
            "accountUsername":"",
            "accountPic":"",
            "createdAt":"",
            "updatedAt":""
        }

        projectPost.id = projectPosts[i].id
        projectPost.title = projectPosts[i].title
        projectPost.desc = projectPosts[i].desc
        projectPost.accountId = projectPosts[i].accountId
        projectPost.accountType = projectPosts[i].accountType
        projectPost.status = projectPosts[i].status
        projectPost.projectId = projectPosts[i].projectId
        projectPost.imgPath = projectPosts[i].imgPath   
        projectPost.createdAt = projectPosts[i].createdAt 
        projectPost.updatedAt = projectPosts[i].updatedAt

        await getAccountInfo(projectPost)
        if(projectPost.accountName === "") continue

        theList.push(projectPost)
    }

    theList.reverse();

    return res.status(200).json({
        status: 'success',
        msg: 'Project Posts successfully retrieved',
        data: { projectPosts: theList }
    });

}

exports.getPostDetail = async function (req, res){
    const theprojectPost = await ProjectPost.findOne({ '_id': req.query.postId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!theprojectPost) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project post not found!',
        data: {}
    });

    var projectPost = {
        "id":"",
        "title": "",
        "desc": "",
        "accountId": "",
        "accountType": "",
        "status": "",
        "projectId": "",
        "imgPath": "",
        "accountName":"",
        "accountUsername":"",
        "accountPic":"",
        "createdAt":"",
        "updatedAt":""
    }

    projectPost.id = theprojectPost.id
    projectPost.title = theprojectPost.title
    projectPost.desc = theprojectPost.desc
    projectPost.accountId = theprojectPost.accountId
    projectPost.accountType = theprojectPost.accountType
    projectPost.status = theprojectPost.status
    projectPost.projectId = theprojectPost.projectId
    projectPost.imgPath = theprojectPost.imgPath   
    projectPost.createdAt = theprojectPost.createdAt 
    projectPost.updatedAt = theprojectPost.updatedAt
    
    await getAccountInfo(projectPost)
    if(projectPost.accountName === "")
    return res.status(400).json({
        status: 'error',
        msg: 'There was an issue with retrieving the post creator!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Project Post detail successfully retrieved',
        data: { projectPost: projectPost }
    });

}

exports.createPostComment = async function (req, res){

    const projectPost = await ProjectPost.findOne({ '_id': req.body.postId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!projectPost) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project post not found!',
        data: {}
    });
    
    const postComment = new PostComment({
		comment: req.body.comment,
		postId: req.body.postId,
		accountId: req.id,
		accountType: req.type,
		status: 'active'
    });
    
    postComment.save(postComment)
    .then(data => {
        var action = "Account commented "+ data.comment +" ("+data.id+")" +" on a Project Post: "+ projectPost.title +" ("+projectPost.id+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Post comment successfully created',
            data: { postComment: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.createProjectEvent = async function (req, res){
    const project = await Projects.findOne({ '_id': req.body.projectId, 'status':'ongoing' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project event!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such ongoing project not found!',
        data: {}
    });

    var startDate = moment(req.body.start).tz('Asia/Singapore')
    var endDate = moment(req.body.end).tz('Asia/Singapore')
    
    
    const projectEvent = new ProjectEvent({
		title: req.body.title,
		start: startDate.format("YYYY-MM-DD"),
		end: endDate.format("YYYY-MM-DD"),
		projectId: req.body.projectId,
        status: 'active',
        eventType: req.body.eventType.toLowerCase()
    });
    
    projectEvent.save(projectEvent)
    .then(data => {
        var action = "Account created a milestone "+ data.title +" ("+data.id+")" +" for a project: "+ project.title +" ("+project.id+","+ project.code +")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project added a milestone: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Event successfully created',
            data: { projectEvent: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.updateProjectEvent = async function (req, res){
    const projectEvent = await ProjectEvent.findOne({ '_id': req.body.eventId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project event!',
            data: {}
        });
    });

    if(!projectEvent) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project event not found!',
        data: {}
    });
    
    var startDate = moment(req.body.start).tz('Asia/Singapore')
    var endDate = moment(req.body.end).tz('Asia/Singapore')

    	projectEvent.title = req.body.title,
		projectEvent.start= startDate.format("YYYY-MM-DD"),
		projectEvent.end = endDate.format("YYYY-MM-DD"),
		projectEvent.eventType = req.body.eventType.toLowerCase()
    
    projectEvent.save(projectEvent)
    .then(data => {
        var action = "Account updated a milestone "+ data.title +" ("+data.id+")" +" for a project: "+ " ("+data.projectId+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project updated a milestone: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",data.projectId)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Event successfully updated!',
            data: { projectEvent: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deleteProjectEvent = async function (req, res){
    const projectEvent = await ProjectEvent.findOne({ '_id': req.query.eventId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project event!',
            data: {}
        });
    });

    if(!projectEvent) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project event not found!',
        data: {}
    });
    
    projectEvent.status = "deleted"
    
    projectEvent.save(projectEvent)
    .then(data => {
        var action = "Account deleted a milestone "+ data.title +" ("+data.id+")" +" for a project: "+ " ("+data.projectId+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project deleted a milestone: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project Event successfully deleted!',
            data: { projectEvent: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.getPublicEvents = async function (req, res){

    const projectEvents = await ProjectEvent.find({ 'projectId': req.query.projectId, 'status':'active', 'eventType':'public' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project events!',
            data: {}
        });
    });

    if(!projectEvents) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project events not found!',
        data: {}
    });
    
    return res.status(200).json({
        status: 'success',
        msg: 'Project public events successfully retrieved!',
        data: { projectEvents: projectEvents }
    });
}

exports.getAllEvents = async function (req, res){

    const projectEvents = await ProjectEvent.find({ 'projectId': req.query.projectId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project events!',
            data: {}
        });
    });

    if(!projectEvents) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project events not found!',
        data: {}
    });
    
    return res.status(200).json({
        status: 'success',
        msg: 'Project events successfully retrieved!',
        data: { projectEvents: projectEvents }
    });
}

exports.deletePostComment = async function (req, res){

    const postComment = await PostComment.findOne({ '_id': req.body.commentId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!postComment) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active project post comment not found!',
        data: {}
    });

    if(postComment.accountId != req.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete this comment!',
        data: {}
    });

    postComment.status = "deleted"
    
    postComment.save(postComment)
    .then(data => {
        var action = "Account deleted a comment "+ data.comment +" ("+data.id+")" +" on a Project Post: "+" ("+data.postId+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Post comment successfully deleted',
            data: { postComment: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.getComments = async function (req, res){
    const postComments = await PostComment.find({ 'postId': req.query.postId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!postComments) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such active post comments not found!',
        data: {}
    });

    var theList = []

    for(var i =0; i < postComments.length; i++) {
        var postComment = {
            "id":"",
            "postId":"",
            "comment": "",
            "accountId": "",
            "accountType": "",
            "status": "",
            "accountName":"",
            "accountUsername":"",
            "accountPic":"",
            "createdAt":"",
            "updatedAt":""
        }

        postComment.id = postComments[i].id
        postComment.postId = postComments[i].postId
        postComment.comment = postComments[i].comment
        postComment.accountId = postComments[i].accountId
        postComment.accountType = postComments[i].accountType
        postComment.status = postComments[i].status
        postComment.createdAt = postComments[i].createdAt 
        postComment.updatedAt = postComments[i].updatedAt

        await getAccountInfo(postComment)
        if(postComment.accountName === "") continue

        theList.push(postComment)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Project Post Comments successfully retrieved',
        data: { postComments: theList }
    });

}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'public/uploads/projectPicture'
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: async function (req, file, cb) {
        let extentsion = file.originalname.split('.')
        let thePath = 'ProjectPic-'+req.body.projectId+Date.now()+'.'+extentsion[extentsion.length - 1]; 
        req.thePath = thePath;
        cb(null, thePath)
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})
var upload = multer({ 
    storage: storage,
    fileFilter: function(_req, file, cb){
        checkFileType(file, cb);
    }     
})

function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
}

exports.multerUpload = upload.single('projectPic');

exports.projectPicture = async function (req, res){
    if(!req.body.projectId) {
        return res.status(400).json({
            status: 'error',
            msg: 'Project id is empty! ',
            data: {}
        });
    }

    
    if(!req.file) {
        return res.status(400).json({
            status: 'error',
            msg: 'No picture uploaded! ',
            data: {}
        });
    }

    sharp('./'+req.file.path).toBuffer().then(
        (data) => {
            sharp(data).resize(800).toFile('./'+req.file.path, (err,info) => {
                if(err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'Something went wrong during image upload! ',
                    data: {}
                });
            });
        }
    ).catch(
        (err) => {
            console.log(err);
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong during upload! ',
                data: {}
            });
        }
    )

    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such project!',
            data: {}
        });
    });

    if(!project || project.status!='ongoing')
    return res.status(400).json({
        status: 'error',
        msg: 'Project is suspended or currently not ongoing!',
        data: {}
    });

    var host,hostType,theUsername,country,target;

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        host = institution.id
        hostType = "institution"
        country = institution.country
        theUsername = institution.username
        target = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        host = user.id
        hostType = "user"
        country = user.country
        theUsername = user.username
        target = user
    }

    let valid = false;

    if(project.host != req.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this project!',
        data: {}
    });

    project.imgPath = "/public/uploads/projectPicture/"+req.thePath;

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project picture successfully updated',
            data: { project: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    var action = "Account updated picture for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
    Helper.createAuditLog(action,req.type,req.id)

    var action = "Project updated its picture: "+ req.file.path 
    
    Helper.createAuditLog(action,"project",project.id)
}

exports.viewProject = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Project successfully retrieved',
        data: { targetProject: project }
    });
}

exports.searchProjects = async function (req, res){

    var rgx = new RegExp(req.query.code, "i");
    
    const projects = await Projects.find({ 'code': { $regex: rgx } }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong when retrieving projects! ',
            data: {}
        });
    });

    if(!projects) {
        return res.status(400).json({
            status: 'error',
            msg: 'No project found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the users',
        data: { projects: projects }
    });
}

exports.createProject = async function (req, res){
    let host = ""
    let hostType = ""
    let country = ""
    let theUsername = ""
    var target;

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        host = institution.id
        hostType = "institution"
        country = institution.country
        theUsername = institution.username
        target = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(user.isVerified != "true")
        return res.status(400).json({
            status: 'error',
            msg: 'Account not authorized to create project! Not verified yet.',
            data: {}
        });

        host = user.id
        hostType = "user"
        country = user.country
        theUsername = user.username
        target = user
    }

    var tempSDGs = req.body.SDGs;
    
    var theSDGs = [];

    tempSDGs.forEach(sdg => {
        if(!theSDGs.includes(sdg))
            theSDGs.push(sdg);
    })

    theSDGs.sort(function(a, b){return a - b});

    const project = new Projects({
        title: req.body.title,
        desc: req.body.desc,
        rating: req.body.rating,
        country: country,
        code: theUsername+"-"+uid(),
        SDGs: theSDGs,
        host: host,
        hostType: hostType,
        status: "ongoing"

    });

    project.save(project)
    .then(data => {

        let tempProjects = target.projects
        tempProjects.push(data.id); 
        target.projects = tempProjects
        
        target.save(target).catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        });

        
        var action = "Account created a project: "+project.title+" ("+data.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        action = "Project created"
    
        Helper.createAuditLog(action,"project",data.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully created!',
            data: { project: data, account: target }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    title = "Project Created"
    desc = "Created a project with title " + project.title
    accountId = host
    accountType = hostType 
    
    Helper.createProfileFeed(title,desc,accountId,accountType)

}

exports.postUpdateProject = async function (req, res) {
    let theCountry = nodeCountries.getCountryByName(req.body.country);
    req.body.country = theCountry.name;
    
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit this project!',
        data: {}
    });

    var tempSDGs = req.body.SDGs;
    
    var theSDGs = [];

    tempSDGs.forEach(sdg => {
        if(!theSDGs.includes(sdg))
            theSDGs.push(sdg);
    })

    theSDGs.sort(function(a, b){return a - b});

    project.title = req.body.title;
    project.desc = req.body.desc;
    project.country = req.body.country;
    project.rating = req.body.rating;
    project.SDGs = theSDGs;

    var targetIds = project.targets
    var theList = [];
    if(targetIds){
        for(var i = 0; i < targetIds.length; i++){
            var target = await Target.findOne({ '_id': targetIds[i] }, function (err) {
                if (err)
                return res.status(500).json({
                    status: 'error',
                    msg: 'There was an issue retrieving the target!',
                    data: {}
                });
            }); 

            if(theSDGs.includes(target.SDG)) theList.push(target.id)
        }
    }

    project.targets = theList

    project.save(project)
    .then(data => {
        var action = "Account updated a project: "+project.title+" ("+project.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        action = "Project details updated"
    
        Helper.createAuditLog(action,"project",data.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully updated',
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

exports.completeProject = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });


    if(project.host != req.body.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to mark this project as completed!',
        data: {}
    });

    var targetHost;

    if (project.hostType === "institution") {
        targetHost = await Institutions.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });

    } else if (project.hostType === "user") {
        targetHost = await Users.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });
    }

    project.status = "completed";

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully mark as completed!',
            data: { project: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let subject = 'KoCoSD Project Completion'
    let theMessage = `
        <h1>Congratulations on completing your project!</h1>
        <p>The project code ${project.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(targetHost.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    title = "Project Completion"
    desc = "Completed a project :" + project.title
    accountId = targetHost.id
    accountType = project.hostType
        
    Helper.createProfileFeed(title,desc,accountId,accountType)
    
    desc = "Completed a project :" + project.title + " as an admin."
    
    var theAdmins = project.admins;
    for(var i = 0 ; i < theAdmins.length; i++) {
        Helper.createProfileFeed(title,desc,theAdmins[i],"user")
        Helper.createNotification("Project", "Congratzz! Project: "+ project.title+" has been completed.", theAdmins[i], "user")

        var adminContribution = {
            contributor : theAdmins[i],
            contributorType: "user"
        }
        var theAdminTotalPoint = (project.rating * 5) + 10;
        await awardContributionPoint(adminContribution, theAdminTotalPoint)
    }
    
    var action = "Account mark project as completed for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
    Helper.createAuditLog(action,req.type,req.id)

    var action = "Project marked as completed" 
    
    Helper.createAuditLog(action,"project",project.id)

    var founderContribution = {
        contributor : project.host,
        contributorType: project.hostType
    }
    var theTotalPoint = (project.rating * 5) + 15;
    await awardContributionPoint(founderContribution, theTotalPoint)
    
    const contributions = await Contribution.find({ 'projectId': req.body.projectId, 'status': 'active' }, function (err) {
        if (err) console.log('error: (completeProject) Something went wrong when retrieving contributions')
    });

    for(var x = 0; x < contributions.length; x++) {
        var thePoint = contributions[i].rating * project.rating
        console.log(contributions[i])
        await awardContributionPoint(contributions[i],thePoint)
        
        Helper.createNotification("Project", "Congratzz! Project: "+ project.title+" has been completed.", contributions[i].contributor, contributions[i].contributorType )

    }

}

async function awardContributionPoint(contribution, totalPoint) {
    var owner;

    if(contribution.contributorType === "user") {
        owner = await Users.findOne({ '_id': contribution.contributor }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (contribution.contributorType === 'institution') {
        owner = await Institutions.findOne({ '_id': contribution.contributor }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        return
    }

    if(contribution.contributorType === "user") owner.wallet = owner.wallet + totalPoint
    owner.points = owner.points + totalPoint
    await owner.save().catch(err => {
        console.log("Something went wrong when saving points!")
        return
    });

    if(owner.points>=100) {
        const badge = await Badge.findOne({ 'accountId': contribution.contributor, 'accountType': contribution.contributorType, 'tier':'bronze' }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });

        if(!badge){

            const newBadge = new Badge({
                title : 'Bronze',
                description : 'Achieved this on ' + moment().tz('Asia/Singapore').format('YYYY-MM-DD'),
                imgPath : "/public/badges/bronze.png",
                accountId: contribution.contributor,
                accountType: contribution.contributorType,
                tier: 'bronze'
            })

            await newBadge.save(newBadge).catch(err => {
                console.log("Something went wrong when creating badge!")
            });

            owner.tier = 'bronze'
        }
    }

    if(owner.points>=400) {
        const badge = await Badge.findOne({ 'accountId': contribution.contributor, 'accountType': contribution.contributorType, 'tier':'silver' }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });

        if(!badge){

            const newBadge = new Badge({
                title : 'Silver',
                description : 'Achieved this on ' + moment().tz('Asia/Singapore').format('YYYY-MM-DD'),
                imgPath : "/public/badges/silver.png",
                accountId: contribution.contributor,
                accountType: contribution.contributorType,
                tier: 'silver'
            })

            await newBadge.save(newBadge).catch(err => {
                console.log("Something went wrong when creating badge!")
            });

            owner.tier = 'silver'
        }
    }

    if(owner.points>=800) {
        const badge = await Badge.findOne({ 'accountId': contribution.contributor, 'accountType': contribution.contributorType, 'tier':'gold' }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });

        if(!badge){

            const newBadge = new Badge({
                title : 'Gold',
                description : 'Achieved this on ' + moment().tz('Asia/Singapore').format('YYYY-MM-DD'),
                imgPath : "/public/badges/gold.png",
                accountId: contribution.contributor,
                accountType: contribution.contributorType,
                tier: 'gold'
            })

            await newBadge.save(newBadge).catch(err => {
                console.log("Something went wrong when creating badge!")
            });

            owner.tier = 'gold'
        }
    }

    await owner.save().catch(err => {
        console.log("Something went wrong when saving account's tier!")
        return
    });


}

exports.deleteProject = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to closed this project!',
        data: {}
    });

    var target;

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        target = institution
        target.projects.pull(project.id)
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(user.isVerified != "true" || user.status != 'active')
        return res.status(400).json({
            status: 'error',
            msg: 'Account not authorized to create project!',
            data: {}
        });

        target = user
        target.projects.pull(project.id)
    }

    project.status = "closed"

    var admins = project.admins;
    var adminsArr = [];

    for(var i = 0; i < admins.length; i++) {
        const user = await Users.findOne({ '_id': admins[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the user!',
                data: {}
            });    
        })

        if (!user) {
            return res.status(400).json({
                status: 'error',
                msg: 'Such user is not found!',
                data: {}
            });  
        }
        user.projects.pull(project.id);
        adminsArr.push(user)

    }

    for(var i = 0; i < adminsArr.length; i++) {
        adminsArr[i].save().catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        })
    }

    project.save(project)
    .then(data => {
        target.save(target).catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        });

        var action = "Account deleted a project: "+project.title+" ("+data.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        action = "Project deleted"
    
        Helper.createAuditLog(action,"project",data.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Project successfully deleted',
            data: { project: data, account: target }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let subject = 'KoCoSD Project Deletion'
    let theMessage = `
        <h1>A project that you are currently in is deleted</h1>
        <p>The project code ${project.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    for(var i = 0; i < adminsArr.length; i++) {
        Helper.sendEmail(adminsArr[i].email, subject, theMessage, function (info) {
            if (!info) {
                console.log('Something went wrong while trying to send email!')
            } 
        })
        
        Helper.createNotification("Project", "Project: "+ project.title+" has been deleted.", adminsArr[i].id, "user")
    }

    const contributions = await Contribution.find({ 'projectId': project.id, 'status':'active' }, function (err) {
        if (err) console.log("Error: "+err.message)
    });

    if(!contributions)
        console.log("Something went wrong when sending email to contributors after project deletion")
    
    for(var i = 0 ; i < contributions.length; i++) {
        removeContributionEmail(contributions[i],project.code)
        Helper.createNotification("Project", "Project: "+ project.title+" has been deleted.", contributions[i].contributor, contributions[i].contributorType)
    }
}

exports.editAdmin = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing") 
    return res.status(400).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit admin for this project!',
        data: {}
    });

    var oldAdmins = project.admins;
    var tempAdmins = []
    var receivedAdmins = req.body.admins

    for(var i = 0; i < receivedAdmins.length; i++) {
        const user = await Users.findOne({ '_id': receivedAdmins[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the user!',
                data: {}
            });    
        })

        if (!user) {
            return res.status(400).json({
                status: 'error',
                msg: 'Such user is not found!',
                data: {}
            });  
        }

        if(user.id === req.body.id) {
            return res.status(400).json({
                status: 'error',
                msg: 'You cannot add yourself as admin!',
                data: {}
            });  
        }

        if(!tempAdmins.includes(user.id)){
            tempAdmins.push(user.id)
            user.projects.push(project.id)
        }
    }

    var updateOldAminsProjs = [];
    for(var i = 0; i < oldAdmins.length; i++) {
        console.log("here")
        const user = await Users.findOne({ '_id': oldAdmins[i] }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an issue retrieving the user!',
                data: {}
            });    
        })

        if (!user) continue;
        

        if(!tempAdmins.includes(user.id)){
            user.projects.pull(project.id)
            updateOldAminsProjs.push(user)
        }

    }


    project.admins = tempAdmins

    
    for(var i = 0; i < tempAdmins.length; i++) {
        tempAdmins[i].save().catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        })
    }

    for(var i = 0; i < updateOldAminsProjs.length; i++) {
        updateOldAminsProjs[i].save().catch(err => {
            return res.status(500).json({
                status: 'error',
                msg: 'Something went wrong! Error: ' + err.message,
                data: {}
            });
        })
    }


    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project admins successfully edited',
            data: { project: data, admins: tempAdmins }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.addAdmin = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing") 
    return res.status(400).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit admin for this project!',
        data: {}
    });

    const user = await Users.findOne({ '_id': req.body.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the user!',
            data: {}
        });    
    })

    if (!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'Such user is not found!',
            data: {}
        });  
    }

    if(user.id === req.body.id) {
        return res.status(400).json({
            status: 'error',
            msg: 'You cannot add yourself as admin!',
            data: {}
        });  
    }
    
    var tempAdmins = project.admins

    if(!tempAdmins.includes(user.id)){
        tempAdmins.push(user.id)
        user.projects.push(project.id)
    } else {
        return res.status(400).json({
            status: 'error',
            msg: 'This user is already added as admin',
            data: {}
        });
    }

    project.admins = tempAdmins

    user.save().catch(err =>{
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    })

    project.save(project)
    .then(data => {
        
        return res.status(200).json({
            status: 'success',
            msg: 'Project admin successfully added',
            data: { project: data}
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let subject = 'KoCoSD Project Admin Assignment'
    let theMessage = `
        <h1>Congratulations you have been assigned as admin for a project!</h1>
        <p>The project code ${project.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(user.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    title = "Project Admin"
    desc = "Assigned as a project admin for the project " + project.title
    accountId = user.id
    accountType = "user"
        
    Helper.createProfileFeed(title,desc,accountId,accountType)
    Helper.createNotification("Project", "You have been assigned as admin for project: "+ project.title+".", accountId, accountType)

    var action = "Account assigned user: "+ user.name +" ("+user.id+", "+ user.username +")" +" as admin for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
    Helper.createAuditLog(action,req.type,req.id)

    var action = "Project added an admin: "+ user.name +" ("+user.id+", "+ user.username +")" 
    
    Helper.createAuditLog(action,"project",project.id)
}

exports.deleteAdmin = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing") 
    return res.status(400).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit admin for this project!',
        data: {}
    });

    const user = await Users.findOne({ '_id': req.body.userId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the user!',
            data: {}
        });    
    })

    if (!user) {
        return res.status(400).json({
            status: 'error',
            msg: 'Such user is not found!',
            data: {}
        });  
    }

    if(user.id === req.body.id) {
        return res.status(400).json({
            status: 'error',
            msg: 'You cannot add yourself as admin!',
            data: {}
        });  
    }
    
    var tempAdmins = project.admins

    if(!tempAdmins.includes(user.id)){
        return res.status(400).json({
            status: 'error',
            msg: 'This user is not an admin',
            data: {}
        });
    } else {
        tempAdmins.pull(user.id)
        user.projects.pull(project.id)
    }

    project.admins = tempAdmins

    user.save().catch(err =>{
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    })

    project.save(project)
    .then(data => {
        return res.status(200).json({
            status: 'success',
            msg: 'Project admin successfully deleted',
            data: { project: data}
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    let subject = 'KoCoSD Project Admin Removed'
    let theMessage = `
        <h1>You have been removed from being an admin for a project!</h1>
        <p>The project code ${project.code}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(user.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })

    var action = "Account removed user:"+ user.name +" ("+user.id+", "+ user.username +")" +" as admin for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
    Helper.createAuditLog(action,req.type,req.id)
    Helper.createNotification("Project", "You have been removed from admin for project: "+ project.title+".", user.id, "user")

    var action = "Project removed an admin: "+ user.name +" ("+user.id+", "+ user.username +")" 
    
    Helper.createAuditLog(action,"project",project.id)
}

exports.searchUsers = async function (req, res){

    var rgx = new RegExp(req.query.username, "i");
    
    const users = await Users.find({ 'username': { $regex: rgx } }, function (err) {
        if (err) return handleError(err);
    });

    if(!users) {
        return res.status(400).json({
            status: 'error',
            msg: 'No users found! ',
            data: {}
        });
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the users',
        data: { users: users }
    });
}

exports.getAdmins = async function (req, res){

    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong when retrieving the project! ',
            data: {}
        });
    });

    if(!project) {
        return res.status(400).json({
            status: 'error',
            msg: 'No project found! ',
            data: {}
        });
    }

    var adminsId = project.admins;
    var arr = [];
    
    for (var i = 0; i < adminsId.length; i++) {
        var admin = await Users.findOne({ '_id': adminsId[i] }, function (err) {
            if (err) return handleError(err);
        });
        
        if(!admin) {
            project.admins.pull(adminsId[i]);
        } else {
            arr.push(admin)
        }
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the project admins',
        data:  { admins: arr} 
    });
}

exports.getProjectHost = async function (req, res){
    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong when retrieving the project! ',
            data: {}
        });
    });

    if(!project) {
        return res.status(400).json({
            status: 'error',
            msg: 'No project found! ',
            data: {}
        });
    }

    var host;

    if (project.hostType === "institution") {
        var targetHost = await Institutions.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });

        host = targetHost;
    } else if (project.hostType === "user") {
        var targetHost = await Users.findOne({ '_id': project.host }, function (err) {
            if (err) return handleError(err);
        });

        host = targetHost;
    }

    return res.status(200).json({
        status: 'success',
        msg: 'You have successfully queried for the project host!',
        data:  { host: host, type: project.hostType} 
    });
}

exports.createKPI = async function (req, res) {
    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.status != "ongoing") 
    return res.status(400).json({
        status: 'error',
        msg: 'This project is not active!',
        data: {}
    });

    if(project.host != req.body.id && !project.admins.includes(req.body.id))
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit KPI for this project!',
        data: {}
    });

    const kpi = new KPI({
		title: req.body.title,
		desc: req.body.desc,
        completion: 0,
        projectId: project.id
    });

    kpi.save(kpi)
    .then(data => {
        var action = "Account created KPI:"+ kpi.title +" ("+data.id+")" +" for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project added a KPI: "+ kpi.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)
        
        return res.status(200).json({
            status: 'success',
            msg: 'KPI successfully created',
            data: { kpi: kpi }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.updateKPI = async function (req, res) {
    const kpi = await KPI.findOne({ '_id': req.body.kpiId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the kpi!',
            data: {}
        });
    });

    if(!kpi) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such kpi not found!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': kpi.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.host != req.body.id && !project.admins.includes(req.body.id))
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit KPI for this project!',
        data: {}
    });

    kpi.title = req.body.title
    kpi.desc = req.body.desc
    kpi.completion = req.body.completion

    kpi.save(kpi)
    .then(data => {
        var action = "Account updated KPI:"+ kpi.title +" ("+data.id+")" +" for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project updated a KPI: "+ kpi.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'KPI successfully updated',
            data: { kpi: kpi }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });
}

exports.deleteKPI = async function (req, res) {
    const kpi = await KPI.findOne({ '_id': req.body.kpiId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the kpi!',
            data: {}
        });
    });

    if(!kpi) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such kpi not found!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': kpi.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    if(project.host != req.body.id && !project.admins.includes(req.body.id))
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to edit KPI for this project!',
        data: {}
    });

    kpi.deleteOne({ "_id": kpi.id }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue deleting the kpi!' + err.message,
            data: {}
        });
      });

    var action = "Account deleted KPI:"+ kpi.title +" ("+req.body.kpiId+")" +" for a project: "+project.title+" ("+project.id+", "+project.code+")"
    
    Helper.createAuditLog(action,req.type,req.id)

    var action = "Project deleted a KPI: "+ kpi.title +" ("+data.id+")" 
    
    Helper.createAuditLog(action,"project",project.id)

    return res.status(200).json({
        status: 'success',
        msg: 'KPI successfully deleted',
        data: { }
    });

}

exports.getKPIs = async function (req, res) {
    const kpis = await KPI.find({ 'projectId': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the kpis!',
            data: {}
        });
    });

    if(!kpis) 
    return res.status(400).json({
        status: 'error',
        msg: 'KPIs not found!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'KPIs successfully retrieved!',
        data: { kpis: kpis}
    });

}

exports.createResourceNeed = async function (req, res){
    let actor

    if(req.body.resourceType === "money" && !req.body.total)
    return res.status(400).json({
        status: 'error',
        msg: 'Invalid input! The total sum is not declared.',
        data: {}
    });

    if(req.body.resourceType === "money" && req.body.total <= 0)
    return res.status(400).json({
        status: 'error',
        msg: 'Invalid input! The total sum is invalid.',
        data: {}
    });

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        actor = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        actor = user
    }

    if(!actor)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': req.body.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to create resource need for this project!',
        data: {}
    });


    const resourceneed = new ResourceNeed({
        title: req.body.title,
        desc: req.body.desc,
        type: req.body.resourceType,
        total: req.body.total || 0,
        completion: 0,
        projectId: project.id,
        code: actor.username+"-"+uid(),
        status: "progress",
        pendingSum: 0,
        receivedSum: 0
    });

    resourceneed.save(resourceneed)
    .then(data => {

        var action = "Account added a resource need: "+ data.title +" ("+data.id+")"
        action += " for a project: "+project.title+" ("+project.id+")" 
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project added a resource need: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource need successfully created!',
            data: { resourceneed: resourceneed, project: project }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.editResourceNeed = async function (req, res){
    let actor

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such resource need!',
        data: {}
    });

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        actor = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        actor = user
    }

    if(!actor)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': resourceneed.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to create resource need for this project!',
        data: {}
    });

    if(resourceneed.status === "closed")
    return res.status(400).json({
        status: 'error',
        msg: 'You are not allowed to change the details of a deleted resourceneed!',
        data: {}
    });

    if(resourceneed.type === "money" && req.body.total <= 0)
    return res.status(400).json({
        status: 'error',
        msg: 'Invalid input! The total sum is invalid.',
        data: {}
    });

    if(resourceneed.type === "money") {
        if(req.body.total < resourceneed.pendingSum+resourceneed.receivedSum)
        return res.status(400).json({
            status: 'error',
            msg: 'Invalid input! The total sum is invalid. It is lower than the received sum',
            data: {}
        }); 

        req.body.completion = resourceneed.receivedSum/req.body.total
        var tempCompletion = req.body.completion
        req.body.completion = Math.round((tempCompletion+Number.EPSILON)*100)/100
    }
    

    resourceneed.title = req.body.title
    resourceneed.desc = req.body.desc
    resourceneed.total = req.body.total
    resourceneed.completion = req.body.completion

    if(resourceneed.completion === 100)
        resourceneed.status = "completed"
    else 
        resourceneed.status = "progress"

    resourceneed.save(resourceneed)
    .then(data => {

        var action = "Account edited a resource need: "+ data.title +" ("+data.id+")"
        action += " for a project: "+project.title+" ("+project.id+")" 
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project edited a resource need: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource need successfully updated!',
            data: { resourceneed: resourceneed, project: project }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

}

exports.deleteResourceNeed = async function (req, res){
    let actor

    const resourceneed = await ResourceNeed.findOne({ '_id': req.body.needId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });
    });

    if(!resourceneed)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such resource need!',
        data: {}
    });

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        actor = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });


        actor = user
    }

    if(!actor)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': resourceneed.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host=== req.body.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete resource need for this project!',
        data: {}
    });

    if(resourceneed.status === "closed")
    return res.status(400).json({
        status: 'error',
        msg: 'You have deleted this resource need!',
        data: {}
    });

    resourceneed.status = "closed"

    resourceneed.save(resourceneed)
    .then(data => {

        var action = "Account removed a resource need: "+ data.title +" ("+data.id+")"
        action += " for a project: "+project.title+" ("+project.id+")" 
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project deleted a resource need: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Resource need successfully deleted!',
            data: { resourceneed: resourceneed, project: project }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    const contributions = await Contribution.find({ 'needId': resourceneed.id }, function (err) {
        if (err) console.log("Something went wrong while trying to remove contributions in deleting resource need"+ err.message);
    });

    for(var i = 0; i < contributions.length; i++) {
        contributions[i].status = "closed"
        contributions[i].save()
    }
    
    for(var i = 0 ; i < contributions.length; i++) {
        removeContributionEmail(contributions[i],project.code)
        
        Helper.createNotification("Project", "Your contribution for "+ resourceneed.title + " of project "+project.title+" has been removed.", contributions[i].contributor, contributions[i].contributorType )
        
        var theCondition = await checkRemoveProjectIds(project,contributions[i])
        if(theCondition === true)
            removeProjectIds(project.id, contributions[i])
    }

}

exports.removeContribution = async function (req, res){
    let actor

    const contribution = await Contribution.findOne({ '_id': req.body.contributionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong!' + err.message,
            data: {}
        });
    });

    if(!contribution)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such contribution!',
        data: {}
    });

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        actor = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        actor = user
    }

    if(!actor)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': contribution.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host === req.body.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete this contribution!',
        data: {}
    });

    if(contribution.status === "closed")
    return res.status(400).json({
        status: 'error',
        msg: 'You have deleted this contribution!',
        data: {}
    });

    contribution.status = "closed"

    contribution.save(contribution)
    .then(data => {

        var action = "Account removed a contribution: ("+data.id+")"
        action += " for a project: "+project.title+" ("+project.id+")" 
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project's contribution removed: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Contribution successfully removed!',
            data: { project: project, contribution: contribution }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    removeContributionEmail(contribution, project.code)
    
    Helper.createNotification("Project", "Your contribution for project "+project.title+"("+project.code+")"+" has been removed.", contribution.contributor, contribution.contributorType )
    
    var theCondition = await checkRemoveProjectIds(project,contribution)
    if(theCondition === true)
        removeProjectIds(project.id, contribution)

    if(contribution.resType === "money") {
        var need = await ResourceNeed.findOne({ '_id': contribution.needId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });

        var projectreq = await ProjectReq.findOne({ '_id': contribution.requestId }, function (err) {
            if (err){ 
                console.log("error: "+err.message)
                return
            }
        });

        need.receivedSum = need.receivedSum - projectreq.moneySum;
        need.completion = need.receivedSum/need.total
        var tempCompletion = need.completion
        need.completion = Math.round((tempCompletion+Number.EPSILON)*100)/100
        need.save()
    }

}

exports.updateContributionRating = async function (req, res){
    let actor

    const contribution = await Contribution.findOne({ '_id': req.body.contributionId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong!' + err.message,
            data: {}
        });
    });

    if(!contribution)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such contribution!',
        data: {}
    });

    if(req.type === "institution") {
        const institution = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        if(institution.status != "active")
        return res.status(400).json({
            status: 'error',
            msg: 'Account is not authorized to perform project creation right now!',
            data: {}
        });

        actor = institution
    } else if (req.type === "user") {
        const user = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        actor = user
    }

    if(!actor)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such account!',
        data: {}
    });

    const project = await Projects.findOne({ '_id': contribution.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an issue retrieving the project!',
            data: {}
        });
    });

    if(!project) 
    return res.status(400).json({
        status: 'error',
        msg: 'Such project not found!',
        data: {}
    });

    let valid = false;

    if(project.host != req.body.id) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(req.body.id === admins[i]) {
                valid = true;
                break;
            }
        }
    } else if (project.host === req.body.id) valid = true;

    if(!valid)
    return res.status(400).json({
        status: 'error',
        msg: 'You are not authorized to delete this contribution!',
        data: {}
    });

    if(contribution.status === "closed")
    return res.status(400).json({
        status: 'error',
        msg: 'You have deleted this contribution!',
        data: {}
    });

    contribution.rating = req.body.theRating

    contribution.save(contribution)
    .then(data => {

        var action = "Account updated a contribution rating: ("+data.id+")"
        action += " for a project: "+project.title+" ("+project.id+")" 
    
        Helper.createAuditLog(action,req.type,req.id)

        var action = "Project's contribution rating updated for contributionss: "+ data.title +" ("+data.id+")" 
    
        Helper.createAuditLog(action,"project",project.id)

        return res.status(200).json({
            status: 'success',
            msg: 'Contribution rating successfully updated!',
            data: { contribution: data }
        });
    }).catch(err => {
        return res.status(500).json({
            status: 'error',
            msg: 'Something went wrong! Error: ' + err.message,
            data: {}
        });
    });

    updateContributionRatingEmail(contribution, project.code)

}

async function removeContributionEmail(contribution, projectCode) {

    var target;
    if(contribution.contributorType === "user") {
        target= await Users.findOne({ '_id': contribution.contributor, function (err) {
            if (err) console.log("Error: "+err.message)
        }});

    } else if (contribution.contributorType === "institution") {
        target= await Institutions.findOne({ '_id': contribution.contributor, function (err) {
            if (err) console.log("Error: "+err.message)
        }});
    }

    if(!target) {
        console.log("target account not found")
        return;
    }

    let subject = 'KoCoSD Contribution Deletion'
    let theMessage = `
        <h1>A project resource need/contribution of yours is deleted.</h1>
        <p>The project code ${projectCode}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

async function updateContributionRatingEmail(contribution, projectCode) {

    var target;
    if(contribution.contributorType === "user") {
        target= await Users.findOne({ '_id': contribution.contributor, function (err) {
            if (err) console.log("Error: "+err.message)
        }});

    } else if (contribution.contributorType === "institution") {
        target= await Institutions.findOne({ '_id': contribution.contributor, function (err) {
            if (err) console.log("Error: "+err.message)
        }});
    }

    if(!target) {
        console.log("target account not found")
        return;
    }

    let subject = 'KoCoSD Contribution Rating Update'
    let theMessage = `
        <h1>A project resource contribution rating of yours is updated.</h1>
        <p>The project code ${projectCode}<p>
        <p>If there is any discrepancy, please contact our admin to resolve it.</p><br>
    `

    Helper.sendEmail(target.email, subject, theMessage, function (info) {
        if (!info) {
            console.log('Something went wrong while trying to send email!')
        } 
    })
}

exports.getResourceNeeds = async function (req, res){
    const resourceneeds = await ResourceNeed.find({ 'projectId': req.query.projectId, 'status': { $ne: 'closed'} }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'An error occur when retrieving resource needs!',
            data: {}
        });
    });

    if(!resourceneeds)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no resource needs for this project or something went wrong!',
        data: {}
    });

    return res.status(200).json({
        status: 'success',
        msg: 'Resource need successfully retrieved!',
        data: { resourceneeds: resourceneeds }
    });
}

exports.getContributions = async function (req, res){
    const contributions = await Contribution.find({ 'projectId': req.query.projectId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving contributions!' + err.message,
            data: {}
        });
    });

    if(!contributions)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no contributions or something went wrong!',
        data: {}
    });

    var theList = []

    for(var i = 0; i < contributions.length; i++) {
        var contributionItem = {
            "contributionId":"",
            "projectId": "",
            "needId": "",
            "requestId": "",
            "requestType": "",
            "resType": "",
            "rating": "",
            "contributor": "",
            "contributorType": "",
            "needTitle":"",
            "resourceTitle":"",
            "resourceId":"",
            "desc":"",
            "contributorUsername":"",
            "contributorName":""
        }

        contributionItem.contributionId = contributions[i].id
        contributionItem.projectId = contributions[i].projectId
        contributionItem.needId = contributions[i].needId
        contributionItem.requestId = contributions[i].requestId
        contributionItem.requestType = contributions[i].requestType
        contributionItem.resType = contributions[i].resType
        contributionItem.rating = contributions[i].rating
        contributionItem.contributor = contributions[i].contributor
        contributionItem.contributorType = contributions[i].contributorType

        await getNeedInfo(contributionItem)
        await getRequestInfo(contributionItem)
        await getResourceInfo(contributionItem)
        await getContributorInfo(contributionItem)
        
        theList.push(contributionItem)
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Contributions successfully retrieved!',
        data: { contributions: theList }
    });
}

exports.getAccountContributions = async function (req, res){
    const contributions = await Contribution.find({ 'contributor': req.query.accountId, 'contributorType': req.query.accountType ,'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving contributions!' + err.message,
            data: {}
        });
    });

    if(!contributions)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no contributions or something went wrong!',
        data: {}
    });

    var theList = []
    var sum = 0;

    for(var i = 0; i < contributions.length; i++) {
        var contributionItem = {
            "contributionId":"",
            "projectId": "",
            "needId": "",
            "requestId": "",
            "requestType": "",
            "resType": "",
            "rating": "",
            "contributor": "",
            "contributorType": "",
            "needTitle":"",
            "resourceTitle":"",
            "resourceId":"",
            "desc":"",
            "contributorUsername":"",
            "contributorName":"",
            "projectTitle":""
        }

        contributionItem.contributionId = contributions[i].id
        contributionItem.projectId = contributions[i].projectId
        contributionItem.needId = contributions[i].needId
        contributionItem.requestId = contributions[i].requestId
        contributionItem.requestType = contributions[i].requestType
        contributionItem.resType = contributions[i].resType
        contributionItem.rating = contributions[i].rating
        contributionItem.contributor = contributions[i].contributor
        contributionItem.contributorType = contributions[i].contributorType

        await getNeedInfo(contributionItem)
        await getRequestInfo(contributionItem)
        await getResourceInfo(contributionItem)

        await getContributorInfo(contributionItem)
        if(contributionItem.contributorName === "") continue

        await getProjectInfo(contributionItem)
        if(contributionItem.contributorName === "") continue

        sum += contributionItem.rating
        theList.push(contributionItem)
    }

    var avgRating = 0;
    if(theList.length > 0) {
        avgRating = sum/theList.length
        avgRating = Math.round((avgRating+Number.EPSILON)*100)/100
    } 

    return res.status(200).json({
        status: 'success',
        msg: 'Account\'s contributions successfully retrieved!',
        data: { avgRating: avgRating, contributions: theList }
    });

}

exports.getContributors = async function (req, res){
    const contributions = await Contribution.find({ 'projectId': req.query.projectId, 'status':'active' }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving contributions!' + err.message,
            data: {}
        });
    });

    if(!contributions)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no contributions or something went wrong!',
        data: {}
    });

    var theList = []
    var checkerList = [];

    const project = await Projects.findOne({ '_id': req.query.projectId }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving project!' + err.message,
            data: {}
        });
    });

    if(!project)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no such project or something went wrong!',
        data: {}
    });

    var host;

    var contributionItem = {
        "contributor": "",
        "contributorType": "",
        "contributorUsername":"",
        "contributorName":"",
        "contributionType":"",
        "contributorImgPath":"",
        "ionicImgPath":"",
        "resourceId":""
    }

    if(project.hostType === "institution") {
        const institution = await Institutions.findOne({ '_id': project.host }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!institution)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        host = institution;
        contributionItem.contributorType = "institution"
    } else if (project.hostType === "user") {
        const user = await Users.findOne({ '_id': project.host }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was no such account!',
                data: {}
            });
        });

        if(!user)
        return res.status(400).json({
            status: 'error',
            msg: 'There was no such account!',
            data: {}
        });

        host = user
        contributionItem.contributorType = "user"
    }

    contributionItem.contributor = host.id
    contributionItem.contributorUsername = host.username
    contributionItem.contributorName = host.name
    contributionItem.contributionType = "founder"
    contributionItem.contributorImgPath = host.profilePic
    contributionItem.ionicImgPath = host.ionicImg

    theList.push(contributionItem)
    checkerList.push(contributionItem.contributor)

    var admins = project.admins

    for(var i = 0; i < admins.length; i++) {
        var contributionItem = {
            "contributor": "",
            "contributorType": "",
            "contributorUsername":"",
            "contributorName":"",
            "contributionType":"",
            "contributorImgPath":"",
            "ionicImgPath":"",
            "resourceId":""
        }

        contributionItem.contributor = admins[i]
        contributionItem.contributorType = "user"
        contributionItem.contributionType = "admin"
        await getContributorInfo(contributionItem)
        
        theList.push(contributionItem)
        checkerList.push(contributionItem.contributor)
    }

    for(var i = 0; i < contributions.length; i++) {
        var contributionItem = {
            "contributor": "",
            "contributorType": "",
            "contributorUsername":"",
            "contributorName":"",
            "contributionType":"",
            "contributorImgPath":"",
            "ionicImgPath":"",
            "resourceId":""
        }

        contributionItem.contributor = contributions[i].contributor
        contributionItem.contributorType = contributions[i].contributorType
        contributionItem.contributionType = "contributor"
        await getContributorInfo(contributionItem)
        
        if(!checkerList.includes(contributionItem.contributor)) {
            theList.push(contributionItem)
            checkerList.push(contributionItem.contributor)
        }
    }

    return res.status(200).json({
        status: 'success',
        msg: 'Contributors successfully retrieved!',
        data: { contributors: theList }
    });

}

async function getNeedInfo(contributionItem) {
    const need = await ResourceNeed.findOne({ '_id': contributionItem.needId }, function (err) {
        if (err) {
            console.log("The needId in your contribution is invalid! error: "+err.message)
            return
        }
    });

    if(!need) {
        console.log("Error: Something went wrong when retrieving needs")
        return
    }

    contributionItem.needTitle = need.title;
}

async function getProjectInfo(contributionItem) {
    const project = await Projects.findOne({ '_id': contributionItem.projectId }, function (err) {
        if (err) {
            console.log("The projectId in your contribution is invalid! error: "+err.message)
            return
        }
    });

    if(!project) {
        console.log("Error: Something went wrong when retrieving needs")
        return
    }

    contributionItem.projectTitle = project.title;
}

async function getRequestInfo(contributionItem) {
    var request;
    
    if(contributionItem.requestType === "project") {
        request = await ProjectReq.findOne({ '_id': contributionItem.requestId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource need!' + err.message,
                data: {}
            });
        });
    } else if (contributionItem.requestType === 'resource') {
        request = await ResourceReq.findOne({ '_id': contributionItem.requestId }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource need!' + err.message,
                data: {}
            });
        });
    }

    if(!request) {
        console.log("error: request not found")
        return
    }
    contributionItem.resourceId = request.resourceId
    contributionItem.desc = request.desc
}

async function getContributorInfo(contributionItem) {
    var owner;

    if(contributionItem.contributorType === "user") {
        owner = await Users.findOne({ '_id': contributionItem.contributor }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource contributor!' + err.message,
                data: {}
            });
        });
    } else if (contributionItem.contributorType === 'institution') {
        owner = await Institutions.findOne({ '_id': contributionItem.contributor }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving a resource contributor!' + err.message,
                data: {}
            });
        });
    }

    if(!owner) {
        console.log("Error: Something went wrong when retrieving owner")
        return
    }

    contributionItem.contributorUsername = owner.username
    contributionItem.contributorName = owner.name
    contributionItem.contributorImgPath = owner.profilePic
    contributionItem.ionicImgPath = owner.ionicImg

}

async function getResourceInfo(contributionItem) {
    var resource;

    if(contributionItem.resType === 'manpower') {
        resource = await Manpower.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err){
                console.log("error: "+err.message)
                return
            }
        });    
    } else if(contributionItem.resType === 'venue') {
        resource = await Venue.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err){
                console.log("error: "+err.message)
                return
            }
        });    
    } else if(contributionItem.resType === 'money') {
        resource = await Money.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err){
                console.log("error: "+err.message)
                return
            }
        });    
    } else if(contributionItem.resType === 'knowledge') {
        resource = await Knowledge.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err){
                console.log("error: "+err.message)
                return
            }
        });    
    } else if(contributionItem.resType === 'item') {
        resource = await Item.findOne({ '_id': contributionItem.resourceId }, function (err) {
            if (err){
                console.log("error: "+err.message)
                return
            }
        });    
    }
    
    if(!resource){
        console.log("Error: Something went wrong when retrieving resources")
    }
    if(contributionItem.resType!= 'money')
        contributionItem.resourceTitle = resource.title;
    else
        contributionItem.resourceTitle = '$'+resource.sum+' contributed';
}

exports.getAccNewsFeed = async function (req, res){
    var account;
    if (req.body.type === "user") {
        account = await Users.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving the account!' + err.message,
                data: {}
            });
        });
    } else if (req.body.type === "institution") {
        account = await Institutions.findOne({ '_id': req.body.id }, function (err) {
            if (err)
            return res.status(500).json({
                status: 'error',
                msg: 'There was an error retrieving the account!' + err.message,
                data: {}
            });
        });
    }

    if(!account)
    return res.status(400).json({
        status: 'error',
        msg: 'There was no contributions or something went wrong!',
        data: {}
    });

    var accSDGs = account.SDGs;
    var theList = []
    
    var projects = await Projects.find({ 'status': "ongoing" }, function (err) {
        if (err)
        return res.status(500).json({
            status: 'error',
            msg: 'There was an error retrieving the account!' + err.message,
            data: {}
        });
    });

    for(var i = 0; i < projects.length; i++) {
        var projectItem = {
            "id":"",
            "title": "",
            "desc": "",
            "host": "",
            "hostType": "",
            "status": "",
            "rating": "",
            "country": "",
            "code": "",
            "imgPath":"",
            "admins":[],
            "SDGs":[],
            "matchPoint":0,
            "profilePicture":"",
            "ionicImg":"",
            "hostName":"",
            "hostUsername":"",
            "createdAt":"",
            "updatedAt":""
        }

        if(account.projects.includes(projects[i].id)) continue

        projectItem.id = projects[i].id
        projectItem.title = projects[i].title
        projectItem.desc = projects[i].desc
        projectItem.host = projects[i].host
        projectItem.hostType = projects[i].hostType
        projectItem.status = projects[i].status
        projectItem.rating = projects[i].rating
        projectItem.country = projects[i].country
        projectItem.code = projects[i].code
        projectItem.imgPath = projects[i].imgPath
        projectItem.admins = projects[i].admins
        projectItem.SDGs = projects[i].SDGs
        projectItem.createdAt = projects[i].createdAt
        projectItem.updatedAt = projects[i].updatedAt
        await getHostInfo(projectItem)

        var tempSDGs = projectItem.SDGs
        for(var j = 0; j < projectItem.SDGs.length; j++) {
            if(accSDGs.includes(tempSDGs[j]))
                projectItem.matchPoint += 10;
        }

        theList.push(projectItem)
    }

    theList.reverse()
    theList.sort(function(a, b){return b.matchPoint - a.matchPoint})

    return res.status(200).json({
        status: 'success',
        msg: 'Projects for News Feed successfully retrieved!',
        data: { newsfeeds: theList }
    });
}

async function getHostInfo(newsFeedItem) {
    var owner;

    if(newsFeedItem.hostType === "user") {
        owner = await Users.findOne({ '_id': newsFeedItem.host }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (newsFeedItem.hostType === 'institution') {
        owner = await Institutions.findOne({ '_id': newsFeedItem.host }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getHostInfo) Such account not found!")
        return
    }

    newsFeedItem.profilePic = owner.profilePic
    newsFeedItem.ionicImg = owner.ionicImg
    newsFeedItem.hostName = owner.name
    newsFeedItem.hostUsername = owner.username
    
}

async function getAccountInfo(theItem) {
    var owner;

    if(theItem.accountType === "user") {
        owner = await Users.findOne({ '_id': theItem.accountId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (theItem.accountType === 'institution') {
        owner = await Institutions.findOne({ '_id': theItem.accountId }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (getHostInfo) Such account not found!")
        return
    }

    theItem.accountPic = owner.ionicImg
    theItem.accountUsername = owner.username
    theItem.accountName = owner.name 
    theItem.isVerified = owner.isVerified
}

async function removeProjectIds(projectId, contribution) {
    var owner;

    if(contribution.contributorType === "user") {
        owner = await Users.findOne({ '_id': contribution.contributor }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (contribution.contributorType === 'institution') {
        owner = await Institutions.findOne({ '_id': contribution.contributor }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (addProjectIds) Such account not found!")
        return
    }

    owner.projects.pull(projectId)
    owner.save().catch(err => {
        console.log("error: (addProjectIds) There is an error updating the projects! " + err.message)
    });
}

// return false if there is still another contribution
async function checkRemoveProjectIds(project, contribution) {
    var owner;

    if(contribution.contributorType === "user") {
        owner = await Users.findOne({ '_id': contribution.contributor }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    } else if (contribution.contributorType === 'institution') {
        owner = await Institutions.findOne({ '_id': contribution.contributor }, function (err) {
            if (err) {
                console.log("error: "+err.message)
                return
            }
        });
    }

    if(!owner) {
        console.log("error: (addProjectIds) Such account not found!")
        return
    }

    if(project.host != contribution.contributor) {
        let admins = project.admins;
        for(var i = 0; i < admins.length; i++) {
            if(contribution.contributor === admins[i]) {
                return false
            }
        }
    } else if (project.host=== contribution.contributor) return false

    const otherContribution =  await Contribution.findOne({ 'projectId':project.id, 'contributor':owner.id, 'contributorType':contribution.contributorType, 'status':'active' }, function (err) {
        if (err) {
            console.log("error: "+err.message)
            return
        }
    });
    if(otherContribution) return false

    return true

}

handleError = (err) => {
    console.log("handleError :"+ err)
}