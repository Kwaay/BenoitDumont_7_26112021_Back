module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            noUpdate: {
                readOnly: true
            }
        },
        title: {
            type:DataTypes.STRING,
            allowNull:false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING.BINARY,
            allowNull: true
        },
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
        tableName: 'posts',
        timestamps: true
    })
}