const express = require('express');

const router = express.Router();
const postCtrl = require('../controllers/post');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, postCtrl.getAllPosts);
router.post('/', auth, multer, postCtrl.createPost);
router.get('/:PostId', auth, multer, postCtrl.getOnePost);
router.patch('/:PostId', auth, multer, postCtrl.modifyPost);
router.delete('/:PostId', auth, postCtrl.deletePost);

module.exports = router;
