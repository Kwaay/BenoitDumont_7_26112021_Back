const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cryptoJS = require('crypto-js')
const fetch = require("node-fetch");
const { User } = require('../models')


const regexName = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm;
// password must contain 1 number (0-9), 1 uppercase letters, 1 lowercase letters, 1 non-alpha numeric number, 8-16 characters with no space

exports.signup = async (req,res,next) => {
    const emailExist = await User.findOne({ where: {email: req.body.email} })
    if (emailExist) {
        return res.status(409).json({ message: 'Email has already been used'});
    }
    const usernameExist = await User.findOne({ where: {username: req.body.username} })
    if (usernameExist) {
        return res.status(409).json({ message: 'Username has already been used'});
    }
    else if (!regexEmail.test(req.body.email) && (!regexPassword.test(req.body.password))) {
        return res.status(400).json({ message: "Email ou Password n'ont pas le format requis"});
    }
    else {
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
                    console.log(value);
                    const gravatarImage = value.url;
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
}; 
exports.login = async (req,res,next) => {

}
exports.getAllUsers = async (req,res,next) => {
    
}
exports.createUser = async (req,res,next) => {
    
}
exports.myUser = async (req,res,next) => {
    
}
exports.getOneUser = async (req,res,next) => {
    
}
exports.modifyUser = async (req,res,next) => {
    
}
exports.deleteUser = async (req,res,next) => {
    
}