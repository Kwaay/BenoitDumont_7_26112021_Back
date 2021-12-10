const express = require('express');
const { Sequelize } = require('sequelize');
require('dotenv').config()

const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const reactionRoutes = require('./routes/reaction');


const sequelize = new Sequelize(process.env.DB_BDD, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});

const userModel = require('./models/user')(sequelize,Sequelize.DataTypes);
const postModel = require('./models/post')(sequelize,Sequelize.DataTypes);
const reactionModel = require('./models/reaction')(sequelize,Sequelize.DataTypes)

sequelize.authenticate()
.then(connexion => {
    console.log("✅ Connexion à MySQL");
    sequelize.sync()
    .then(sync => {
        console.log("All models were synchronized successfully.");
    })
        
    .catch(error => {
        console.log(error)
    })
})
.catch(error => {
    console.log("❌ Connexion à MySQL", error);
});


const app = express();

app.use((_req,res,next) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
next();
});

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/reaction', reactionRoutes);

module.exports = app;
