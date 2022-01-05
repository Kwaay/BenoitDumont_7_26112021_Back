const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function pour décoder le token et le comparer celui dans la base de données et celui donné dans la requête
module.exports = (req,res,next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken =  jwt.verify(token, process.env.SECRET_KEY_JWT);
        const userId =  decodedToken.userId;
        if(req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable !';
        } else {
            next();
        }
   } catch (error) {
       res.status(401).json({ error: error | "You're not logged in"});
   }
}