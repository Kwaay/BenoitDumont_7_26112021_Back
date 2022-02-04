/**
 * @function ReactionModel The `Reaction` model is defined as a Sequelize model
 *
 * @param {object} Sequelize - The Sequelize instance
 * @param {object} DataTypes - The Data Types of Sequelize
 *
 * @returns {void}
 */
module.exports = (Sequelize, DataTypes) => Sequelize.define(
  'Reaction',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      noUpdate: {
        readOnly: true,
      },
    },
    type: {
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
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      noUpdate: true,
    },
  },
  {
    tableName: 'reactions',
    timestamps: true,
  },
);
