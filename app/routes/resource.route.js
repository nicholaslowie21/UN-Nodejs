const express = require('express');
const router = express.Router();
const resourceController = require('../controller/resource.controller');
const auth = require('../middleware/auth')
const updloadMultipleFiles = require('../middleware/uploadMultipleFiles')

const ResourceValidator = require('../validator/resource.validator');
const Helper = require('../service/helper.service');

router.get('/user/manpower', ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserManpower);

router.get('/user/knowledge',  ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserKnowledge);

router.get('/user/item', ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserItem);

router.get('/user/venue', ResourceValidator.viewResource, Helper.ifErrors, resourceController.viewUserVenue);

router.get('/institution/knowledge', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionKnowledge);

router.get('/institution/item', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionItem);

router.get('/institution/venue', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionVenue);

router.post('/createItem', auth, ResourceValidator.createItemResource, Helper.ifErrors, resourceController.createItem )

router.post('/updateItem', auth, ResourceValidator.updateItemResource, Helper.ifErrors, resourceController.updateItem )

router.post('/uploadItemPicture', auth, resourceController.multerItemPicUpload, resourceController.itemPicture)

router.post('/createVenue', auth, ResourceValidator.createVenueResource, Helper.ifErrors, resourceController.createVenue )

router.post('/updateVenue', auth, ResourceValidator.updateVenueResource, Helper.ifErrors, resourceController.updateVenue )

router.post('/uploadVenuePicture', auth, updloadMultipleFiles, resourceController.multerVenuePicUpload, resourceController.venuePicture)

module.exports = router;
