const express = require('express');

const router = express.Router();
const configCtrl = require('../controllers/config');
const auth = require('../middleware/auth');
const checkRights = require('../middleware/checkRights');

router.get('/dependencies', auth, checkRights({ role: 1 }), configCtrl.getDependencies);
router.get('/devdependencies', auth, checkRights({ role: 1 }), configCtrl.getDevDependencies);
router.post('/checkUpdatesDependencies', auth, checkRights({ role: 1 }), configCtrl.getDependenciesUpdate);

module.exports = router;
