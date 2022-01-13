const express = require('express');
const router = express.Router();
const reactionCtrl = require('../controllers/reaction');
const auth = require('../middleware/auth');

router.get('/', auth, reactionCtrl.getAllReactions);
router.post('/', auth, reactionCtrl.createReaction);
router.get('/:reactionId', auth, reactionCtrl.getOneReaction);
router.patch('/:reactionId', auth, reactionCtrl.modifyReaction);
router.delete('/:reactionId', auth, reactionCtrl.deleteReaction);

module.exports = router;