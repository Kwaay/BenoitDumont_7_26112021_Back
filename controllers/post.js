const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const { Post, Reaction } = require('../models');


exports.getAllPosts = async (_req,res,_next) => {
    try {
        const findAllPosts = await Post.findAll({
            order: [
                ['createdAt', 'DESC']
              ] 
            })
        if(findAllPosts) {
             return res.status(200).json(findAllPosts);
        }
    }
    catch (error) {
        res.status(400).json({error});
    }
}
exports.createPost = async (req,res,_next) => {
    try {
        if (req.file) {
            const postCreation = Post.create({
                title: req.body.title,
                content: req.body.content,
                image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            });
            if (postCreation) {
                return res.status(201).json({ message:'Post Created'});
            }
        }
        else {
            const postCreation = Post.create({
                title: req.body.title,
                content: req.body.content
            });
            if (postCreation) {
                return res.status(201).json({ message:'Post Created'});
            }
            
        }
    }
    catch (error) {
        res.status(400).json({error});
    }
}

exports.getOnePost = async (req,res,_next) => {
    try {
        const findOnePost = await Post.findOne({ 
            where: { 
                id: req.params.postId 
            },
            include: [{
                model: User,
                attributes: ['username', 'avatar', 'id']
                }, 
                Reaction]
        })
        if (findOnePost) {
            return res.status(200).json(findOnePost);
        }
    }
    catch (error) {
        res.status(404).json({error});
    }
}

exports.modifyPost = async (req,res,next) => {

}

exports.deletePost = async (req,res,next) => {

}