const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DB_BDD, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});

const userModel = require('./user')(sequelize,Sequelize.DataTypes);
const postModel = require('./post')(sequelize,Sequelize.DataTypes);
const reactionModel = require('./reaction')(sequelize,Sequelize.DataTypes)

sequelize.User = userModel;
sequelize.Post = postModel;
sequelize.Reaction = reactionModel;

sequelize.authenticate()
.then(connexion => {
    console.log("✅ Connexion à MySQL");
    sequelize.sync()
    .then(sync => {
        console.log("All models were synchronized successfully.");
    })
        
    .catch(error => {
        console.log("Failed to synchronize the models")
    })
})
.catch(error => {
    console.log("❌ Connexion à MySQL", error);
});

module.exports = sequelize;