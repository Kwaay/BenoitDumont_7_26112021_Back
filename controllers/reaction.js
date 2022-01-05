const jwt = require('jsonwebtoken');
require('dotenv').config()
const { User, Post, Reaction } = require('../models');

// Récupération de tous les posts en les ordonnant en fonction de leur date de création et trié de façon décroissante //
exports.getAllReactions = async (_req, res) => {
    try {
        const findAllReactions = await Reaction.findAll({
            order: [
                ['createdAt', 'DESC']
            ]
        })
        if (findAllReactions) {
            return res.status(200).json(findAllReactions);
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
}

// Création d'une réaction
exports.createReaction = async (req, res) => {
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
            return res.status(409).json({ message: 'Reaction already exists' })
        }
        const reactionCreation = await Reaction.create({
            type: req.body.type,
            PostId: req.body.postId,
            UserId: userId
        });
        if (reactionCreation) {
            return res.status(201).json({ message: 'Reaction Created' });
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
}

// Récupération d'une réaction en incluant Le titre et le contenu du Post auquel il est relié et l'username et l'avatar qui a mis cette réaction sur le Post
exports.getOneReaction = async (req, res) => {
    try {
        const findOneReaction = await Reaction.findOne({
            where: {
                id: req.params.reactionId
            },
            include: [{
                model: Post,
                attributes: ['title', 'content']
            },
            {
                model: User,
                attributes: ['username', 'avatar']
            }]
        })
        if (findOneReaction) {
            return res.status(200).json(findOneReaction);
        }
    }
    catch (error) {
        res.status(404).json({ error });
    }
}

// Modification d'une réaction en particulier
exports.modifyReaction = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_JWT);
        const userId = decodedToken.userId
        console.log(userId)
        const searchReaction = await Reaction.findOne({
            where: {
                PostId: req.body.postId, UserId: userId, type: req.body.type
            }
        })
        if (searchReaction) {
            return res.status(409).json({ message: 'Reaction already exists' })
        }
        const searchPost = await Post.findOne({
            where: {
                id: req.body.postId
            }
        })
        if (searchPost === null || searchPost === undefined) {
            return res.status(404).json({ message: 'Post not found' })
        }
        let reactionObject = {}
        reactionObject = { ...req.body }
        console.log(req.params.reactionId)
        const updateReaction = await Reaction.update({ ...reactionObject }, { where: { id: req.params.reactionId } })
        console.log(updateReaction)
        if(updateReaction) {
            return res.status(200).json({ message: 'Reaction successfully updated'})
        }
    }
    catch (error) {
        res.status(400).json({ error })
    }
}

// Suppression d'une réaction en particulier
exports.deleteReaction = async (req, res) => {
    const reaction = await Reaction.findOne({ where: { id: req.params.reactionId } })
        .catch(() => {
            res.status(404).json({ message: 'Reaction not found' })
        });
    const deleteReaction = await Reaction.destroy({ where: { id: req.params.reactionId } })
    if (deleteReaction) {
        return res.status(200).json({ message: 'Reaction has been deleted' })
    }
}
