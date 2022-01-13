const { User, Post, Reaction } = require('../models');
require('dotenv').config()

async function checkIfModerator() {
    if (!req.token.rank === 1 || !req.token.rank === 2) {
        return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
    }
}

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
    console.log(req.body)
    const { PostId, type } = req.body
    if (typeof type !== 'number' || isNaN(type)) {
        return res.status(400).json({message: 'Type must be a number'})
    }
    if (typeof PostId !== 'number' || isNaN(PostId)) {
        return res.status(400).json({message: 'PostId must be a number'})
    }
    try {
        const searchReaction = await Reaction.findOne({
            where: {
                PostId, UserId: req.token.UserId
            }
        })
        if (searchReaction) {
            return res.status(409).json({ message: 'Reaction already exists' })
        }
        const reactionCreation = await Reaction.create({
            type,
            PostId,
            UserId: req.token.UserId
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
                id: req.params.ReactionId
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
    checkIfModerator()
    const { PostId, type } = req.body
    if (typeof type !== 'number' || isNaN(type)) {
        return res.status(400).json({message: 'Type must be a number'})
    }
    if (typeof PostId !== 'number' || isNaN(PostId)) {
        return res.status(400).json({message: 'PostId must be a number'})
    }
    try {
        const searchReaction = await Reaction.findOne({
            where: {
                PostId, UserId: req.token.UserId, type
            }
        })
        if (searchReaction) {
            return res.status(409).json({ message: 'Reaction already exists' })
        }
        const searchPost = await Post.findOne({
            where: {
                id: PostId
            }
        })
        if (searchPost === null || searchPost === undefined) {
            return res.status(404).json({ message: 'Post not found' })
        }
        let reactionObject = {}
        reactionObject = { ...req.body }
        const updateReaction = await Reaction.update({ ...reactionObject }, { where: { id: req.params.ReactionId } })
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
    checkIfModerator()
    await Reaction.findOne({ where: { id: req.params.ReactionId } })
        .catch(() => {
            res.status(404).json({ message: 'Reaction not found' })
        });
    const deleteReaction = await Reaction.destroy({ where: { id: req.params.ReactionId } })
    if (deleteReaction) {
        return res.status(200).json({ message: 'Reaction has been deleted' })
    }
}
