const { User, Token } = require('../models');

async function checkIfAdmin(req, res) {
  if (req.token.rank !== 1) {
    return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
  }
  return true;
}
async function checkIfOwner(req, res) {
  const token = await Token.findOne({ where: { id: req.params.TokenId } });
  if (req.token.UserId !== token.UserId) {
    return res.status(401).json({ message: 'You are not the owner of this resource' });
  }
  return true;
}

// Récupération de tous les tokens
exports.getAllTokens = async (req, res) => {
  if (await checkIfOwner(req, res) !== true && checkIfAdmin(req, res) !== true) return false;
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
  if (await checkIfOwner(req, res) !== true && checkIfAdmin(req, res) !== true) return false;
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
    res.status(500).json({ message: 'Cannot get this Token. Please try again.' });
  }
  return true;
};

// Suppression d'un token
exports.deleteToken = async (req, res) => {
  try {
    if (await checkIfOwner(req, res) !== true && checkIfAdmin(req, res) !== true) return false;
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
