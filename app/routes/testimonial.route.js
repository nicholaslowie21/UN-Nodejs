const express = require('express');
const router = express.Router();
const testimonialController = require('../controller/testimonial.controller');
const auth = require('../middleware/auth')

const TestimonialValidator = require('../validator/testimonial.validator');
const Helper = require('../service/helper.service');

router.get('/common/projects', auth, TestimonialValidator.getCommonProject, Helper.ifErrors, testimonialController.getCommonProject)
router.post('/request', auth, TestimonialValidator.requestTestimonial, Helper.ifErrors, testimonialController.requestTestimonial)
// router.post('/request', auth, TestimonialValidator, Helper.ifErrors, targetController.possibleTarget)

// router.post('/account/targets', auth, TargetValidator.updateAccountTarget, Helper.ifErrors, targetController.updateAccountTarget)
// router.get('/account/targets', auth, TargetValidator.getAccountTarget, Helper.ifErrors, targetController.accountTargetLists)

// router.post('/project/targets', auth, TargetValidator.updateProjectTarget, Helper.ifErrors, targetController.updateProjectTarget)
// router.get('/project/targets', TargetValidator.getProjectTarget, Helper.ifErrors, targetController.getProjectTarget)

module.exports = router;
