const { User, Post, Comment } = require('../models');
require('dotenv').config();

const regexContent = /^[a-zA-Z0-9 _-]{4,255}$/;

// Récupération de tous les commentaires orderBy date de création et trié de façon décroissante //
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

// Création d'un commentaire
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

// Récupération d'un commentaire : include: titre, contenu du Post : l'username et l'avatar
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

// Modification d'un commentaire en particulier
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

// Suppression d'un commentaire en particulier
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
