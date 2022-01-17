const Models = require('../models');

/**
 * @function checkRights Check Authorization Middleware
 * @param {Object} config Objet de configuration
 * @param {String} config.model Ressource à vérifier
 * @param {Boolean} config.owner Vérification du propriétaire
 * @param {Number} config.role Niveau de permissions (1 = Admin, 2 = Admin / Modo, 3 = All)
*/

module.exports = (config) => async (req, res, next) => {
  if (config.owner === true && typeof config.role === 'undefined') {
    const resource = await Models[config.model].findOne({ where: { id: req.params[`${config.model}Id`] } });
    if (resource === null) return next();
    if (req.token.UserId !== resource.UserId) {
      return res.status(401).json({ message: 'Not Enough Permissions to perform this action' });
    }
  } else if (typeof config.owner === 'undefined' && typeof config.role === 'number') {
    if (req.token.rank > config.role) {
      return res.status(401).json({ message: 'Not Enough Permissions to perform this action' });
    }
  } else if (config.owner === true && typeof config.role === 'number') {
    const resource = await Models[config.model].findOne({ where: { id: req.params[`${config.model}Id`] } });
    if (resource === null) return next();
    if (req.token.UserId !== resource.UserId && req.token.rank > config.role) {
      return res.status(401).json({ message: 'Not Enough Permissions to perform this action' });
    }
  }
  return next();
};
