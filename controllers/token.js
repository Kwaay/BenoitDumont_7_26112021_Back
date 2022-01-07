const { User, Token } = require('../models');

async function checkIfAdmin() {
    if (!req.token.rank === 1) {
        return res.status(401).json({ message: 'Not Enough Permissions to do this action' });
    }
}

// Récupération de tous les tokens
exports.getAllTokens = async (req, res, _next) => {
    checkifAdmin()
    try {
        const findAllTokens = await Token.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        })
        if (findAllTokens) {
            return res.status(200).json(findAllTokens);
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
};

// Récupération d'un token en particulier
exports.getOneToken = async (req, res, _next) => {
   checkIfAdmin()
    try {
        const findOneToken = await Token.findOne({
            where: {
                id: req.params.tokenId
            },
            include: [{
                model: User
            }]
        })
        if (findOneToken) {
            return res.status(200).json(findOneToken);
        }
    }
    catch (error) {
        res.status(404).json({ error });
    }
};

// Suppression d'un token
exports.deleteToken = async (req, res, _next) => {
    checkIfAdmin()
    const token = await Token.findOne({ where: { id: req.params.tokenId } })
        .catch(() => {
            res.status(404).json({ message: 'Token not found' })
        });
    const deleteToken = await Token.destroy({ where: { id: req.params.tokenId } })
    if (deleteToken) {
        return res.status(200).json({ message: 'Token has been deleted' })
    }
}