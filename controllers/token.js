const { User, Token } = require('../models');

async function checkIfAdmin(req, res) {
  if (!req.token.rank === 1) {
    return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
  }
  return true;
}

// Récupération de tous les tokens
exports.getAllTokens = async (_req, res) => {
  checkIfAdmin();
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
    res.status(400).json({ error });
  }
  return true;
};

// Récupération d'un token en particulier
exports.getOneToken = async (req, res) => {
  checkIfAdmin();
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
  } catch (error) {
    res.status(404).json({ error });
  }
  return true;
};

// Suppression d'un token
exports.deleteToken = async (req, res) => {
  checkIfAdmin();
  await Token.findOne({ where: { id: req.params.TokenId } })
    .catch(() => {
      res.status(404).json({ message: 'Token not found' });
    });
  const deleteToken = await Token.destroy({ where: { id: req.params.TokenId } });
  if (deleteToken) {
    return res.status(200).json({ message: 'Token has been deleted' });
  }
  return true;
};
