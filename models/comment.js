/**
 * @function CommentModel The `Comment` model is defined as a Sequelize model
 *
 * @param {object} Sequelize - The Sequelize instance
 * @param {object} DataTypes - The Data Types of Sequelize
 *
 * @returns {object} - Comment Model Instance
 */
module.exports = (Sequelize, DataTypes) => Sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    noUpdate: true,
  },
  content: {
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
}, {
  tableName: 'comments',
  timestamps: true,
});
