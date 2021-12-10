const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/', userCtrl.getAllUsers);
router.post('/', userCtrl.createUser);
router.get('/me', userCtrl.myUser);
router.get('/:userId',userCtrl.getOneUser);
router.put('/:userId', userCtrl.modifyUser);
router.delete('/:userId', userCtrl.deleteUser)

module.exports = router;