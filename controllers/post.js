const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const { Post } = require('../models');


exports.getAllPosts = async (_req,res,_next) => {
    try {
        const findAllPosts = await Post.findAll()
        if(findAllPosts) {
             return res.status(200).json(findAllPosts);
        }
    }
    catch (error) {
        res.status(400).json({error});
    }
}
exports.createPost = async (req,res,next) => {

}

exports.getOnePost = async (req,res,_next) => {
    try {
        const findOnePost = await Post.findOne({ where: { id: req.params.postId } })
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