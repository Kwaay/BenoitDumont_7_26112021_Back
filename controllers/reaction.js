const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fsp = require('fs/promises');
require('dotenv').config()

const { User, Post, Reaction } = require('../models');

exports.getAllReactions = async (req,res,next) => {
    try {
        const findAllReactions = await Reaction.findAll({
            order: [
                ['createdAt', 'DESC']
              ] 
            })
        if(findAllReactions) {
             return res.status(200).json(findAllReactions);
        }
    }
    catch (error) {
        res.status(400).json({error});
    }
}
exports.createReaction = async (req,res,next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_JWT);
        const userId = decodedToken.userId
        console.log(userId)
        console.log(req.body.postId)
        const searchReaction = await Reaction.findOne({
            where: {
                PostId: req.body.postId, UserId: userId
            }
        })
        if (searchReaction) {
            return res.status(409).json({message: 'Reaction already exists'})
        }
        const reactionCreation = await Reaction.create({
            type: req.body.type,
            PostId: req.body.postId,
            UserId: userId
        });
        if (reactionCreation) {
            return res.status(201).json({ message:'Reaction Created'});
        }
    }
    catch (error) {
        res.status(400).json({error});
    }
}
exports.getOneReaction = async (req,res,next) => {

}
exports.modifyReaction = async (req,res,next) => {

}
exports.deleteReaction = async (req,res,next) => {

}
