module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar: {
            type: DataTypes.STRING.BINARY,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    })
}