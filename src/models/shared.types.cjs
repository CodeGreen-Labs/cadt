const Sequelize = require('sequelize');

module.exports = {
  orgUid: {
    type: Sequelize.STRING,
    required: true,
    allowNull: false,
  },
  commit_status: {
    type: Sequelize.ENUM('staged', 'committing', 'committed'),
    defaultValue: 'staged',
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
