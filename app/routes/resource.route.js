const express = require('express');
const router = express.Router();
const resourceController = require('../controller/resource.controller');
const auth = require('../middleware/auth')

const ResourceValidator = require('../validator/resource.validator');
const Helper = require('../service/helper.service');

router.get('/user/manpower', ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserManpower);

router.get('/user/knowledge',  ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserKnowledge);

router.get('/user/item', ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserItem);

router.get('/user/venue', ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserVenue);

router.get('/institution/knowledge', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionKnowledge);

router.get('/institution/item', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionItem);

router.get('/institution/venue', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionVenue);

module.exports = router;
