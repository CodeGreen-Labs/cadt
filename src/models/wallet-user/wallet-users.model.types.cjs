const Sequelize = require('sequelize');
const shared = require('../shared.types.cjs');

module.exports = {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  public_key: {
    type: Sequelize.STRING,
    require: true,
    allowNull: false,
  },
  ein: {
    type: Sequelize.STRING,
    required: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    require: true,
    allowNull: false,
  },
  contact_address: {
    type: Sequelize.STRING,
    require: true,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    require: true,
    allowNull: false,
  },
  ...shared,
};
