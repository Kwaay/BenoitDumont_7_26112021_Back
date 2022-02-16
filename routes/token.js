const express = require('express');

const router = express.Router();
const tokenCtrl = require('../controllers/token');
const auth = require('../middleware/auth');
const checkRights = require('../middleware/checkRights');

router.get('/', auth, checkRights({ role: 1 }), tokenCtrl.getAllTokens);
router.get('/:TokenId', auth, checkRights({ role: 1, owner: true, model: 'Token' }), tokenCtrl.getOneToken);
router.get('/user/:UserId', auth, checkRights({ role: 1 }), tokenCtrl.getAllTokensForAnUser);
router.delete('/:TokenId', auth, checkRights({ role: 1, owner: true, model: 'Token' }), tokenCtrl.deleteToken);

module.exports = router;
