const Sequelize = require('sequelize');
const shared = require('../shared.types.cjs');

module.exports = {
  cat_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  origin_project_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  warehouse_project_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  warehouse_unit_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  issuance_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  kyc_receiving: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  kyc_retirement: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  kyc_sending: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  commit_status: {
    type: Sequelize.ENUM('staged', 'committing', 'committed'),
    defaultValue: 'staged',
  },
  ...shared,
};
