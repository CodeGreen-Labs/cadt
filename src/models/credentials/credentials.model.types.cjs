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
  credential_type: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  document_id: {
    type: Sequelize.STRING,
    require: true,
    allowNull: false,
  },

  expired_date: {
    type: Sequelize.DATE,
    require: true,
    allowNull: false,
  },

  wallet_user_id: {
    type: Sequelize.STRING,
    require: true,
    allowNull: false,
  },
  commit_status: {
    type: Sequelize.ENUM('staged', 'committing', 'committed'),
    defaultValue: 'staged',
  },
  ...shared,
};
