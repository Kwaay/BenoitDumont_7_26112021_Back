const express = require('express');

const router = express.Router();
const reactionCtrl = require('../controllers/reaction');
const auth = require('../middleware/auth');

router.get('/', auth, reactionCtrl.getAllReactions);
router.post('/', auth, reactionCtrl.createReaction);
router.get('/:ReactionId', auth, reactionCtrl.getOneReaction);
router.patch('/:ReactionId', auth, reactionCtrl.modifyReaction);
router.delete('/:ReactionId', auth, reactionCtrl.deleteReaction);

module.exports = router;
