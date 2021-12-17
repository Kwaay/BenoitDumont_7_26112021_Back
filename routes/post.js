const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post');

router.get('/',postCtrl.getAllPosts);
router.post('/',postCtrl.createPost);
router.get('/:postId',postCtrl.getOnePost);
router.put('/:postId', postCtrl.modifyPost);
router.delete('/:postId', postCtrl.deletePost);

module.exports = router;