const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function pour décoder le token
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY_JWT);
    req.token = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: `${error} + You're not logged in` });
  }
};
