const express = require('express');

const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const checkRights = require('../middleware/checkRights');

router.post('/signup', multer, userCtrl.signup);
router.post('/login', userCtrl.login);
router.post('/forgot', userCtrl.forgot);
router.post('/forgot/modify', userCtrl.forgotModify);
router.get('/', auth, checkRights({ role: 1 }), userCtrl.getAllUsers);
router.post('/', auth, checkRights({ role: 1 }), multer, userCtrl.createUser);
router.get('/me', auth, userCtrl.myUser);
router.get('/:UserId', auth, userCtrl.getOneUser);
router.patch('/:UserId', auth, checkRights({ role: 3, owner: true, model: 'User' }), multer, userCtrl.modifyUser);
router.delete('/:UserId', auth, checkRights({ role: 3, owner: true, model: 'User' }), userCtrl.deleteUser);

module.exports = router;
