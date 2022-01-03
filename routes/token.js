//get one get all delete 
const express = require('express');
const router = express.Router();
const tokenCtrl = require('../controllers/token');

router.get('/',tokenCtrl.getAllTokens);
router.get('/:tokenId', tokenCtrl.getOneToken);
router.delete('/:tokenId', tokenCtrl.deleteToken);

module.exports = router;