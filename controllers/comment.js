const { User, Post, Comment } = require('../models');
require('dotenv').config();

async function checkIfModerator(req, res) {
  if (!req.token.rank === 1 || !req.token.rank === 2) {
    return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
  }
  return true;
}

const regexContent = /^[a-zA-Z0-9 _-]{4,}$/;

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
    res.status(400).json({ error });
  }
  return true;
};

// Création d'un commentaire
exports.createComment = async (req, res) => {
  if (!regexContent.test(req.body.content)) {
    return res.status(400).json({ message: 'Content doesn\'t have a correct format' });
  }
  const { PostId, content } = req.body;
  if (typeof PostId !== 'number' || Number.isNaN(PostId)) {
    return res.status(400).json({ message: 'PostId must be a number' });
  }
  try {
    const CommentCreation = await Comment.create({
      content,
      PostId,
      UserId: req.token.UserId,
    });
    if (CommentCreation) {
      return res.status(201).json({ message: 'Comment Created' });
    }
  } catch (error) {
    res.status(400).json({ error });
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
  } catch (error) {
    res.status(404).json({ error });
  }
  return true;
};

// Modification d'un commentaire en particulier
exports.modifyComment = async (req, res) => {
  checkIfModerator(req, res);
  if (!regexContent.test(req.body.content)) {
    return res.status(400).json({ message: 'Content doesn\'t have a correct format' });
  }
  const findComment = await Comment.findOne({ where: { id: req.params.CommentId } });
  if (!findComment) {
    return res.status(404).json({ message: 'Comment Not Found' });
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
};

// Suppression d'un commentaire en particulier
exports.deleteComment = async (req, res) => {
  checkIfModerator(req, res);
  await Comment.findOne({ where: { id: req.params.CommentId } })
    .catch(() => {
      res.status(404).json({ message: 'Comment not found' });
    });
  const deleteComment = await Comment.destroy({ where: { id: req.params.CommentId } });
  if (deleteComment) {
    return res.status(200).json({ message: 'Comment has been deleted' });
  }
  return true;
};
