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

router.post('/status', auth, PaidResourceValidator.statusPaidRes, Helper.ifErrors, paidResourceController.statusPaidResource)

router.get('/details', PaidResourceValidator.paidResDetail, paidResourceController.paidResourceDetail)

router.get('/all/my', auth, paidResourceController.myPaidResources)
router.get('/all/others', PaidResourceValidator.othersPaidResources, Helper.ifErrors, paidResourceController.othersPaidResources)

router.post('/purchase/request', auth, PaidResourceValidator.purchaseRequest, Helper.ifErrors, paidResourceController.purchaseRequest)
router.post('/buyer/purchase/status', auth, PaidResourceValidator.buyerUpdateStatus, Helper.ifErrors, paidResourceController.updateBuyerStatus)
router.post('/seller/purchase/status', auth, PaidResourceValidator.sellerUpdateStatus, Helper.ifErrors, paidResourceController.updateSellerStatus)

router.get('/my/purchase', auth, PaidResourceValidator.myPurchase, Helper.ifErrors, paidResourceController.myPurchase )
router.get('/seller/requests', auth, PaidResourceValidator.sellerRequests, Helper.ifErrors, paidResourceController.sellerRequests)

router.get('/project/purchase', PaidResourceValidator.projectPurchase, Helper.ifErrors, paidResourceController.projectPurchase)

module.exports = router;
