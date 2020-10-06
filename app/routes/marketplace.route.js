const express = require('express');
const router = express.Router();
const marketController = require('../controller/marketplace.controller');
const auth = require('../middleware/auth')

const MarketValidator = require('../validator/marketplace.validator');
const Helper = require('../service/helper.service');

router.post('/requestResource', auth, MarketValidator.reqResource, Helper.ifErrors, marketController.reqResource)
router.post('/useKnowledgeResource', auth, MarketValidator.useKnowledgeResource, Helper.ifErrors, marketController.useKnowledgeResource)

router.get('/resources/manpower', marketController.getManpowerList);
router.get('/resources/item', marketController.getItemList);
router.get('/resources/venue', marketController.getVenueList);
router.get('/resources/knowledge', marketController.getKnowledgeList);

router.get('/projects', marketController.getProjectList);
router.post('/filter/projects', MarketValidator.filterProj, Helper.ifErrors, marketController.getProjectListFiltered);

router.post('/requestProject', auth, MarketValidator.reqProject, Helper.ifErrors, marketController.reqProject)


module.exports = router;
