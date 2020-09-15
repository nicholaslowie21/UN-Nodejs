const express = require('express');
const router = express.Router();
const resourceController = require('../controller/resource.controller');
const auth = require('../middleware/auth')

const ResourceValidator = require('../validator/resource.validator');
const Helper = require('../service/helper.service');

router.get('/user/manpower', auth, ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserManpower);

module.exports = router;
