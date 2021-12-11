module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Reaction', {
        userId : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        postId : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'reactions',
        timestamps: true
    })
}