const Sequelize = require('sequelize');
const { uuid: uuidv4 } = require('uuidv4');

module.exports = {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  orgUid: {
    type: Sequelize.STRING,
    required: true,
    allowNull: false,
    defaultValue: 'default',
  },
  name: {
    type: Sequelize.STRING,
    required: true,
  },
  description: {
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
  commit_status: {
    type: Sequelize.ENUM('staged', 'committing', 'committed'),
    defaultValue: 'staged',
  },
};
