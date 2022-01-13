const { User, Post, Reaction } = require('../models');
const fsp = require('fs/promises');
require('dotenv').config()

const regexTitle = /^[A-Z]{1}[a-z]{2,15}$/gm;
const regexContent = /^[a-zA-Z0-9_-]{4,10}$/gm;


async function checkIfModerator() {
    if (!req.token.rank === 1 || !req.token.rank === 2) {
        return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
    }
}

// Récupération de tous les posts en les ordonnant en fonction de leur date de création et trié de façon décroissante //
exports.getAllPosts = async (_req, res, _next) => {
    try {
        const findAllPosts = await Post.findAll({
            order: [
                ['createdAt', 'DESC']
            ]
        })
        if (findAllPosts) {
            return res.status(200).json(findAllPosts);
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
}

// Création d'un post
exports.createPost = async (req, res, _next) => {
    if (!regexTitle.test(req.body.title)) {
        return res.status(400).json({ message: "Title doesn't have a correct format" });
    }
    if (!regexContent.test(req.body.content)) {
        return res.status(400).json({ message: "Content doesn't have a correct format" });
    }
    delete req.body.image
    try {
        const searchTitle = await Post.findOne({
            where: {
                title: req.body.title, UserId: req.token.UserId
            }
        })
        if (searchTitle) {
            return res.status(409).json({ message: 'Title already exists' })
        }
        else {
            if (req.files) {
                const postCreation = await Post.create({
                    title: req.body.title,
                    content: req.body.content,
                    image: `${req.protocol}://${req.get('host')}/images/${req.files.image[0].filename}`,
                    UserId: req.token.UserId
                });
                if (postCreation) {
                    return res.status(201).json({ message: 'Post Created with an image' });
                }
            }
            else {
                const postCreation = await Post.create({
                    title: req.body.title,
                    content: req.body.content,
                    UserId: req.token.UserId
                });
                if (postCreation) {
                    return res.status(201).json({ message: 'Post Created' });
                }
            }
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
}

// Récupération d'un post en particulier qui inclus l'id, l'username et l'avatar de l'user relié au post et les réactions du post récupéré 
exports.getOnePost = async (req, res, _next) => {
    try {
        const findOnePost = await Post.findOne({
            where: {
                id: req.params.PostId
            },
            include: [{
                model: User,
                attributes: ['id', 'username', 'avatar']
            },
            {
                model: Reaction,
                attributes: ['id', 'PserId', 'type']
            }]
        })
        if (!findOnePost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(200).json(findOnePost); 
    }
    catch (error) {
        res.status(500).json({ error });
    }
}

// Modification d'un post en particulier
exports.modifyPost = async (req, res, next) => {
    checkIfModerator()
    if (!regexTitle.test(req.body.title)) {
        return res.status(400).json({ message: "Title doesn't have a correct format" });
    }
    if (!regexContent.test(req.body.content)) {
        return res.status(400).json({ message: "Content doesn't have a correct format" });
    }
    delete req.body.image
    try {
        if (!req.body.title === null || !req.body.title === undefined) {
            const titleCompare = await Post.findOne({
                where: {
                    title: req.body.title, UserId: req.token.UserId
                }
            })
            if (titleCompare) {
                return res.status(409).json({ message: 'Title already exists' })
            }
        }
        let postObject = {}
        if (req.files) {
            postObject = {
                ...JSON.stringify(req.body),
                image: `${req.protocol}://${req.get('host')}/images/${req.files.image[0].filename}`
            }
            const postFind = await Post.findOne({ where: { id: req.params.PostId } })
            if (!postFind.image === null || !postFind.image === undefined) {
                const filename = postFind.image.split('/images/')[1];
                await fsp.unlink('./images/' + filename)
            }
        }
        else {
            postObject = { ...req.body }
        }
        const updatePost = await Post.update({ ...postObject }, { where: { id: req.params.PostId } })
        if (updatePost) {
            return res.status(200).json({ message: 'Post has been modified' })
        }

    }
    catch (error) {
        res.status(400).json({ error })
    }
}

// Suppression d"un post en particulier
exports.deletePost = async (req, res, next) => {
    checkIfModerator()
    const post = await Post.findOne({ where: { id: req.params.PostId } })
        .catch(() => {
            res.status(404).json({ message: 'Post not found' })
        });
    const filename = post.image.split('/images/')[1];
    await fsp.unlink('./images/' + filename)
    const deletePost = await Post.destroy({ where: { id: req.params.PostId } })
    if (deletePost) {
        return res.status(200).json({ message: 'Post has been deleted' })
    }
}