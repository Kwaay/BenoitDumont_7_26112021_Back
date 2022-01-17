const express = require('express');

const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const checkRights = require('../middleware/checkRights');

router.get('/', auth, commentCtrl.getAllComments);
router.post('/', auth, multer, commentCtrl.createComment);
router.get('/:CommentId', auth, multer, commentCtrl.getOneComment);
router.patch('/:CommentId', auth, checkRights({ role: 1, owner: true, model: 'Comment' }), multer, commentCtrl.modifyComment);
router.delete('/:CommentId', auth, checkRights({ role: 1, owner: true, model: 'Comment' }), commentCtrl.deleteComment);

module.exports = router;
