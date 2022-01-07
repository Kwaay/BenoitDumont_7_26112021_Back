const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js')
const fetch = require("node-fetch");
const { User, Post, Reaction, Token } = require('../models');
const fsp = require('fs/promises');
const maskdata = require('maskdata')
const { Op } = require("sequelize");

require('dotenv').config()


const regexName = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexFirstname = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexUsername = /^[a-zA-Z0-9_-]{4,10}$/gm;
const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm;
// password must contain 1 number (0-9), 1 uppercase letters, 1 lowercase letters, 1 non-alpha numeric number, 8-16 characters with no space

async function autoPurge() {
    const datetime = new Date()
    datetime.setHours(datetime.getHours() - 23);
    // Test : datetime.setSeconds(datetime.getSeconds() - 20);
    let format = datetime.toISOString().replace('Z', '').replace('T', ' ').slice(0, 19);
    console.log(format);
    await Token.destroy({
        where: {
            createdAt: {
                [Op.gt]: format
            }
        }
    });
}
async function checkIfAdmin() {
    if (!req.token.rank === 1) {
        return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
    }
}

// Partie "S'inscrire"
exports.signup = async (req, res, _next) => {
    // Vérification si l'email est déjà utilisée
    const emailExist = await User.findOne({ where: { email: req.body.email } })
    if (emailExist) {
        return res.status(409).json({ message: 'Email has already been used' });
    }
    // Vérification si l'username a déjà été utilisé
    const usernameExist = await User.findOne({ where: { username: req.body.username } })
    if (usernameExist) {
        return res.status(409).json({ message: 'Username has already been used' });
    }
    // Vérification du format du contenu envoyé
    if (!regexEmail.test(req.body.email) && (!regexPassword.test(req.body.password))) {
        return res.status(400).json({ message: "Email or Password doesn't have the correct format" });
    }
    try {
        // Hash du Mot de passe avec 10 tours de SALT
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        // Si le body contient un fichier
        if (req.files) {
            User.create({
                name: req.body.name,
                firstname: req.body.firstname,
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
                avatar: `${req.protocol}://${req.get('host')}/images/${req.files[0].filename}`,
                maxSecurity: true,
                rank: 3
            });
        }
        // Si le body ne contient pas de fichier
        else {
            // Hash de l'email en MD5 pour pouvoir vérifier si un avatar est relié depuis Gravatar
            const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
            console.log(hashEmail);
            fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
                method: "GET"
            })
                .then(function (value) {
                    const gravatarImage = value.url;
                    console.log(gravatarImage);
                    User.create({
                        name: req.body.name,
                        firstname: req.body.firstname,
                        username: req.body.username,
                        email: req.body.email,
                        password: hashPassword,
                        avatar: gravatarImage,
                        maxSecurity: true,
                        rank: 3
                    })
                        .then(done => {
                            res.status(201).json({ message: 'User Created' });

                        })
                        .catch(error => {
                            console.log(error);
                        })

                })
                .catch(error => {
                    res.status(500).json({ error })
                })
        }
    }
    catch (error) {
        res.status(400).json({ error });
    };
};

// Partie "Se connecter"
exports.login = async (req, res, _next) => {
    /*if (!regexPassword.test(req.body.password)) {
        return res.status(400).json({ error: "Password doesn't have the correct format" });
    }*/
    // Cas ou l'utilisateur essaye de se connecter avec un username
    if (req.body.hasOwnProperty("username")) {
        if (!regexUsername.test(req.body.username)) {
            return res.status(400).json({ error: "Username doesn't have the correct format" });
        }
        //try {
        // Vérification si l'username existe
        const user = await User.findOne({ where: { username: req.body.username } })
        if (!user) {
            return res.status(404).json({ error: 'Username not found' });
        }
        // Vérification si le mot de passe envoyé correspond à celui dans la base de données
        const valid = await bcrypt.compare(req.body.password, user.password)
        if (!valid) {
            return res.status(401).json({ error: 'Failed to login' });
        }
        // Création d'un token de 24h avec l'userId inclus
        const token = jwt.sign({
            userId: user.id,
            rank: user.rank

        },
            process.env.SECRET_KEY_JWT, {
            expiresIn: '24h'
        })
        // Fonction AutoPurge (Delete token +24h)
        autoPurge()

        // Récupération de l'userAgent
        const userAgent = req.useragent.browser + " | " + req.useragent.version;
        console.log(userAgent);

        // Si l'option de sécurite maximale est activée, l'IP est masquée en partie
        if (user.maxSecurity === true) {
            const maskStringOptions = {
                maskWith: "*",
                values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                maskOnlyFirstOccurance: true,
                maskAll: false,
                maskSpace: false
            }
            const ip = req.ip;
            console.log(ip)
            const strMask = maskdata.maskString(ip, maskStringOptions);
            console.log(strMask)
            await Token.create({
                token,
                userAgent: userAgent,
                ipAddress: strMask,
                UserId: user.id
            })
        }
        else {
            const ip = req.ip;
            console.log(ip)
            await Token.create({
                token,
                userAgent: userAgent,
                ipAddress: ip,
                UserId: user.id
            })
        }
        res.status(200).json({
            user,
            token
        });
        /*}
        catch (error) {
            res.status(500).json({ error })
        }*/
    }
    // Cas ou l'utilisateur essaye de se connecter avec un email
    if (req.body.hasOwnProperty("email")) {
        if (!regexEmail.test(req.body.email)) {
            return res.status(400).json({ error: "Email doesn't have the correct format" });
        }
        try {
            // Vérification si l'username existe
            const user = await User.findOne({ where: { email: req.body.email } })
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Vérification si le mot de passe envoyé correspond à celui dans la base de données
            const valid = await bcrypt.compare(req.body.password, user.password)
            if (!valid) {
                return res.status(401).json({ error: 'Failed to login' });
            }

            // Création d'un token de 24h avec l'userId inclus
            const token = jwt.sign({
                userId: user.id,
                rank: user.rank
            },
                process.env.SECRET_KEY_JWT, {
                expiresIn: '24h'
            })

            // Fonction AutoPurge (Delete token +24h)
            autoPurge()

            // Récupération de l'userAgent
            const userAgent = req.useragent.browser + " | " + req.useragent.version;
            console.log(userAgent);

            // Si l'option de sécurite maximale est activée, l'IP est masquée en partie
            if (user.maxSecurity === true) {
                const maskStringOptions = {
                    maskWith: "*",
                    values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                    maskOnlyFirstOccurance: true,
                    maskAll: false,
                    maskSpace: false
                }
                const ip = req.ip;
                console.log(ip)
                const strMask = maskdata.maskString(ip, maskStringOptions);
                console.log(strMask)
                await Token.create({
                    token,
                    userAgent: userAgent,
                    ipAddress: strMask,
                    UserId: user.id
                })
            }
            else {
                const ip = req.ip;
                console.log(ip)
                await Token.create({
                    token,
                    userAgent: userAgent,
                    ipAddress: ip,
                    UserId: user.id
                })
            }
            res.status(200).json({
                user,
                token
            });
        }
        catch (error) {
            res.status(500).json({ error })
        }
    }
};

// Récupération de tous les utilisateurs
exports.getAllUsers = async (_req, res, _next) => {
    checkIfAdmin()
    try {
        const findAllUsers = await User.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        })
        if (findAllUsers) {
            return res.status(200).json(findAllUsers);
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
};

// Création d'un utilisateur
exports.createUser = async (req, res, _next) => {
    checkIfAdmin()
    const emailExist = await User.findOne({
        where: {
            email: req.body.email
        }
    })
    if (emailExist) {
        return res.status(409).json({ message: 'Email has already been used' });
    }
    const usernameExist = await User.findOne({
        where: {
            username: req.body.username
        }
    })
    if (usernameExist) {
        return res.status(409).json({ message: 'Username has already been used' });
    }
    if (!regexEmail.test(req.body.email) && (!regexPassword.test(req.body.password))) {
        return res.status(400).json({ message: "Email or Password doesn't have the correct format" });
    }
    //try {
    const hashPassword = await bcrypt.hash(req.body.password, 10)
    if (req.files) {
        const userCreation = User.create({
            name: req.body.name,
            firstname: req.body.firstname,
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
            avatar: `${req.protocol}://${req.get('host')}/images/${req.files.avatar[0].filename}`,
            maxSecurity: true,
            rank: 3
        });
        if (userCreation) {
            return res.status(201).json({ message: 'User Created' });
        }
    }
    else {
        const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
        console.log(hashEmail);
        fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
            method: "GET"
        })
            .then(function (value) {
                const gravatarImage = value.url;
                console.log(gravatarImage);
                User.create({
                    name: req.body.name,
                    firstname: req.body.firstname,
                    username: req.body.username,
                    email: req.body.email,
                    password: hashPassword,
                    avatar: gravatarImage,
                    maxSecurity: true,
                    rank: 3
                })
                    .then(done => {
                        res.status(201).json({ message: 'User Created' });

                    })
                    .catch(error => {
                        console.log(error);
                    })

            })
            .catch(error => {
                res.status(500).json({ error })
            })
    }
    /*}
    catch (error) {
        res.status(400).json({error});
    };*/

};

// Récupération de l'utilisateur actuel
exports.myUser = async (req, res, _next) => {
    const user = await User.findOne({ where: { id: req.token.userId } })
    if (user.id === req.token.userId) {
        return res.status(200).json({
            user
        })
    }
};
// Récupération d'un utilisateur en particulier
exports.getOneUser = async (req, res, _next) => {
    try {
        const findOneUser = await User.findOne({
            where: {
                id: req.params.userId
            },
            include: [{
                model: Post, Reaction
            }]
        })
        if (findOneUser) {
            return res.status(200).json(findOneUser);
        }
    }
    catch (error) {
        res.status(404).json({ error });
    }
};

// Modification d'un utilisateur en particulier
exports.modifyUser = async (req, res, _next) => {
    checkIfAdmin()
    try {
        const userFind = await User.findOne({ where: { id: req.params.userId } })
        if (!req.body.email === null || !req.body.email === undefined) {
            if (userFind) {
                return res.status(409).json({ message: "Email has already been used" })
            }
        }
        let userObject = {}
        if (req.files) {
            console.log(userFind.avatar)
            userObject = {
                ...JSON.stringify(req.body),
                avatar: `${req.protocol}://${req.get('host')}/images/${req.files.avatar[0].filename}`
            }
            if (!userFind.avatar === null || !userFind.avatar === undefined) {
                const filename = userFind.avatar.split('/images/')[1];
                await fsp.unlink('./images/' + filename)
            }
        }
        else {
            userObject = { ...req.body }
        }
        // si le lien dans la table contient gravatar.? > empty et si l'image est dans le dossier images fs.unlink
        const updateUser = await User.update({ ...userObject }, { where: { id: req.params.userId } })
        if (updateUser) {
            return res.status(200).json({ message: 'User has been modified' })
        }
    }
    catch (error) {
        res.status(400).json({ error })
    }
};

// Suppression d'un utilisateur en particulier
exports.deleteUser = async (req, res, _next) => {
    checkIfAdmin()
    const user = await User.findOne({ where: { id: req.params.userId } })
        .catch(() => {
            res.status(404).json({ message: 'User not found' })
        });
    // req.token.role est suffisant élevé ou propriétaire
    const filename = user.avatar.split('/images/')[1];
    await fsp.unlink('./images/' + filename)
    const deleteUser = await User.destroy({ where: { id: req.params.userId } })
    if (deleteUser) {
        return res.status(200).json({ message: 'User has been deleted' })
    }
};