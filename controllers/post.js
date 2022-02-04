const fsp = require('fs/promises');
const {
  User, Post, Reaction, Comment,
} = require('../models');
require('dotenv').config();

const regexTitle = /^[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-z0-9àèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ?'"! _-]{2,15}$/;
const regexContent = /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;

/**
 * @function getAllPosts Get all posts from the database and return them to the user
 *
 * @param {object} _req - The request object
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getAllPosts = async (_req, res) => {
  try {
    const findAllPosts = await Post.findAll({
      order: [
        ['createdAt', 'DESC'],
      ],
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatar', 'name', 'firstname'],
      },
      {
        model: Reaction,
        attributes: ['id', 'UserId', 'type'],
      }],
    });
    if (findAllPosts) {
      return res.status(200).json(findAllPosts);
    }
  } catch (error) {
    res.status(500).json({ message: 'Cannot get Posts. Please try again.' });
  }
  return true;
};

/**
 * @function createPost We check if the title and content are valid,
 * then we check if the user is logged in, then we check if the user has a post with the same title,
 * then we check if the user has a file, then we create the post, then we return the status code
 *
 * @param {object} req - The request object
 * @param {'http' | 'https'} req.protocol - The protocol of the request
 * @param {object} req.files - The files object
 * @param {object} req.body - The request body
 * @param {object} req.token - The token generated by connecting
 * @param {number} req.token.userId - The ID of the user in the token
 * @param {object} req.body.title - The title of the post
 * @param {object} req.body.content - The content of the post
 * @param {object} req.body.media - The media of the post
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.createPost = async (req, res) => {
  if (!regexTitle.test(req.body.title)) {
    return res.status(400).json({ message: 'Title doesn\'t have a correct format' });
  }
  if (!regexContent.test(req.body.content)) {
    return res.status(400).json({ message: 'Content doesn\'t have a correct format' });
  }
  try {
    const user = await User.findOne({ where: { id: req.token.UserId } });
    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    const searchTitle = await Post.findOne({
      where: {
        title: req.body.title, UserId: req.token.UserId,
      },
    });
    if (searchTitle) {
      return res.status(409).json({ message: 'Title already exists' });
    }
    if (req.files) {
      const postCreation = Post.create({
        title: req.body.title,
        content: req.body.content,
        media: `${req.protocol}://${req.get('host')}/images/${req.files.media[0].filename}`,
        UserId: req.token.UserId,
      });
      if (postCreation) {
        return res.status(201).json({ message: 'Post Created with a media' });
      }
    }
    const postCreation = Post.create({
      title: req.body.title,
      content: req.body.content,
      UserId: req.token.UserId,
    });
    if (postCreation) {
      return res.status(201).json({ message: 'Post Created without media' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Post Creation Failed. Please try again.' });
  }
  return true;
};

/**
 * @function getOnePost Find a post by its ID and return it.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {string} req.params.PostId - The ID of the post in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
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

/**
 * @function modifyPost The modifyPost function is used to modify a post,
 * the function checks if the post exists, or returns a 404 error.
 * It checks if the format of the data is correct or returns a 400 error if not.
 * If a media is send in the req.files, it delete the old and remplace it by the new media
 * .
 * @param {object} req - The request object
 * @param {'http' | 'https'} req.protocol - The protocol of the request
 * @param {object} req.files - The files object
 * @param {object} req.token - The token generated by connecting
 * @param {number} req.token.UserId - The UserId in the token
 * @param {object} req.params - The params in the URL
 * @param {string} req.params.PostId - The ID of the post in the URL
 * @param {object} req.body - The request body
 * @param {object} req.body.title - The title of the post
 * @param {object} req.body.content - The content of the post
 * @param {object} req.body.media - The media of the post
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
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
  delete req.body.media;
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
        media: `${req.protocol}://${req.get('host')}/images/${req.files.media[0].filename}`,
      };
      const postFind = await Post.findOne({ where: { id: req.params.PostId } });
      if (postFind.media !== null || postFind.media !== undefined) {
        const filename = postFind.media.split('/images/')[1];
        await fsp.unlink(`./images/${filename}`);
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

/**
 * @function deletePost Find the post with the given ID,
 * if it exists, delete it and return a success message.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {number} req.params.PostId - The ID of the post in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.PostId } });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.media !== null && post.media !== undefined) {
      const filename = post.media.split('/images/')[1];
      await fsp.unlink(`./images/${filename}`);
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
