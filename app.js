const express = require('express');
const { Sequelize } = require('sequelize');
require('dotenv').config()

const UserRoutes = require('./routes/user');

const sequelize = new Sequelize(process.env.DB_BDD, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});
const connexion = sequelize.authenticate();
if (connexion) {
    console.log("✅ Connexion à MySQL");
    sequelize.sync({ force: true });
    console.log("All models were synchronized successfully.");
}
else {
    console.log("❌ Connexion à MySQL", error);
}

const app = express();

app.use((res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
next();
});

app.use(express.json());

app.use('/api/user', UserRoutes)

module.exports = app;
