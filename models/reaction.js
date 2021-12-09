module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Reaction', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            auto_increment: true,
            primaryKey: true
        },
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