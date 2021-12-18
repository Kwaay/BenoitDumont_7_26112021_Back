module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Post', {
        title: {
            type: DataTypes.STRING,
            allowNull:false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING.BINARY,
            allowNull: true
        }
    }, {
        tableName: 'posts',
        timestamps: true
    })
}