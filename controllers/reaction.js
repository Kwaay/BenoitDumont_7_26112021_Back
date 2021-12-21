const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fsp = require('fs/promises');
require('dotenv').config()

const { Reaction } = require('../models');

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

}
exports.getOneReaction = async (req,res,next) => {

}
exports.modifyReaction = async (req,res,next) => {

}
exports.deleteReaction = async (req,res,next) => {

}
