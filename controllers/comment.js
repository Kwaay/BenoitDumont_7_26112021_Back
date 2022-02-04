const { User, Post, Comment } = require('../models');
require('dotenv').config();

const regexContent = /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ _-]{4,25}$/;

/**
 * @function getAllComments  Get all comments from the database and return them as a JSON object.
 *
 * @param {object} _req - The request object
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getAllComments = async (_req, res) => {
  try {
    const findAllComments = await Comment.findAll({
      order: [
        ['createdAt', 'DESC'],
      ],
    });
    if (findAllComments) {
      return res.status(200).json(findAllComments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Cannot get Comments. Please try again.' });
  }
  return true;
};

/**
 * @function createComment The function checks if the post who the comment is related exists
 * and if the user who created it exists too, if not it send a 404 error.
 * After that, it checks the format of the send data and
 * it checks if the comment don't already exists'
 *
 * @param {object} req - the request object
 * @param {object} req.body - the request body
 * @param {string} req.body.content - the content of the comment
 * @param {number} req.body.PostId - The ID of the post
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.createComment = async (req, res) => {
  const searchPost = await Post.findOne({ where: { id: req.body.PostId } });
  if (!searchPost) {
    return res.status(404).json({ message: 'Post not found' });
  }
  const searchUser = await User.findOne({ where: { id: req.token.UserId } });
  if (!searchUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!regexContent.test(req.body.content)) {
    return res.status(400).json({ message: 'Content doesn\'t have a correct format' });
  }
  const { PostId, content } = req.body;
  if (typeof PostId !== 'number' || Number.isNaN(PostId)) {
    return res.status(400).json({ message: 'PostId must be a number' });
  }
  try {
    const searchComment = await Comment.findOne({
      where: {
        PostId, UserId: req.token.UserId, content,
      },
    });
    if (searchComment) {
      return res.status(409).json({ message: 'Comment already exists' });
    }
    const CommentCreation = await Comment.create({
      content,
      PostId,
      UserId: req.token.UserId,
    });
    if (CommentCreation) {
      return res.status(201).json({ message: 'Comment Created' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
  return true;
};

/**
 * @function getOneComment Find a comment by its ID,
 * and include the post and user associated with it.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {number} req.params.CommentId - The ID of the comment in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getOneComment = async (req, res) => {
  try {
    const findOneComment = await Comment.findOne({
      where: {
        id: req.params.CommentId,
      },
      include: [{
        model: Post,
        attributes: ['title', 'content'],
      },
      {
        model: User,
        attributes: ['username', 'avatar'],
      }],
    });
    if (findOneComment) {
      return res.status(200).json(findOneComment);
    }
    return res.status(404).json({ message: 'Comment not found' });
  } catch (error) {
    res.status(500).json({ message: 'Cannot get this comment. Please try again' });
  }
  return true;
};

/**
 * @function modifyComment The modifyComment function is used to modify a comment,
 * the function checks if the comment exists, or returns a 404 error.
 * It checks if the format of the data is correct or returns a 400 error if not.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {number} req.params.CommentId - The ID of the comment in the URL
 * @param {string} req.body - The request body
 * @param {string} req.body.content - The content of the comment
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.modifyComment = async (req, res) => {
  try {
    const findComment = await Comment.findOne({ where: { id: req.params.CommentId } });
    if (!findComment) {
      return res.status(404).json({ message: 'Comment Not Found' });
    }
    if (!regexContent.test(req.body.content)) {
      return res.status(400).json({ message: 'Content doesn\'t have a correct format' });
    }
    delete req.body.PostId;
    let commentObject = {};
    commentObject = { ...req.body };
    const updateComment = await Comment.update({
      ...commentObject,
    }, { where: { id: req.params.CommentId } });
    if (updateComment) {
      return res.status(200).json({ message: 'Comment successfully updated' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again' });
  }
};

/**
 * @function deleteComment Find a comment by its ID, and delete it.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {number} req.params.CommentId - The ID of the comment in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ where: { id: req.params.CommentId } });
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
    }
    const deleteComment = await Comment.destroy({ where: { id: req.params.CommentId } });
    if (deleteComment) {
      return res.status(200).json({ message: 'Comment has been deleted' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
