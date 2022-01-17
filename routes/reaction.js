const express = require('express');

const router = express.Router();
const reactionCtrl = require('../controllers/reaction');
const auth = require('../middleware/auth');
const checkRights = require('../middleware/checkRights');

router.get('/', auth, reactionCtrl.getAllReactions);
router.post('/', auth, reactionCtrl.createReaction);
router.get('/:ReactionId', auth, reactionCtrl.getOneReaction);
router.patch('/:ReactionId', auth, checkRights({ role: 1, owner: true, model: 'Reaction' }), reactionCtrl.modifyReaction);
router.delete('/:ReactionId', auth, checkRights({ role: 1, owner: true, model: 'Reaction' }), reactionCtrl.deleteReaction);

module.exports = router;
