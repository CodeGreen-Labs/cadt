const Sequelize = require('sequelize');

module.exports = {
  orgUid: {
    type: Sequelize.STRING,
    required: true,
    allowNull: false,
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
