const Sequelize = require('sequelize');

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
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  kyc_retirement: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  kyc_sending: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  commit_status: {
    type: Sequelize.STRING, // assuming CommitStatus is a string enum or similar
  },
  last_modified_time: {
    type: Sequelize.STRING,
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
