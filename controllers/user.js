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

const regexName = /^[A-Z]{1}[a-z]{2,15}$/;
const regexFirstname = /^[A-Z]{1}[a-z]{2,15}$/;
const regexUsername = /^[a-zA-Z0-9_-]{4,10}$/;
const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
const regexQuestion = /^[a-zA-Z0-9_-]{4,15}$/;
const regexReponse = /^[a-zA-Z0-9_-]{4,15}$/;

/* password must contain 1 number (0-9),
1 uppercase letters, 1 lowercase letters,
1 non-alpha numeric number, 8-16 characters with no space
*/

async function autoPurge() {
  const datetime = new Date();
  datetime.setHours(datetime.getHours() - 23);
  // Test : datetime.setSeconds(datetime.getSeconds() - 20);
  const format = datetime.toISOString().replace('Z', '').replace('T', ' ').slice(0, 19);
  await Token.destroy({
    where: {
      createdAt: {
        [Op.gt]: format,
      },
    },
  });
}
async function checkIfAdmin(req, res) {
  if (!req.token.rank === 1) {
    return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
  }
  return true;
}

// Partie 'S'inscrire'
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
  if (typeof req.body.rank !== 'number' || Number.isNaN(req.body.rank)) {
    return res.status(400).json({ message: 'Rank must be a number' });
  }
  delete req.body.avatar;
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
      User.create({
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
    } else {
      // Hash de l'email en MD5 pour pouvoir vérifier si un avatar est relié depuis Gravatar
      const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
      fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
        method: 'GET',
      })
        .then((value) => {
          const gravatarImage = value.url;
          User.create({
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
          }).then(() => {
            res.status(201).json({ message: 'User Created' });
          })
            .catch((error) => {
              res.status(500).json({ error });
            });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    }
    // Si le body ne contient pas de fichier
  } catch (error) {
    res.status(400).json({ error });
  }
  return true;
};

// Partie 'Se connecter'
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
      res.status(500).json({ error });
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
        return res.status(404).json({ error: 'User not found' });
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
      res.status(500).json({ error });
    }
  }
  return true;
};

// Récupération de l'email pour savoir quel compte modifier
exports.forgot = async (req, res) => {
  if (!regexEmail.test(req.body.email)) {
    return res.status(400).json({ message: 'Email doesn\'t have a correct format' });
  }
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(
    user.question,
  );
  return true;
};

// Modification du mot de passe si la réponse à la question est good
exports.forgotModify = async (req, res) => {
  if (!regexQuestion.test(req.body.question)) {
    return res.status(400).json({ message: 'Question doesn\'t have a correct format' });
  }
  if (!regexPassword.test(req.body.password)) {
    return res.status(400).json({ message: 'Password doesn\'t have a correct format' });
  }
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
  const updatePassword = User.update({ ...hashPassword }, { where: { id: user.id } });
  if (updatePassword) {
    return res.status(200).json({ message: 'Password changed successfully' });
  }
  return true;
};

// Récupération de tous les utilisateurs
exports.getAllUsers = async (_req, res) => {
  checkIfAdmin();
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
    res.status(400).json({ error });
  }
  return true;
};

// Création d'un utilisateur
exports.createUser = async (req, res) => {
  checkIfAdmin();
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
  if (typeof req.body.rank !== 'number' || Number.isNaN(req.body.rank)) {
    return res.status(400).json({ message: 'Rank must be a number' });
  }
  delete req.body.avatar;
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
      const userCreation = User.create({
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
      if (userCreation) {
        return res.status(201).json({ message: 'User Created with an Image' });
      }
    } else {
      const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
      fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
        method: 'GET',
      })
        .then((value) => {
          const gravatarImage = value.url;
          User.create({
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
          })
            .then(() => {
              res.status(201).json({ message: 'User Created' });
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
  return true;
};

// Récupération de l'utilisateur actuel
exports.myUser = async (req, res) => {
  const user = await User.findOne({ where: { id: req.token.UserId } });
  if (user.id === req.token.UserId) {
    return res.status(200).json({
      user,
    });
  }
  return true;
};
// Récupération d'un utilisateur en particulier
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
  } catch (error) {
    res.status(404).json({ error });
  }
  return true;
};

// Modification d'un utilisateur en particulier
exports.modifyUser = async (req, res) => {
  checkIfAdmin();
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
  try {
    const userFind = await User.findOne({ where: { id: req.params.UserId } });
    if (!req.body.email === null || !req.body.email === undefined) {
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
      if (!userFind.avatar === null || !userFind.avatar === undefined) {
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
    res.status(400).json({ error });
  }
  return true;
};

// Suppression d'un utilisateur en particulier
exports.deleteUser = async (req, res) => {
  checkIfAdmin();
  const user = await User.findOne({ where: { id: req.params.UserId } })
    .catch(() => {
      res.status(404).json({ message: 'User not found' });
    });
  const filename = user.avatar.split('/images/')[1];
  await fsp.unlink(`./images/${filename}`);
  const deleteUser = await User.destroy({ where: { id: req.params.UserId } });
  if (deleteUser) {
    return res.status(200).json({ message: 'User has been deleted' });
  }
  return true;
};
