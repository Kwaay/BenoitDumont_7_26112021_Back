const { User, Post, Reaction } = require('../models');
require('dotenv').config();

// Récupération de tous les posts orberBy date de création et trié de façon décroissante //
exports.getAllReactions = async (_req, res) => {
  try {
    const findAllReactions = await Reaction.findAll({
      order: [
        ['createdAt', 'DESC'],
      ],
    });
    if (findAllReactions) {
      return res.status(200).json(findAllReactions);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Cannot get Reactions. Please try again' });
  }
  return true;
};

// Création d'une réaction
exports.createReaction = async (req, res) => {
  const postSearch = await Post.findOne({ where: { id: req.body.PostId } });
  if (!postSearch) {
    return res.status(404).json({ message: 'Post Not Found' });
  }
  const { PostId, type } = req.body;
  if (typeof type !== 'number' || Number.isNaN(type)) {
    return res.status(400).json({ message: 'Type must be a number' });
  }
  if (typeof PostId !== 'number' || Number.isNaN(PostId)) {
    return res.status(400).json({ message: 'PostId must be a number' });
  }
  try {
    const searchReaction = await Reaction.findOne({
      where: {
        PostId, UserId: req.token.UserId,
      },
    });
    if (searchReaction) {
      return res.status(409).json({ message: 'Reaction already exists' });
    }
    const reactionCreation = await Reaction.create({
      type,
      PostId,
      UserId: req.token.UserId,
    });
    if (reactionCreation) {
      return res.status(201).json({ message: 'Reaction Created' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
  return true;
};

// Récupération d'une réaction : include: titre , contenu du Post : l'username et l'avatar
exports.getOneReaction = async (req, res) => {
  try {
    const findOneReaction = await Reaction.findOne({
      where: {
        id: req.params.ReactionId,
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
    if (findOneReaction) {
      return res.status(200).json(findOneReaction);
    }
    return res.status(404).json({ message: 'Reaction not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Cannot get this reaction. Please try again.' });
  }
};

// Modification d'une réaction en particulier
exports.modifyReaction = async (req, res) => {
  const reactionFind = await Reaction.findOne({ where: { id: req.params.ReactionId } });
  if (!reactionFind) {
    return res.status(404).json({ message: 'Reaction not found' });
  }
  const searchPost = await Post.findOne({ where: { id: req.body.PostId } });
  if (!searchPost) {
    return res.status(404).json({ message: 'Post not found' });
  }
  const { PostId, type } = req.body;
  if (typeof type !== 'number' || Number.isNaN(type)) {
    return res.status(400).json({ message: 'Type must be a number' });
  }
  if (typeof PostId !== 'number' || Number.isNaN(PostId)) {
    return res.status(400).json({ message: 'PostId must be a number' });
  }
  try {
    const searchReaction = await Reaction.findOne({
      where: {
        PostId, UserId: req.token.UserId, type,
      },
    });
    if (searchReaction) {
      return res.status(409).json({ message: 'Reaction already exists' });
    }
    let reactionObject = {};
    reactionObject = { ...req.body };
    const updateReaction = await Reaction.update({
      ...reactionObject,
    }, { where: { id: req.params.ReactionId } });
    if (updateReaction) {
      return res.status(200).json({ message: 'Reaction successfully updated' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Something went wrong. Please try again.' });
  }
  return true;
};

// Suppression d'une réaction en particulier
exports.deleteReaction = async (req, res) => {
  try {
    const reactionFind = await Reaction.findOne({ where: { id: req.params.ReactionId } });
    if (!reactionFind) {
      return res.status(404).json({ message: 'Reaction not found' });
    }
    const deleteReaction = await Reaction.destroy({ where: { id: req.params.ReactionId } });
    if (deleteReaction) {
      return res.status(200).json({ message: 'Reaction has been deleted' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
