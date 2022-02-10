// eslint-disable-next-line import/no-extraneous-dependencies
// const ncu = require('npm-package-update');
const { exec } = require('child_process');
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

/**
 * @function getDependenciesUpdate
 * The `getDependenciesUpdate` function is used to update the dependencies in the package.json file.
 *
 * @param {object} req - The request object
 * @param {object} req.body - The body of the request
 * @param {object} req.body.dependencies - The dependencies sent for update
 * @param {object} req.body.devDependencies - The devDependencies sent for update
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getDependenciesUpdate = async (req, res) => {
  const data = JSON.stringify({
    dependencies: req.body.dependencies,
    devDependencies: req.body.devDependencies,
  }).split('\'').join(' ');
  const execPromise = new Promise((resolve) => {
    exec(`ncu --packageData '${data}'`, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
  const results = await execPromise;
  if (results.error !== null) {
    return res.status(500).json({ message: 'Error when attempting to update dependencies' });
  }
  const splitDependenciesUpdate = results.stdout.split('\n');
  const trimmedDependenciesUpdate = splitDependenciesUpdate.map((line) => {
    const cleanLine = line.replace(/[ ][ ]+/g, ' ');
    const splitLine = cleanLine.split(' ');
    splitLine.splice(0, 1);
    splitLine.splice(2, 1);
    splitLine.splice(3, 1);
    return splitLine;
  });
  trimmedDependenciesUpdate.shift();
  trimmedDependenciesUpdate.pop();
  return res.status(200).json(trimmedDependenciesUpdate);
};
