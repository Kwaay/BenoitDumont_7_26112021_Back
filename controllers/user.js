const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js')
const fetch = require("node-fetch");
const { User } = require('../models');
const sequelize = require('../models');
const fsp = require('fs/promises');
require('dotenv').config()


const regexName = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexFirstname = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexUsername = /^[a-zA-Z0-9_-]{4,10}$/gm;
const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm;
// password must contain 1 number (0-9), 1 uppercase letters, 1 lowercase letters, 1 non-alpha numeric number, 8-16 characters with no space

exports.signup = async (req,res,_next) => {
    const emailExist = await User.findOne({ where: {email: req.body.email} })
    if (emailExist) {
        return res.status(409).json({ message: 'Email has already been used'});
    }
    const usernameExist = await User.findOne({ where: {username: req.body.username} })
    if (usernameExist) {
        return res.status(409).json({ message: 'Username has already been used'});
    }
    if (!regexEmail.test(req.body.email) && (!regexPassword.test(req.body.password))) {
        return res.status(400).json({ message: "Email or Password doesn't have the correct format"});
    }
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        if (req.file) {
            User.create({
                name: req.body.name,
                firstname: req.body.firstname,
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
                avatar: req.file
            });
        }
        else {
            const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
            console.log(hashEmail);
            fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
                method: "GET"
            })
            .then(function(value) {
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
                    res.status(201).json({ message:'User Created'});

                })
                .catch(error => {
                    console.log(error);
                })
                
            })
            .catch(error => { 
                res.status(500).json({error})
            })
        }
    }
    catch (error) {
        res.status(400).json({error});
    };
}; 
exports.login = async (req,res,_next) => {
    if (!regexPassword.test(req.body.password)) {
        return res.status(400).json({ error: "Password doesn't have the correct format" });
    }
    // Cas ou l'utilisateur essaye de se connecter avec un username
    if (req.body.hasOwnProperty("username")) {
        if (!regexUsername.test(req.body.username)) {
            return res.status(400).json({ error: "Username doesn't have the correct format" });
        }
        try {
            const user = await User.findOne({ where: {username: req.body.username} })
            if (!user) {
                return res.status(404).json({ error: 'Username not found'});
            }
            const valid = await bcrypt.compare(req.body.password, user.password)
            if (!valid) {
                return res.status(401).json({ error: 'Failed to login'});
            }
            res.status(200).json({
                user,
                token: jwt.sign(
                    {userId : user._id},
                    process.env.SECRET_KEY_JWT,
                    {expiresIn: '24h'}
                )         
            });
        }
        catch (error) {
            res.status(500).json({error})
        }
    }
    // Cas ou l'utilisateur essaye de se connecter avec un email
    if (req.body.hasOwnProperty("email")) {
        if (!regexEmail.test(req.body.email)) {
            return res.status(400).json({ error: "Email doesn't have the correct format" });
        }
        //try {
            const user = await User.findOne({ where: {email: req.body.email} })
            if (!user) {
                return res.status(404).json({ error: 'User not found'});
            }
            const valid = await bcrypt.compare(req.body.password, user.password)
            if (!valid) {
                return res.status(401).json({ error: 'Failed to login'});
            }
                res.status(200).json({
                    user,
                    token: jwt.sign(
                        {userId : user._id},
                        process.env.SECRET_KEY_JWT,
                        {expiresIn: '24h'}
                    )  
                });
        //}
        /*catch (error) {
            res.status(500).json({error})
        }*/
    }
};
exports.getAllUsers = async (_req,res,_next) => {
    try {
        const findAllUsers = await User.findAll()
        if(findAllUsers) {
             return res.status(200).json(findAllUsers);
        }
    }
    catch (error) {
        res.status(400).json({error});
    }
}
exports.createUser = async (req,res,_next) => {
    const emailExist = await User.findOne({ where: {email: req.body.email} })
    if (emailExist) {
        return res.status(409).json({ message: 'Email has already been used'});
    }
    const usernameExist = await User.findOne({ where: {username: req.body.username} })
    if (usernameExist) {
        return res.status(409).json({ message: 'Username has already been used'});
    }
    if (!regexEmail.test(req.body.email) && (!regexPassword.test(req.body.password))) {
        return res.status(400).json({ message: "Email or Password doesn't have the correct format"});
    }
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        if (req.file) {
            const userCreation = User.create({
                name: req.body.name,
                firstname: req.body.firstname,
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
                avatar: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            });
            if (userCreation) {
                return res.status(201).json({ message:'User Created'});
            }
        }
        else {
            const hashEmail = cryptoJS.MD5(req.body.email).toString().toLowerCase();
            console.log(hashEmail);
            fetch(`https://www.gravatar.com/avatar/${hashEmail}`, {
                method: "GET"
            })
            .then(function(value) {
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
                    res.status(201).json({ message:'User Created'});

                })
                .catch(error => {
                    console.log(error);
                })
                
            })
            .catch(error => { 
                res.status(500).json({error})
            })
        }
    }
    catch (error) {
        res.status(400).json({error});
    };
}
exports.myUser = async (req,res,_next) => {
    const token = req.headers.authorization.split(' ')[1];
    if(token) {
        res.status(200).json({ message: 'OK'})
    }
    console.log(token)
}
exports.getOneUser = async (req,res,_next) => {
    try {
        const findOne = await User.findOne({ where: { id: req.params.userId } })
        if (findOne) {
            return res.status(200).json(findOne);
        }
    }
    catch (error) {
        res.status(404).json({error});
    }
}
exports.modifyUser = async (req,res,_next) => {
    try {
        const userFind = await User.findOne({ where: { id: req.params.userId } })
        if (req.body.hasOwnProperty("email")) {
            if (userFind) {
                return res.status(409).json({ message: "Email has already been used" })
            }
        }
        let userObject = {}
        if(req.file) {
            userObject = {
                ...JSON.stringify(req.body),
                avatar: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
            const filename = userFind.avatar.split('/images/')[1];
            await fsp.unlink('./images/' + filename)
        }
        else {
            userObject = { ...req.body }
        }
        // si le lien dans la table contient gravatar.? > empty et si l'image est dans le dossier images fs.unlink
        const updateUser = await User.update({...userObject}, { where: { id: req.params.userId } })
        if (updateUser) {
            return res.status(200).json({ message : 'User has been modified'})
        }
    }
    catch (error) {
        res.status(400).json({error})
    }
}
exports.deleteUser = async (req,res,next) => {
    
}