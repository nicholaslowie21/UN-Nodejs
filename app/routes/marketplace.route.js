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
router.post('/filter/fundingNeeds', MarketValidator.filterProj, Helper.ifErrors, marketController.getFilteredFundingNeeds);

router.post('/contributeMoney', auth, MarketValidator.contributeMoney, Helper.ifErrors, marketController.contributeMoney)

router.get('/myConsolidatedProjectReq', auth, MarketValidator.consolidatedPage, Helper.ifErrors, marketController.getMyConsolidatedProjectReq);

router.get('/resource/detail/projectReq', auth, MarketValidator.resourceDetailPageProjectReq, Helper.ifErrors, marketController.getResourceDetailProjectReq);
router.get('/resource/detail/resourceReq', auth, MarketValidator.resourceDetailPageResourceReq, Helper.ifErrors, marketController.getResourceDetailResourceReq);

router.get('/project/projectReq', auth, MarketValidator.projectPageReq, Helper.ifErrors, marketController.getProjectPageProjectReq);
router.get('/project/resourceReq', auth, MarketValidator.projectPageReq, Helper.ifErrors, marketController.getProjectPageResourceReq);

router.post('/accept/projectReq', auth, MarketValidator.acceptProjectReq, Helper.ifErrors, marketController.acceptProjectReq)
router.post('/decline/projectReq', auth, MarketValidator.acceptProjectReq, Helper.ifErrors, marketController.declineProjectReq)
router.post('/cancel/projectReq', auth, MarketValidator.acceptProjectReq, Helper.ifErrors, marketController.cancelProjectReq)
router.post('/complete/projectReq', auth, MarketValidator.acceptProjectReq, Helper.ifErrors, marketController.completeProjectReq)

router.post('/accept/resourceReq', auth, MarketValidator.acceptResourceReq, Helper.ifErrors, marketController.acceptResourceReq)
router.post('/decline/resourceReq', auth, MarketValidator.acceptResourceReq, Helper.ifErrors, marketController.declineResourceReq)
router.post('/cancel/resourceReq', auth, MarketValidator.acceptResourceReq, Helper.ifErrors, marketController.cancelResourceReq)
router.post('/complete/resourceReq', auth, MarketValidator.acceptResourceReq, Helper.ifErrors, marketController.completeResourceReq)

router.get('/suggestion/resource', auth, MarketValidator.suggestResource, Helper.ifErrors, marketController.getResourceSuggestion);
router.get('/suggestion/resourceneed', auth, MarketValidator.suggestResourceNeed, Helper.ifErrors, marketController.getResourceNeedSuggestion )

router.get('/test', auth, marketController.testEndpoint)

module.exports = router;
