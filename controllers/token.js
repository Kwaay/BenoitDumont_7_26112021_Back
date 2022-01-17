const { User, Token } = require('../models');

// Récupération de tous les tokens
exports.getAllTokens = async (req, res) => {
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

// Récupération d'un token en particulier
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
    } return res.status(404).json({ message: 'Token not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Cannot get this Token. Please try again.' });
  }
};

// Suppression d'un token
exports.deleteToken = async (req, res) => {
  try {
    await Token.findOne({ where: { id: req.params.TokenId } })
      .catch(() => {
        res.status(404).json({ message: 'Token not found' });
      });
    const deleteToken = await Token.destroy({ where: { id: req.params.TokenId } });
    if (deleteToken) {
      return res.status(200).json({ message: 'Token has been deleted' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
