const express = require('express');
const router = express.Router();
const tokenCtrl = require('../controllers/token');
const auth = require('../middleware/auth');

router.get('/', auth, tokenCtrl.getAllTokens);
router.get('/:TokenId', auth, tokenCtrl.getOneToken);
router.delete('/:TokenId', auth, tokenCtrl.deleteToken);

module.exports = router;