// Model des réactions
module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Reaction', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            noUpdate: {
                readOnly: true
            }
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: 'reactions',
        timestamps: true
    })
}