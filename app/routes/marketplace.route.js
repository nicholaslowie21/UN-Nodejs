const express = require('express');
const router = express.Router();
const marketController = require('../controller/marketplace.controller');
const auth = require('../middleware/auth')

const MarketValidator = require('../validator/marketplace.validator');
const Helper = require('../service/helper.service');

router.post('/requestResource', auth, MarketValidator.reqResource, Helper.ifErrors, marketController.reqResource)
router.post('/useKnowledgeResource', auth, MarketValidator.useKnowledgeResource, Helper.ifErrors, marketController.useKnowledgeResource)
router.post('/auto/requestResource', auth, MarketValidator.reqAutoResource, Helper.ifErrors, marketController.reqAutoResource)
router.post('/auto/useKnowledgeResource', auth, MarketValidator.useAutoKnowledgeResource, Helper.ifErrors, marketController.useAutoKnowledgeResource)

router.get('/resources/manpower', marketController.getManpowerList);
router.get('/resources/item', marketController.getItemList);
router.get('/resources/venue', marketController.getVenueList);
router.get('/resources/knowledge', marketController.getKnowledgeList);

router.get('/projects', marketController.getProjectList);
router.post('/filter/projects', MarketValidator.filterProj, Helper.ifErrors, marketController.getProjectListFiltered);

router.get('/accProjects', MarketValidator.getProjects, Helper.ifErrors,  marketController.currProjects);


router.post('/requestProject', auth, MarketValidator.reqProject, Helper.ifErrors, marketController.reqProject)

router.get('/fundingNeeds', marketController.getFundingNeeds);
router.post('/contributeMoney', auth, MarketValidator.contributeMoney, Helper.ifErrors, marketController.contributeMoney)

module.exports = router;
