const express = require('express');
const router = express.Router();
const paidResourceController = require('../controller/paidresource.controller');
const auth = require('../middleware/auth')

const PaidResourceValidator = require('../validator/paidresource.validator');
const Helper = require('../service/helper.service');
const uploadMultipleFiles = require('../middleware/uploadMultipleFiles');

router.post('/', auth, uploadMultipleFiles, paidResourceController.multerCreatePaidResource, PaidResourceValidator.createPaidResource, Helper.ifErrors, paidResourceController.createPaidResource)
router.post('/updatePaidResource', auth, PaidResourceValidator.updatePaidResource, Helper.ifErrors, paidResourceController.updatePaidResource)
router.post('/uploadPaidResourcePicture', auth, uploadMultipleFiles, paidResourceController.multerPaidResourcePic, paidResourceController.uploadPaidResPic)
router.post('/deletePaidResourcePicture', auth, PaidResourceValidator.deletePaidResPicture, paidResourceController.deletePaidResourcePicture)

router.post('/status', auth, PaidResourceValidator.statusPaidResPicture, paidResourceController.statusPaidResource)

router.get('/details', PaidResourceValidator.paidResDetail, paidResourceController.paidResourceDetail)

router.get('/all/my', auth, paidResourceController.myPaidResources)
router.get('/all/others', PaidResourceValidator.othersPaidResources, Helper.ifErrors, paidResourceController.othersPaidResources)

module.exports = router;
