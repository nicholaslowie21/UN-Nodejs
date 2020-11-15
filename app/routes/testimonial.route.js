const express = require('express');
const router = express.Router();
const testimonialController = require('../controller/testimonial.controller');
const auth = require('../middleware/auth')

const TestimonialValidator = require('../validator/testimonial.validator');
const Helper = require('../service/helper.service');

router.get('/common/projects', auth, TestimonialValidator.getCommonProject, Helper.ifErrors, testimonialController.getCommonProject)
router.post('/request', auth, TestimonialValidator.requestTestimonial, Helper.ifErrors, testimonialController.requestTestimonial)
router.post('/write', auth, TestimonialValidator.writeTestimonial, Helper.ifErrors, testimonialController.writeTestimonial)

router.get('/outgoing', auth, TestimonialValidator.getTestimonial, Helper.ifErrors, testimonialController.getOutgoingTestimonial)
router.get('/', auth, TestimonialValidator.getTestimonial, Helper.ifErrors, testimonialController.getMyTestimonial)

router.post('/update/status', auth, TestimonialValidator.updateMyTestimonial, Helper.ifErrors, testimonialController.updateTestimonialStatus)
router.post('/outgoing/update/status', auth, TestimonialValidator.updateOutgoingTestimonial, Helper.ifErrors, testimonialController.updateOutgoingTestimonialStatus)

module.exports = router;
