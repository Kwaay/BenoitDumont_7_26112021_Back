const { User, Token } = require('../models');

/**
 * @function getAllTokens Get all tokens from the database and return them to the user.
 *
 * @param {object} _req - The request object
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getAllTokens = async (_req, res) => {
  try {
    const findAllTokens = await Token.findAll({
      order: [
        ['createdAt', 'ASC'],
      ],
    });
    if (findAllTokens) {
      return res.status(200).json(findAllTokens);
    }
  } catch (error) {
    res.status(500).json({ message: 'Cannot get Tokens. Please try again.' });
  }
  return true;
};

/**
 * @function getOneToken Find a token by its ID
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {number} req.params.TokenId - The ID of the token in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getOneToken = async (req, res) => {
  try {
    const findOneToken = await Token.findOne({
      where: {
        id: req.params.TokenId,
      },
      include: [{
        model: User,
      }],
    });
    if (findOneToken) {
      return res.status(200).json(findOneToken);
    }
    return res.status(404).json({ message: 'Token not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Cannot get this Token. Please try again.' });
  }
};

exports.getAllTokensForAnUser = async (req, res) => {
  try {
    console.log(req.params.UserId);
    const findAllTokensForAnUser = await Token.findAll({
      where: {
        UserId: req.params.UserId,
      },
      include: [
        {
          model: User,
        },
      ],
    });
    if (findAllTokensForAnUser) {
      return res.status(200).json(findAllTokensForAnUser);
    }
    return res.status(402).json({ message: 'Token not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Cannot get this Token. Please try again.' });
  }
};

/**
 * @function deleteToken Find a token by its ID.
 * If the token is found, delete it.
 * If the token is not found, return a 404 error.
 * If an error occurs, return a 500 error.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {number} req.params.TokenId - The ID of the token in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.deleteToken = async (req, res) => {
  try {
    const token = await Token.findOne({ where: { id: req.params.TokenId } });
    if (!token) {
      res.status(404).json({ message: 'Token not found' });
    }
    const deleteToken = await Token.destroy({ where: { id: req.params.TokenId } });
    if (deleteToken) {
      return res.status(200).json({ message: 'Token has been deleted' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
