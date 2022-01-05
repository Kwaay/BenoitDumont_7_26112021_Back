const { Sequelize } = require('sequelize')
const sequelizeNoUpdateAttributes = require('sequelize-noupdate-attributes')

// Connexion à la base de données
const sequelize = new Sequelize(process.env.DB_BDD, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    timezone: 'Europe/Paris'
});

sequelizeNoUpdateAttributes(sequelize);

//Récuperation des models
const user = require('./user')(sequelize, Sequelize.DataTypes);
const post = require('./post')(sequelize, Sequelize.DataTypes);
const reaction = require('./reaction')(sequelize, Sequelize.DataTypes)
const token = require('./token')(sequelize, Sequelize.DataTypes)

// Relations entre les différents models
user.hasMany(post, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
post.belongsTo(user, {
    foreignKey: {
        allowNull: false,
        noUpdate: true  
    }
});
post.hasMany(reaction, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
reaction.belongsTo(post, {
    foreignKey: {
        allowNull: false,
        noUpdate: true 
    }
});
user.hasMany(reaction, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
reaction.belongsTo(user, {
    foreignKey: {
        allowNull: false,
        noUpdate: true 
    }
})

user.hasMany(token, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
token.belongsTo(user, {
    foreignKey: {
        allowNull: false,
        noUpdate: true
    }
})

sequelize.User = user;
sequelize.Post = post;
sequelize.Reaction = reaction;
sequelize.Token = token;

// Tentative d'authentification à la base de données
sequelize.authenticate()
    .then(connexion => {
        console.log("✅ Connexion à MySQL valide");
        // Synchronisation des models avec les tables dans la base de données
        sequelize.sync()
            .then(sync => {
                console.log("Tous les models ont été synchronisés avec succès.");
            })

            .catch(error => {
                console.log("Impossible de synchroniser les models")
            })
    })
    .catch(error => {
        console.log("❌ Connexion à MySQL invalide", error);
    });

module.exports = sequelize;