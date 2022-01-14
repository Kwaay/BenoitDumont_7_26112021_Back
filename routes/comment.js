const express = require('express');

const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, commentCtrl.getAllComments);
router.post('/', auth, multer, commentCtrl.createComment);
router.get('/:CommentId', auth, multer, commentCtrl.getOneComment);
router.patch('/:CommentId', auth, multer, commentCtrl.modifyComment);
router.delete('/:CommentId', auth, commentCtrl.deleteComment);

module.exports = router;
