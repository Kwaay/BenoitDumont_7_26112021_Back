const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post');

router.get('/',postCtrl.getAllUsers);
router.post('/',postCtrl.createUser);
router.get('/:postId',postCtrl.getOneUser);
router.put('/:postId', postCtrl.modifyUser);
router.delete('/:postId', postCtrl.deleteUser);

module.exports = router;