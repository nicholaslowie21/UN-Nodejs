const express = require('express');
const router = express.Router();
const projectController = require('../controller/project.controller');
const auth = require('../middleware/auth')

const ProjectValidator = require('../validator/project.validator');
const Helper = require('../service/helper.service');

router.get('/viewProject', ProjectValidator.viewProject, Helper.ifErrors, projectController.viewProject);

router.get('/searchProjectsCode', auth, ProjectValidator.searchProjects, Helper.ifErrors, projectController.searchProjects)

router.post('/createProject', auth, ProjectValidator.createProject, Helper.ifErrors, projectController.createProject)
router.post('/updateProject', auth, ProjectValidator.updateProject, Helper.ifErrors, projectController.postUpdateProject)
router.post('/deleteProject', auth, ProjectValidator.deleteProject, Helper.ifErrors, projectController.deleteProject)

// router.post('/editAdmin', auth, ProjectValidator.editAdmin, Helper.ifErrors, projectController.editAdmin)
router.post('/addAdmin', auth, ProjectValidator.addAdmin, Helper.ifErrors, projectController.addAdmin)
router.post('/deleteAdmin', auth, ProjectValidator.addAdmin, Helper.ifErrors, projectController.deleteAdmin)

router.get('/searchUsers', auth, ProjectValidator.searchUsers, Helper.ifErrors, projectController.searchUsers)

router.get('/projectAdmins', ProjectValidator.getAdmins, Helper.ifErrors, projectController.getAdmins)

router.get('/projectHost', ProjectValidator.getAdmins, Helper.ifErrors, projectController.getProjectHost)

router.post('/uploadProjectPicture', auth, projectController.multerUpload, projectController.projectPicture)

router.post('/createKPI', auth, ProjectValidator.createKPI, Helper.ifErrors, projectController.createKPI)
router.post('/updateKPI', auth, ProjectValidator.updateKPI, Helper.ifErrors, projectController.updateKPI)
router.post('/deleteKPI', auth, ProjectValidator.deleteKPI, Helper.ifErrors, projectController.deleteKPI)
router.get('/projectKPI', ProjectValidator.getKPIs, Helper.ifErrors, projectController.getKPIs)

router.post('/completeProject', auth, ProjectValidator.completeProject, Helper.ifErrors, projectController.completeProject)

router.post('/createResourceNeed', auth, ProjectValidator.createResourceNeed, Helper.ifErrors, projectController.createResourceNeed)
router.post('/editResourceNeed', auth, ProjectValidator.editResourceNeed, Helper.ifErrors, projectController.editResourceNeed)
router.post('/deleteResourceNeed', auth, ProjectValidator.deleteResourceNeed, Helper.ifErrors, projectController.deleteResourceNeed)
router.get('/resourceNeeds', ProjectValidator.getResourceNeeds, Helper.ifErrors, projectController.getResourceNeeds )

router.get('/contributions', ProjectValidator.getContributions, Helper.ifErrors, projectController.getContributions )
router.post('/removeContribution', auth, ProjectValidator.removeContribution, Helper.ifErrors, projectController.removeContribution)
router.get('/contributors', ProjectValidator.getContributions, Helper.ifErrors, projectController.getContributors )
router.post('/updateContributionRating', auth, ProjectValidator.updateContributionRating, Helper.ifErrors, projectController.updateContributionRating)

router.get('/accountNewsFeed', auth, projectController.getAccNewsFeed )
router.get('/account/contributions', ProjectValidator.getAccountContributions, Helper.ifErrors, projectController.getAccountContributions )

router.post('/createPost', auth, projectController.multerCreatePost , ProjectValidator.createPost, Helper.ifErrors , projectController.createPost)
router.post('/updatePost', auth, projectController.multerUpdatePost , ProjectValidator.updatePost, Helper.ifErrors , projectController.updatePost)
router.post('/deletePost', auth, ProjectValidator.deletePost, Helper.ifErrors , projectController.deletePost)
router.post('/deletePostPic', auth, ProjectValidator.deletePost, Helper.ifErrors , projectController.deletePostPic)
router.get('/posts', ProjectValidator.getPost, Helper.ifErrors , projectController.getPosts)
router.get('/postDetail', ProjectValidator.getPostDetail, Helper.ifErrors , projectController.getPostDetail)

router.post('/createPostComment', auth, ProjectValidator.createPostComment, Helper.ifErrors , projectController.createPostComment)
router.post('/deletePostComment', auth, ProjectValidator.deletePostComment, Helper.ifErrors , projectController.deletePostComment)
router.get('/comments', ProjectValidator.getComment, Helper.ifErrors , projectController.getComments)

router.post('/projectEvent', auth, ProjectValidator.createProjectEvent, Helper.ifErrors , projectController.createProjectEvent)
router.post('/updateProjectEvent', auth, ProjectValidator.updateProjectEvent, Helper.ifErrors , projectController.updateProjectEvent)
router.delete('/projectEvent', auth, ProjectValidator.deleteProjectEvent, Helper.ifErrors , projectController.deleteProjectEvent)
router.get('/public/events', ProjectValidator.getEvent, Helper.ifErrors , projectController.getPublicEvents)
router.get('/all/events', ProjectValidator.getEvent, Helper.ifErrors , projectController.getAllEvents)

module.exports = router;
