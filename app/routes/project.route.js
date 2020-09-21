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

module.exports = router;
