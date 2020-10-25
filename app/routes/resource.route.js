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

router.get('/private/user/manpower', auth, resourceController.viewPrivateUserManpower);
router.get('/private/user/knowledge',  auth, resourceController.viewPrivateUserKnowledge);
router.get('/private/user/item', auth, resourceController.viewPrivateUserItem);
router.get('/private/user/venue', auth, resourceController.viewPrivateUserVenue);

router.get('/institution/knowledge', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionKnowledge);
router.get('/institution/item', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionItem);
router.get('/institution/venue', ResourceValidator.viewInstitutionResource, Helper.ifErrors, resourceController.viewInstitutionVenue);

router.get('/private/institution/knowledge', auth, resourceController.viewPrivateInstitutionKnowledge);
router.get('/private/institution/item', auth, resourceController.viewPrivateInstitutionItem);
router.get('/private/institution/venue', auth, resourceController.viewPrivateInstitutionVenue);

// router.post('/createItem', auth, ResourceValidator.createItemResource, Helper.ifErrors, resourceController.createItem )
router.post('/createItem', auth, resourceController.multerCreateItem, ResourceValidator.createItemResource, Helper.ifErrors, resourceController.createItem)
router.post('/updateItem', auth, ResourceValidator.updateItemResource, Helper.ifErrors, resourceController.updateItem )
router.post('/uploadItemPicture', auth, resourceController.multerItemPicUpload, resourceController.itemPicture)

router.post('/createVenue', auth, ResourceValidator.createVenueResource, Helper.ifErrors, resourceController.createVenue )
router.post('/updateVenue', auth, ResourceValidator.updateVenueResource, Helper.ifErrors, resourceController.updateVenue )
router.post('/uploadVenuePicture', auth, updloadMultipleFiles, resourceController.multerVenuePicUpload, resourceController.venuePicture)
router.post('/deleteVenuePicture', auth, ResourceValidator.deleteVenuePicture, resourceController.deleteVenuePicture)

router.post('/createManpower', auth, ResourceValidator.createManpowerResource, Helper.ifErrors, resourceController.createManpower )
router.post('/updateManpower', auth, ResourceValidator.updateManpowerResource, Helper.ifErrors, resourceController.updateManpower )

router.post('/createKnowledge', auth, ResourceValidator.createKnowledgeResource, Helper.ifErrors, resourceController.createKnowledge )
router.post('/updateKnowledge', auth, ResourceValidator.updateKnowledgeResource, Helper.ifErrors, resourceController.updateKnowledge )
router.post('/updateKnowledgeOwner', auth, ResourceValidator.updateKnowledgeResourceOwner, Helper.ifErrors, resourceController.updateKnowledgeOwner )
router.post('/addKnowledgeOwner', auth, ResourceValidator.addKnowledgeResourceOwner, Helper.ifErrors, resourceController.addKnowledgeOwner )
router.post('/deleteKnowledgeOwner', auth, ResourceValidator.deleteKnowledgeResourceOwner, Helper.ifErrors, resourceController.deleteKnowledgeOwner )
router.post('/uploadKnowledgeAttachment', auth, resourceController.multerIPUpload, resourceController.IPupload)

router.post('/activate/item', auth, ResourceValidator.activateItem, Helper.ifErrors, resourceController.activateItem)
router.post('/deactivate/item', auth, ResourceValidator.activateItem, Helper.ifErrors, resourceController.deactivateItem)
router.post('/delete/item', auth, ResourceValidator.activateItem, Helper.ifErrors, resourceController.deleteItem)


router.post('/activate/manpower', auth, ResourceValidator.activateManpower, Helper.ifErrors, resourceController.activateManpower)
router.post('/deactivate/manpower', auth, ResourceValidator.activateManpower, Helper.ifErrors, resourceController.deactivateManpower)
router.post('/delete/manpower', auth, ResourceValidator.activateManpower, Helper.ifErrors, resourceController.deleteManpower)

router.post('/activate/knowledge', auth, ResourceValidator.activateKnowledge, Helper.ifErrors, resourceController.activateKnowledge)
router.post('/deactivate/knowledge', auth, ResourceValidator.activateKnowledge, Helper.ifErrors, resourceController.deactivateKnowledge)
router.post('/delete/knowledge', auth, ResourceValidator.activateKnowledge, Helper.ifErrors, resourceController.deleteKnowledge)

router.post('/activate/venue', auth, ResourceValidator.activateVenue, Helper.ifErrors, resourceController.activateVenue)
router.post('/deactivate/venue', auth, ResourceValidator.activateVenue, Helper.ifErrors, resourceController.deactivateVenue)
router.post('/delete/venue', auth, ResourceValidator.activateVenue, Helper.ifErrors, resourceController.deleteVenue)

router.get('/item/details',  ResourceValidator.viewItemDetails, Helper.ifErrors, resourceController.viewItemDetails)
router.get('/knowledge/details',  ResourceValidator.viewKnowledgeDetails, Helper.ifErrors, resourceController.viewKnowledgeDetails)
router.get('/manpower/details',  ResourceValidator.viewManpowerDetails, Helper.ifErrors, resourceController.viewManpowerDetails)
router.get('/venue/details',  ResourceValidator.viewVenueDetails, Helper.ifErrors, resourceController.viewVenueDetails)

router.get('/search/item',  ResourceValidator.searchResource, Helper.ifErrors, resourceController.searchItem)
router.get('/search/venue',  ResourceValidator.searchResource, Helper.ifErrors, resourceController.searchVenue)
router.get('/search/manpower',  ResourceValidator.searchResource, Helper.ifErrors, resourceController.searchManpower)
router.get('/search/knowledge',  ResourceValidator.searchResource, Helper.ifErrors, resourceController.searchKnowledge)

module.exports = router;
