const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DB_BDD, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});

const user = require('./user')(sequelize,Sequelize.DataTypes);
const post = require('./post')(sequelize,Sequelize.DataTypes);
const reaction = require('./reaction')(sequelize,Sequelize.DataTypes)

user.hasMany(post,{
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
post.belongsTo(user);

post.hasMany(reaction, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
reaction.belongsTo(post);

user.hasMany(reaction, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
reaction.belongsTo(user)

sequelize.User = user;
sequelize.Post = post;
sequelize.Reaction = reaction;

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