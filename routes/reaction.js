const express = require('express');
const router = express.Router();
const reactionCtrl = require('../controllers/reaction');

router.get('/', reactionCtrl.getAllReactions);
router.post('/',reactionCtrl.createReaction);
router.get('/:reactionId',reactionCtrl.getOneReaction);
router.put('/:reactionId', reactionCtrl.modifyReaction);
router.delete('/:reactionId', reactionCtrl.deleteReaction);

module.exports = router;