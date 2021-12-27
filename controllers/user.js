const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js')
const fetch = require("node-fetch");
const { User, Post, Reaction } = require('../models');
const fsp = require('fs/promises');
require('dotenv').config()


const regexName = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexFirstname = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexUsername = /^[a-zA-Z0-9_-]{4,10}$/gm;
const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm;
// password must contain 1 number (0-9), 1 uppercase letters, 1 lowercase letters, 1 non-alpha numeric number, 8-16 characters with no space

exports.signup = async (req, res, _next) => {
    const emailExist = await User.findOne({ where: { email: req.body.email } })
    if (emailExist) {
        return res.status(409).json({ message: 'Email has already been used' });
    }
    const usernameExist = await User.findOne({ where: { username: req.body.username } })
    if (usernameExist) {
        return res.status(409).json({ message: 'Username has already been used' });
    }
    if (!regexEmail.test(req.body.email) && (!regexPassword.test(req.body.password))) {
        return res.status(400).json({ message: "Email or Password doesn't have the correct format" });
    }
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        if (req.files) {
            User.create({
                name: req.body.name,
                firstname: req.body.firstname,
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
                avatar: `${req.protocol}://${req.get('host')}/images/${req.files[0].filename}`
            });
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
                        avatar: gravatarImage
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
exports.login = async (req, res, _next) => {
    /*if (!regexPassword.test(req.body.password)) {
        return res.status(400).json({ error: "Password doesn't have the correct format" });
    }*/
    // Cas ou l'utilisateur essaye de se connecter avec un username
    if (req.body.hasOwnProperty("username")) {
        if (!regexUsername.test(req.body.username)) {
            return res.status(400).json({ error: "Username doesn't have the correct format" });
        }
        try {
            const user = await User.findOne({ where: { username: req.body.username } })
            if (!user) {
                return res.status(404).json({ error: 'Username not found' });
            }
            const valid = await bcrypt.compare(req.body.password, user.password)
            if (!valid) {
                return res.status(401).json({ error: 'Failed to login' });
            }
            res.status(200).json({
                user,
                token: jwt.sign(
                    { userId: user.id },
                    process.env.SECRET_KEY_JWT,
                    { expiresIn: '24h' }
                )
            });
        }
        catch (error) {
            res.status(500).json({ error })
        }
    }
    // Cas ou l'utilisateur essaye de se connecter avec un email
    if (req.body.hasOwnProperty("email")) {
        if (!regexEmail.test(req.body.email)) {
            return res.status(400).json({ error: "Email doesn't have the correct format" });
        }
        try {
            const user = await User.findOne({ where: { email: req.body.email } })
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const valid = await bcrypt.compare(req.body.password, user.password)
            if (!valid) {
                return res.status(401).json({ error: 'Failed to login' });
            }
            res.status(200).json({
                user,
                token: jwt.sign(
                    { userId: user._id },
                    process.env.SECRET_KEY_JWT,
                    { expiresIn: '24h' }
                )
            });
        }
        catch (error) {
            res.status(500).json({ error })
        }
    }
};
exports.getAllUsers = async (_req, res, _next) => {
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
exports.createUser = async (req, res, _next) => {
    console.log(req.body)
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
            avatar: `${req.protocol}://${req.get('host')}/images/${req.files.avatar[0].filename}`
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
                    avatar: gravatarImage
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
exports.myUser = async (req, res, _next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY_JWT);
    const tokenUserId = decodedToken.userId
    const user = await User.findOne({ where: { id: tokenUserId } })
    if (user.id === tokenUserId) {
        return res.status(200).json({
            user
        })
    }
};
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
exports.modifyUser = async (req, res, _next) => {
    //try {
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
    /*}
    catch (error) {
        res.status(400).json({ error })
    }*/
};
exports.deleteUser = async (req, res, _next) => {
    const user = await User.findOne({ where: { id: req.params.userId } })
        .catch(() => {
            res.status(404).json({ message: 'User not found' })
        });
    const filename = user.avatar.split('/images/')[1];
    await fsp.unlink('./images/' + filename)
    const deleteUser = await User.destroy({ where: { id: req.params.userId } })
    if (deleteUser) {
        return res.status(200).json({ message: 'User has been deleted' })
    }
};