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
  },

  document_id: {
    type: Sequelize.STRING,
    require: true,
  },

  expired_date: {
    type: Sequelize.DATE,
    require: true,
  },

  wallet_user: {
    type: Sequelize.STRING,
    require: true,
  },
  commit_status: {
    type: Sequelize.ENUM('staged', 'committing', 'committed'),
    defaultValue: 'staged',
  },
  ...shared,
};
