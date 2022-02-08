/* Importing the package.json file from the root directory. */
const config = require('../package.json');

/**
 * @function getDependencies
 * The getDependencies function returns the Dependencies object from the config.json file.
 *
 * @param {object} _req - The request object
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getDependencies = async (_req, res) => {
  if (config) {
    return res.status(200).json(config.dependencies);
  }
  return false;
};

/**
 * @function getDevDependencies
 * The getDevDependencies function returns the devDependencies object from the config.json file.
 *
 * @param {object} _req - The request object
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getDevDependencies = async (_req, res) => {
  if (config) {
    return res.status(200).json(config.devDependencies);
  }
  return false;
};
