const jwt = require('jsonwebtoken');
const fsp = require('fs/promises');
require('dotenv').config()
const { User, Post, Reaction } = require('../models');

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
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_JWT);
        const userId = decodedToken.userId
        console.log(userId)
        console.log(req.body)
        const searchTitle = await Post.findOne({
            where: {
                title: req.body.title, UserId: userId
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
                    UserId: userId
                });
                if (postCreation) {
                    return res.status(201).json({ message: 'Post Created' });
                }
            }
            else {
                const postCreation = await Post.create({
                    title: req.body.title,
                    content: req.body.content,
                    UserId: userId
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
                id: req.params.postId
            },
            include: [{
                model: User,
                attributes: ['id', 'username', 'avatar']
            },
            {
                model: Reaction,
                attributes: ['id', 'userId', 'type']
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
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_JWT);
        const userId = decodedToken.userId
        console.log(userId)
        if (!req.body.title === null || !req.body.title === undefined) {
            const titleCompare = await Post.findOne({
                where: {
                    title: req.body.title, UserId: userId
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
            console.log(req.params.postId)
            const postFind = await Post.findOne({ where: { id: req.params.postId } })
            console.log(postFind)
            if (!postFind.image === null || !postFind.image === undefined) {
                const filename = postFind.image.split('/images/')[1];
                await fsp.unlink('./images/' + filename)
            }
        }
        else {
            postObject = { ...req.body }
        }
        const updatePost = await Post.update({ ...postObject }, { where: { id: req.params.postId } })
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
    const post = await Post.findOne({ where: { id: req.params.postId } })
        .catch(() => {
            res.status(404).json({ message: 'Post not found' })
        });
    console.log(post.image)
    const filename = post.image.split('/images/')[1];
    await fsp.unlink('./images/' + filename)
    const deletePost = await Post.destroy({ where: { id: req.params.postId } })
    if (deletePost) {
        return res.status(200).json({ message: 'Post has been deleted' })
    }
}