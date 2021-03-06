/**
 * @function TokenModel The `Token` model is defined as a Sequelize model
 *
 * @param {object} Sequelize - The Sequelize instance
 * @param {object} DataTypes - The Data Types of Sequelize
 *
 * @returns {object} - Token Model Instance
 */
module.exports = (Sequelize, DataTypes) => Sequelize.define(
  'Token',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      noUpdate: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      noUpdate: {
        readOnly: true,
      },
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: false,
      noUpdate: {
        readOnly: true,
      },
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      noUpdate: {
        readOnly: true,
      },
    },
  },
  {
    tableName: 'tokens',
    timestamps: true,
    updatedAt: false,
  },
);
