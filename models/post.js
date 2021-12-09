module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            auto_increment: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reaction: [{
            id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.STRING,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }]
    }, {
        tableName: 'posts',
        timestamps: true
    })
}