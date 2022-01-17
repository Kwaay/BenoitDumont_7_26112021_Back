const fsp = require('fs/promises');
const {
  User, Post, Reaction, Comment,
} = require('../models');
require('dotenv').config();

const regexTitle = /^[A-Z]{1}[a-z-_ ]{2,15}$/;
const regexContent = /^[a-zA-Z0-9 _-]{4,255}$/;

// Récupération de tous les posts orderBy date de création et trié de façon décroissante //
exports.getAllPosts = async (_req, res) => {
  try {
    const findAllPosts = await Post.findAll({
      order: [
        ['createdAt', 'DESC'],
      ],
    });
    if (findAllPosts) {
      return res.status(200).json(findAllPosts);
    }
  } catch (error) {
    res.status(500).json({ message: 'Cannot get Posts. Please try again.' });
  }
  return true;
};

// Création d'un post
exports.createPost = async (req, res) => {
  if (!regexTitle.test(req.body.title)) {
    return res.status(400).json({ message: 'Title doesn\'t have a correct format' });
  }
  if (!regexContent.test(req.body.content)) {
    return res.status(400).json({ message: 'Content doesn\'t have a correct format' });
  }
  delete req.body.image;
  try {
    const searchTitle = await Post.findOne({
      where: {
        title: req.body.title, UserId: req.token.UserId,
      },
    });
    if (searchTitle) {
      return res.status(409).json({ message: 'Title already exists' });
    } if (req.files) {
      const postCreation = await Post.create({
        title: req.body.title,
        content: req.body.content,
        image: `${req.protocol}://${req.get('host')}/images/${req.files.image[0].filename}`,
        UserId: req.token.UserId,
      });
      if (postCreation) {
        return res.status(201).json({ message: 'Post Created with an image' });
      }
    }
    const postCreation = await Post.create({
      title: req.body.title,
      content: req.body.content,
      UserId: req.token.UserId,
    });
    if (postCreation) {
      return res.status(201).json({ message: 'Post Created without image' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Post Creation Failed. Please try again.' });
  }
  return true;
};

/* Récupération d'un post en particulier qui inclus l'id,
l'username et l'avatar de l'user relié au post et les réactions du post récupéré */
exports.getOnePost = async (req, res) => {
  try {
    const findOnePost = await Post.findOne({
      where: {
        id: req.params.PostId,
      },
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatar'],
      },
      {
        model: Reaction,
        attributes: ['id', 'UserId', 'type'],
      },
      {
        model: Comment,
      },
      ],
    });
    if (findOnePost) {
      return res.status(200).json(findOnePost);
    }
    return res.status(404).json({ message: 'Post not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Cannot get this post. Please try again.' });
  }
};

// Modification d'un post en particulier
exports.modifyPost = async (req, res) => {
  const post = await Post.findOne({ where: { id: req.params.PostId } });
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (req.body.title !== undefined && !regexTitle.test(req.body.title)) {
    return res.status(400).json({ message: 'Title doesn\'t have a correct format' });
  }
  if (req.body.content !== undefined && !regexContent.test(req.body.content)) {
    return res.status(400).json({ message: 'Content doesn\'t have a correct format' });
  }
  delete req.body.image;
  try {
    if (req.body.title !== null && req.body.title !== undefined) {
      const titleCompare = await Post.findOne({
        where: {
          title: req.body.title, UserId: req.token.UserId,
        },
      });
      if (titleCompare) {
        return res.status(409).json({ message: 'Title already exists' });
      }
    }
    let postObject = {};
    if (req.files) {
      postObject = {
        ...JSON.stringify(req.body),
        image: `${req.protocol}://${req.get('host')}/images/${req.files.image[0].filename}`,
      };
      const postFind = await Post.findOne({ where: { id: req.params.PostId } });
      if (postFind.image !== null || postFind.image !== undefined) {
        const filename = postFind.image.split('/images/')[1];
        await fsp.unlink(`./images/ + ${filename}`);
      }
    } else {
      postObject = { ...req.body };
    }
    const updatePost = await Post.update({ ...postObject }, { where: { id: req.params.PostId } });
    if (updatePost) {
      return res.status(200).json({ message: 'Post has been modified' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
  return true;
};

// Suppression d'un post en particulier
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.PostId } });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.image !== null && post.image !== undefined) {
      const filename = post.image.split('/images/')[1];
      await fsp.unlink(`./images/ + ${filename}`);
    }
    const deletePost = await Post.destroy({ where: { id: req.params.PostId } });
    if (deletePost) {
      return res.status(200).json({ message: 'Post has been deleted' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
