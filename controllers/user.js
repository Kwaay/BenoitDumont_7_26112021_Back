const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
const fetch = require('node-fetch');
const { Op } = require('sequelize');
const maskdata = require('maskdata');
const fsp = require('fs/promises');
const {
  User, Post, Reaction, Token,
} = require('../models');

require('dotenv').config();

const regexName = /^[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-zàèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ]{2,15}$/;
const regexFirstname = /^[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-zàèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ]{2,15}$/;
const regexUsername = /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ_-]{4,20}$/;
const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@groupomania\.fr$/i;
const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
const regexQuestion = /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ,.?"'/ _-]{4,15}$/;
const regexReponse = /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ,.'"/ _-]{4,15}$/;

/* password must contain 1 number (0-9),
1 uppercase letters, 1 lowercase letters,
1 non-alpha numeric number, 8-16 characters with no space
*/

/**
 * @function autoPurge It deletes all tokens created before the current time minus 23 hours
 *
 * @returns {void}
 */
async function autoPurge() {
  const datetime = new Date();
  datetime.setHours(datetime.getHours() - 23);
  const format = datetime.toISOString().replace('Z', '').replace('T', ' ').slice(0, 19);
  await Token.destroy({
    where: {
      createdAt: {
        [Op.lt]: format,
      },
    },
  });
}

/**
 * @function signup  We check if the user has uploaded an image,
 * if so, we create a user with the image. If not, we
 * create a user with the Gravatar image.
 *
 * @param {object} req - The request object
 * @param {'http' | 'https'} req.protocol - The protocol of the request
 * @param {object} req.files - The files object
 * @param {object} req.body - The request body
 * @param {string} req.body.name - The name of the user
 * @param {string} req.body.firstname - The first name of the user
 * @param {string} req.body.lastname - The last name of the user
 * @param {string} req.body.email - The email address of the user
 * @param {string} req.body.password - The password of the user
 * @param {object | string} req.body.avatar - The avatar of the user
 * @param {string} req.body.question - The question of the user
 * @param {string} req.body.reponse - The reponse of the user
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.signup = async (req, res) => {
  // Vérification du format du contenu envoyé
  if (!regexName.test(req.body.name)) {
    return res.status(400).json({ message: 'Name doesn\'t have a correct format' });
  }
  if (!regexFirstname.test(req.body.firstname)) {
    return res.status(400).json({ message: 'Firstname doesn\'t have a correct format' });
  }
  if (!regexUsername.test(req.body.username)) {
    return res.status(400).json({ message: 'Username doesn\'t have a correct format' });
  }
  if (!regexEmail.test(req.body.email)) {
    return res.status(400).json({ message: 'Email doesn\'t have a correct format' });
  }
  if (!regexPassword.test(req.body.password)) {
    return res.status(400).json({ message: 'Password doesn\'t have a correct format' });
  }
  if (!regexQuestion.test(req.body.question)) {
    return res.status(400).json({ message: 'Question doesn\'t have a correct format' });
  }
  if (!regexReponse.test(req.body.reponse)) {
    return res.status(400).json({ message: 'Reponse doesn\'t have a correct format' });
  }
  delete req.body.avatar;
  delete req.body.rank;
  // Vérification si l'email est déjà utilisée
  const emailExist = await User.findOne({ where: { email: req.body.email } });
  if (emailExist) {
    return res.status(409).json({ message: 'Email has already been used' });
  }
  // Vérification si l'username a déjà été utilisé
  const usernameExist = await User.findOne({ where: { username: req.body.username } });
  if (usernameExist) {
    return res.status(409).json({ message: 'Username has already been used' });
  }
  try {
    // Hash du Mot de passe avec 10 tours de SALT
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    // Si le body contient un fichier
    if (req.files) {
      const userCreationUpload = await User.create({
        name: req.body.name,
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        avatar: `${req.protocol}://${req.get('host')}/images/${req.files.avatar[0].filename}`,
        maxSecurity: true,
        rank: 3,
        question: req.body.question,
        reponse: req.body.reponse,
      });
      if (userCreationUpload) {
        return res.status(201).json({ message: 'User Created with a uploaded image' });
      }
    } else {
      // Si le body ne contient pas de fichier
      // Hash de l'email en MD5 pour pouvoir vérifier si un avatar est relié depuis Gravatar
      const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
      const gravatar = await fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
        method: 'GET',
      });
      if (!gravatar.url) {
        return res.status(500).json({ message: 'Fetch Gravatar Failed' });
      }
      const gravatarImage = gravatar.url;
      const userCreationGravatar = User.create({
        name: req.body.name,
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        avatar: gravatarImage,
        maxSecurity: true,
        rank: 3,
        question: req.body.question,
        reponse: req.body.reponse,
      });
      if (userCreationGravatar) {
        return res.status(201).json({ message: 'User Created with an Gravatar Image' });
      }
      return true;
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
  return true;
};

/**
 * @function login We check if the user is trying to login with a username or an email.
 * If it's a username, we check ID the username exists in the database.
 * If it does, we check if the password is correct.
 * If it is, we create a token with the userId and the rank.
 * If it's an email, we check if the email exists in the database.
 * If it does, we check if the password is correct.
 * If it is, we create a token with the userId and the rank.
 *
 * @param {object} req - The request object
 * @param {string} req.useragent - The user agent
 * @param {string} req.ip - The IP address
 * @param {object} req.body - The request body
 * @param {string} req.body.username - The username of the user
 * @param {string} req.body.email - The email address of the user
 * @param {string} req.body.password - The password of the user
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.login = async (req, res) => {
  if (!regexPassword.test(req.body.password)) {
    return res.status(400).json({ error: 'Password doesn\'t have a correct format' });
  }
  // Cas ou l'utilisateur essaye de se connecter avec un username
  if (Object.prototype.hasOwnProperty.call(req.body, 'username')) {
    if (!regexUsername.test(req.body.username)) {
      return res.status(400).json({ message: 'Username doesn\'t have a correct format' });
    }
    try {
    // Vérification si l'username existe
      const user = await User.findOne({ where: { username: req.body.username } });
      if (!user) {
        return res.status(404).json({ error: 'Username not found' });
      }
      // Vérification si le mot de passe envoyé correspond à celui dans la base de données
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Failed to login' });
      }
      // Création d'un token de 24h avec l'UserId inclus
      const token = jwt.sign(
        {
          UserId: user.id,
          rank: user.rank,

        },
        process.env.SECRET_KEY_JWT,
        {
          expiresIn: '24h',
        },
      );
      // Fonction AutoPurge (Delete token +24h)
      autoPurge();

      // Récupération de l'userAgent
      const userAgent = `${req.useragent.browser} | ${req.useragent.version}`;

      // Si l'option de sécurite maximale est activée, l'IP est masquée en partie
      if (user.maxSecurity === true) {
        const maskStringOptions = {
          maskWith: '*',
          values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
          maskOnlyFirstOccurance: true,
          maskAll: false,
          maskSpace: false,
        };
        const { ip } = req;
        const strMask = maskdata.maskString(ip, maskStringOptions);
        await Token.create({
          token,
          userAgent,
          ipAddress: strMask,
          UserId: user.id,
        });
      } else {
        const { ip } = req;
        await Token.create({
          token,
          userAgent,
          ipAddress: ip,
          UserId: user.id,
        });
      }
      res.status(200).json({
        user,
        token,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
  }
  // Cas ou l'utilisateur essaye de se connecter avec un email
  if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
    if (!regexEmail.test(req.body.email)) {
      return res.status(400).json({ message: 'Email doesn\'t have a correct format' });
    }
    try {
      // Vérification si l'username existe
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(404).json({ error: 'Email not found' });
      }
      // Vérification si le mot de passe envoyé correspond à celui dans la base de données
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Failed to login' });
      }

      // Création d'un token de 24h avec l'UserId inclus
      const token = jwt.sign(
        {
          UserId: user.id,
          rank: user.rank,
        },
        process.env.SECRET_KEY_JWT,
        {
          expiresIn: '24h',
        },
      );

      // Fonction AutoPurge (Delete token +24h)
      autoPurge();

      // Récupération de l'userAgent
      const userAgent = `${req.useragent.browser} | ${req.useragent.version}`;

      // Si l'option de sécurite maximale est activée, l'IP est masquée en partie
      if (user.maxSecurity === true) {
        const maskStringOptions = {
          maskWith: '*',
          values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
          maskOnlyFirstOccurance: true,
          maskAll: false,
          maskSpace: false,
        };
        const { ip } = req;
        const strMask = maskdata.maskString(ip, maskStringOptions);
        await Token.create({
          token,
          userAgent,
          ipAddress: strMask,
          UserId: user.id,
        });
      } else {
        const { ip } = req;
        await Token.create({
          token,
          userAgent,
          ipAddress: ip,
          UserId: user.id,
        });
      }
      res.status(200).json({
        user,
        token,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
  }
  return true;
};

/**
 * @function forgot Find the user with the given email address.
 * If the user is not found, return a 404 error.
 * Return the user's security question.
 *
 * @param {object} req - The request object
 * @param {object} req.body - The request body
 * @param {string} req.body.email - The email address of the user
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.forgot = async (req, res) => {
  if (!regexEmail.test(req.body.email)) {
    return res.status(400).json({ message: 'Email doesn\'t have a correct format' });
  }
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(
      user.question,
    );
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again' });
  }
};

/**
 * @function forgotModify The user enters his email and a response to a security question.
 * If the email and response are correct, the user is asked to enter a new password.
 * If the new password is different from the current password, the password is updated.
 *
 * @param {object} req - The request object
 * @param {object} req.body - The request body
 * @param {string} req.body.email - The email address of the user
 * @param {string} req.body.reponse - The reponse of the user
 * @param {string} req.body.password - The password of the user
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.forgotModify = async (req, res) => {
  if (!regexEmail.test(req.body.email)) {
    return res.status(400).json({ message: 'Email doesn\'t have a correct format' });
  }
  if (!regexReponse.test(req.body.reponse)) {
    return res.status(400).json({ message: 'Reponse doesn\'t have a correct format' });
  }
  if (!regexPassword.test(req.body.password)) {
    return res.status(400).json({ message: 'Password doesn\'t have a correct format' });
  }
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.reponse !== req.body.reponse) {
      return res.status(400).json({ message: 'Wrong Response' });
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (valid) {
      return res.status(401).json({ error: 'Your new password is the same than your current password' });
    }
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const updatePassword = User.update({ password: hashPassword }, { where: { id: user.id } });
    if (updatePassword) {
      return res.status(200).json({ message: 'Password changed successfully' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again' });
  }
};

/* Get all users from the database and return them in a JSON format. */
/**
 * @param {object} _req - The request object
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getAllUsers = async (_req, res) => {
  try {
    const findAllUsers = await User.findAll({
      order: [
        ['createdAt', 'ASC'],
      ],
    });
    if (findAllUsers) {
      return res.status(200).json(findAllUsers);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Cannot get Users. Please try again.' });
  }
  return true;
};

/**
 * @function createUser We check if the user has uploaded an image,
 * if so, we create a user with an uploaded image.
 * If not, we create a user with a gravatar image.
 *
 * @param {object} req - The request object
 * @param {'http' | 'https'} req.protocol - The protocol of the request
 * @param {object} req.files - The files object
 * @param {object} req.body - The request body
 * @param {string} req.body.name - The name of the user
 * @param {string} req.body.firstname - The first name of the user
 * @param {string} req.body.lastname - The last name of the user
 * @param {string} req.body.email - The email address of the user
 * @param {string} req.body.password - The password of the user
 * @param {object | string} req.body.avatar - The avatar of the user
 * @param {boolean} req.body.maxSecurity - The maximum security level
 * @param {string} req.body.question - The question of the user
 * @param {string} req.body.reponse - The reponse of the user
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.createUser = async (req, res) => {
  // Vérification du format du contenu envoyé
  if (!regexName.test(req.body.name)) {
    return res.status(400).json({ message: 'Name doesn\'t have a correct format' });
  }
  if (!regexFirstname.test(req.body.firstname)) {
    return res.status(400).json({ message: 'Firstname doesn\'t have a correct format' });
  }
  if (!regexUsername.test(req.body.username)) {
    return res.status(400).json({ message: 'Username doesn\'t have a correct format' });
  }
  if (!regexEmail.test(req.body.email)) {
    return res.status(400).json({ message: 'Email doesn\'t have a correct format' });
  }
  if (!regexPassword.test(req.body.password)) {
    return res.status(400).json({ message: 'Password doesn\'t have a correct format' });
  }
  if (!regexQuestion.test(req.body.question)) {
    return res.status(400).json({ message: 'Question doesn\'t have a correct format' });
  }
  if (!regexReponse.test(req.body.reponse)) {
    return res.status(400).json({ message: 'Reponse doesn\'t have a correct format' });
  }
  delete req.body.rank;
  if (req.files) {
    if (!['true', 'false'].includes(req.body.maxSecurity)
    ) {
      return res.status(400).json({ message: 'maxSecurity must be a boolean' });
    }
  } else if (typeof req.body.maxSecurity !== 'boolean') {
    return res.status(400).json({ message: 'maxSecurity must be a boolean' });
  }
  const emailExist = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (emailExist) {
    return res.status(409).json({ message: 'Email has already been used' });
  }
  const usernameExist = await User.findOne({
    where: {
      username: req.body.username,
    },
  });
  if (usernameExist) {
    return res.status(409).json({ message: 'Username has already been used' });
  }
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    if (req.files) {
      const userCreationUpload = await User.create({
        name: req.body.name,
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        avatar: `${req.protocol}://${req.get('host')}/images/${req.files.avatar[0].filename}`,
        maxSecurity: true,
        rank: 3,
        question: req.body.question,
        reponse: req.body.reponse,
      });
      if (userCreationUpload) {
        return res.status(201).json({ message: 'User Created with an Uploaded Image' });
      }
    } else {
      const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
      const gravatar = await fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
        method: 'GET',
      });
      if (!gravatar.url) {
        return res.status(500).json({ message: 'Fetch Gravatar Failed' });
      }
      const gravatarImage = gravatar.url;
      const userCreationGravatar = User.create({
        name: req.body.name,
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        avatar: gravatarImage,
        maxSecurity: true,
        rank: 3,
        question: req.body.question,
        reponse: req.body.reponse,
      });
      if (userCreationGravatar) {
        return res.status(201).json({ message: 'User Created with an Gravatar Image' });
      }
      return true;
    }
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
  return true;
};

/**
 * @function myUser Find a user by their ID and return it
 * if the user is the same as the user in the token.
 *
 * @param {object} req - The request object
 * @param {object} req.token - The token generated by connecting
 * @param {number} req.token.UserId - The ID of the user in the token
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.myUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.token.UserId } });
    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    if (user.id === req.token.UserId) {
      return res.status(200).json({
        user,
      });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

/**
 * @function getOneUser The findOneUser function is used to find a user by their ID.
 * If the user is found, the function returns the user.
 * If the user is not found, the function returns a 404 error.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {number} req.params.UserId - The ID of a user in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.getOneUser = async (req, res) => {
  try {
    const findOneUser = await User.findOne({
      where: {
        id: req.params.UserId,
      },
      include: [{
        model: Post, Reaction,
      }],
    });
    if (findOneUser) {
      return res.status(200).json(findOneUser);
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Cannot get this User. Please try again.' });
  }
  return true;
};

/**
 * @function modifyUser The modifyUser function is used to modify a user,
 * the function checks if the user exists, or returns a 404 error.
 * It checks if the format of the data is correct or returns a 400 error if not.
 * If a image is send in the req.files, it delete the old and remplace it by the new image.
 *
 * @param {object} req - The request object
 * @param {'http' | 'https'} req.protocol - The protocol of the request
 * @param {object} req.files - The files object
 * @param {object} req.body - The request body
 * @param {string} req.params - The params in the URL
 * @param {string} req.params.UserId - The ID of a user in the URL
 * @param {string} req.body.name - The name of the user
 * @param {string} req.body.firstname - The first name of the user
 * @param {string} req.body.lastname - The last name of the user
 * @param {string} req.body.email - The email address of the user
 * @param {string} req.body.password - The password of the user
 * @param {object | string} req.body.avatar - The avatar of the user
 * @param {boolean} req.body.maxSecurity - The maximum security
 * @param {string} req.body.question - The question of the user
 * @param {string} req.body.reponse - The reponse of the user
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.modifyUser = async (req, res) => {
  const userFind = await User.findOne({ where: { id: req.params.UserId } });
  if (!userFind) {
    return res.status(404).json({ message: 'User not found' });
  }
  delete req.body.rank;
  // Vérification du format du contenu envoyé
  if (req.body.name !== undefined && !regexName.test(req.body.name)) {
    return res.status(400).json({ message: 'Name doesn\'t have a correct format' });
  }
  if (req.body.firstname !== undefined && !regexFirstname.test(req.body.firstname)) {
    return res.status(400).json({ message: 'Firstname doesn\'t have a correct format' });
  }
  if (req.body.username !== undefined && !regexUsername.test(req.body.username)) {
    return res.status(400).json({ message: 'Username doesn\'t have a correct format' });
  }
  if (req.body.email !== undefined && !regexEmail.test(req.body.email)) {
    return res.status(400).json({ message: 'Email doesn\'t have a correct format' });
  }
  if (req.body.password !== undefined && !regexPassword.test(req.body.password)) {
    return res.status(400).json({ message: 'Password doesn\'t have a correct format' });
  }
  if (req.body.question !== undefined && !regexQuestion.test(req.body.question)) {
    return res.status(400).json({ message: 'Question doesn\'t have a correct format' });
  }
  if (req.body.reponse !== undefined && !regexReponse.test(req.body.reponse)) {
    return res.status(400).json({ message: 'Reponse doesn\'t have a correct format' });
  }
  if (req.files) {
    if (req.body.maxSecurity && !['true', 'false'].includes(req.body.maxSecurity)) {
      return res.status(400).json({ message: 'maxSecurity must be a boolean' });
    }
  } else if (Object.prototype.hasOwnProperty.call(req.body, 'maxSecurity')) {
    if (typeof req.body.maxSecurity !== 'boolean') {
      return res.status(400).json({ message: 'maxSecurity must be a boolean' });
    }
  }
  try {
    if (req.body.email !== null && req.body.email !== undefined) {
      const checkEmail = await User.findOne({ where: { email: req.body.email } });
      if (checkEmail) {
        return res.status(409).json({ message: 'Email has already been used' });
      }
    }
    let userObject = {};
    if (req.files) {
      userObject = {
        ...JSON.stringify(req.body),
        avatar: `${req.protocol}://${req.get('host')}/images/${req.files.avatar[0].filename}`,
      };
      if (userFind.avatar !== null && userFind.avatar !== undefined && !userFind.avatar.includes('gravatar')) {
        const filename = userFind.avatar.split('/images/')[1];
        await fsp.unlink(`./images/${filename}`);
      }
    } else {
      userObject = { ...req.body };
    }
    /* si le lien dans la table contient gravatar.? > empty
      si l'image est dans le dossier images fs.unlink */
    const updateUser = await User.update({ ...userObject }, { where: { id: req.params.UserId } });
    if (updateUser) {
      return res.status(200).json({ message: 'User has been modified' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
  return true;
};

/**
 * @function deleteUser Find a user by ID, delete the user, and return a success message.
 *
 * @param {object} req - The request object
 * @param {object} req.params - The params in the URL
 * @param {string} req.params.UserId - The ID of the user in the URL
 * @param {object} res - The response object
 *
 * @returns {object} - response
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.UserId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.avatar !== null && user.avatar !== undefined) {
      const filename = user.avatar.split('/images/')[1];
      await fsp.unlink(`./images/${filename}`);
    }
    const deleteUser = await User.destroy({ where: { id: req.params.UserId } });
    if (deleteUser) {
      return res.status(200).json({ message: 'User has been deleted' });
    }
    return true;
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
