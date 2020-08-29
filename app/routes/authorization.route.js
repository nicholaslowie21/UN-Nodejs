const express = require('express');
const router = express.Router();
const authorizationController = require('../controller/authorization.controller');

/* POST register user. */
router.post('/signup', authorizationController.postSignup);

module.exports = router;
