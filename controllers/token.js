const { User, Token } = require('../models');

exports.getAllTokens = async (req, res, _next) => {
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
exports.getOneToken = async (req, res, _next) => {
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
exports.deleteToken = async (req, res, _next) => {
    const token = await Token.findOne({ where: { id: req.params.tokenId } })
        .catch(() => {
            res.status(404).json({ message: 'Token not found' })
        });
    const deleteToken = await Token.destroy({ where: { id: req.params.tokenId } })
    if (deleteToken) {
        return res.status(200).json({ message: 'Reaction has been deleted' })
    }
}