const Sequelize = require('sequelize');
const shared = require('../shared.types.cjs');

module.exports = {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  credential_level: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },

  document_id: {
    type: Sequelize.STRING,
    require: true,
  },

  expired_date: {
    type: Sequelize.DATE,
    require: true,
  },

  wallet_user_public_key: {
    type: Sequelize.STRING,
    require: true,
  },
  ...shared,
};
