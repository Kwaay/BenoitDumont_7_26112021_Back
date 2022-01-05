
module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            noUpdate: {
                readOnly: true
            }
        },
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
            unique: true,
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
        },
        maxSecurity: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        /*question: {
            type: DataTypes.STRING,
            allowNull: false
        },
        //reponse: {
            type: DataTypes.STRING,
            allowNull: false
        },
        */
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            noUpdate: {
                readOnly: true
            }
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            noUpdate: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    })
}