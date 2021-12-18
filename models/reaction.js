module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Reaction', {
        type: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'reactions',
        timestamps: true
    })
}