const Sequelize = require('sequelize');
const shared = require('../shared.types.cjs');

module.exports = {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  public_key: {
    type: Sequelize.STRING,
    require: true,
  },
  ein: {
    type: Sequelize.STRING,
    required: true,
  },
  name: {
    type: Sequelize.STRING,
    require: true,
  },
  contact_address: {
    type: Sequelize.STRING,
    require: true,
  },
  email: {
    type: Sequelize.STRING,
    require: true,
  },
  ...shared,
};
