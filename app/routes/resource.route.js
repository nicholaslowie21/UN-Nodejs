const express = require('express');
const router = express.Router();
const resourceController = require('../controller/resource.controller');
const auth = require('../middleware/auth')

const ResourceValidator = require('../validator/resource.validator');
const Helper = require('../service/helper.service');

router.get('/user/manpower', auth, ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserManpower);

router.get('/user/knowledge', auth, ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserKnowledge);

router.get('/user/item', auth, ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserItem);

router.get('/user/venue', auth, ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserVenue);

router.get('/institution/knowledge', auth, ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionKnowledge);

router.get('/institution/item', auth, ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionItem);

router.get('/institution/venue', auth, ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionVenue);

module.exports = router;
