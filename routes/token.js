const express = require('express');
const router = express.Router();
const tokenCtrl = require('../controllers/token');
const auth = require('../middleware/auth');

router.get('/', auth, tokenCtrl.getAllTokens);
router.get('/:tokenId', auth, tokenCtrl.getOneToken);
router.delete('/:tokenId', auth, tokenCtrl.deleteToken);

module.exports = router;