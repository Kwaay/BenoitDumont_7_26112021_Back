const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.post('/forgot', userCtrl.forgot);
router.post('/forgot/modify', userCtrl.forgotModify);
router.get('/', auth, userCtrl.getAllUsers);
router.post('/', auth, multer, userCtrl.createUser);
router.get('/me', auth, userCtrl.myUser);
router.get('/:UserId', auth, userCtrl.getOneUser);
router.patch('/:UserId', auth, multer, userCtrl.modifyUser);
router.delete('/:UserId', auth, userCtrl.deleteUser)

module.exports = router;