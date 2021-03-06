const Models = require('../models');

/**
 * @function checkRights Check Authorization Middleware
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {object} req.token - The token generated by connecting
 * @param {object} req.token.UserId - The ID of the user in the token
 * @param {object} req.token.rank - The rank of the user in the token
 * @param {object} res - The response object
 * @param {object} next - The next middleware function
 * @param {object} config Objet de configuration
 * @param {string} config.model Ressource à vérifier
 * @param {boolean} config.owner Vérification du propriétaire
 * @param {number} config.role Niveau de permissions (1 = Admin, 2 = Admin / Modo, 3 = All)
 */

module.exports = (config) => async (req, res, next) => {
  console.log(config.role);
  if (config.owner === true && typeof config.role === 'undefined') {
    const resource = await Models[config.model].findOne({ where: { id: req.params[`${config.model}Id`] } });
    if (resource === null) return next();
    if (req.token.UserId !== resource.UserId) {
      return res.status(401).json({ message: 'Not Enough Permissions to perform this action 1' });
    }
  } else if (typeof config.owner === 'undefined' && typeof config.role === 'number') {
    if (req.token.rank > config.role) {
      return res.status(401).json({ message: 'Not Enough Permissions to perform this action 2' });
    }
  } else if (config.owner === true && typeof config.role === 'number') {
    const resource = await Models[config.model].findOne({ where: { id: req.params[`${config.model}Id`] } });
    console.log(resource);
    if (resource === null) return next();
    if (req.token.UserId !== resource.UserId && req.token.rank > config.role) {
      return res.status(401).json({ message: 'Not Enough Permissions to perform this action 3' });
    }
  }
  return next();
};
