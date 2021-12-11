module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Post', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'posts',
        timestamps: true
    })
}