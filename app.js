const express = require('express');
const path = require('path');
const useragent = require('express-useragent');
const helmet = require('helmet');
require('dotenv').config();

// Récupération des routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const reactionRoutes = require('./routes/reaction');
const tokenRoutes = require('./routes/token');
const commentRoutes = require('./routes/comment');
const configRoutes = require('./routes/config');

const app = express();

// Mise en place des headers
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_ENV === 'production' ? 'www.groupomania.fr' : '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(useragent.express());
app.use(express.json({ limit: '50mb' }));
app.use(helmet());

// Chemin pour le stockage des images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Base URL pour les routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/reaction', reactionRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/config', configRoutes);

module.exports = app;
