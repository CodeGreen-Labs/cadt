const Sequelize = require('sequelize');
const { uuid: uuidv4 } = require('uuidv4');

module.exports = {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  level: {
    type: Sequelize.INTEGER,
    required: true,
    unique: true,
  },
  name: {
    type: Sequelize.STRING,
    required: true,
    unique: true,
  },
  description: {
    type: Sequelize.STRING,
  },
};
