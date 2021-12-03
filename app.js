const express = require('express');
const { Sequelize } = require('sequelize');
require('dotenv').config()


const sequelize = new Sequelize(process.env.DB_BDD, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'

});

try {
    sequelize.authenticate();
    console.log("✅ Connexion à MySQL");
  } 
catch (error) {
    console.error("❌ Connexion à MySQL", error);
}
//console.log("❌ Connexion à MySQL")
//console.log("✅ Connexion à MySQL");

const app = express();

app.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
next();
});

app.use(express.json());

module.exports = app;
