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

router.post('/editAdmin', auth, ProjectValidator.editAdmin, Helper.ifErrors, projectController.editAdmin)

router.get('/searchUsers', auth, ProjectValidator.searchUsers, Helper.ifErrors, projectController.searchUsers)

router.get('/projectAdmins', ProjectValidator.getAdmins, Helper.ifErrors, projectController.getAdmins)

router.get('/projectHost', ProjectValidator.getAdmins, Helper.ifErrors, projectController.getProjectHost)

module.exports = router;
