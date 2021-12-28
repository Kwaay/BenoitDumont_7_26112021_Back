module.exports = (Sequelize, DataTypes) => {
    return Sequelize.define('Token', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            noUpdate: true
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: false,
            noUpdate: {
                readOnly: true
            }
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            noUpdate: {
                readOnly: true
            }
        }
    }, {
        tableName: 'tokens',
        timestamps: true,
        updatedAt: false
    })
}