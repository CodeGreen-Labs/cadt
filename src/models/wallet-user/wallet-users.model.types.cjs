const Sequelize = require('sequelize');

module.exports = {
  public_key: {
    type: Sequelize.STRING,
    require: true,
    primaryKey: true,
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
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
};
