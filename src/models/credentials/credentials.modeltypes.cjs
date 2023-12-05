const Sequelize = require('sequelize');
const { uuid: uuidv4 } = require('uuidv4');

module.exports = {
  credentialId: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  documentId: {
    type: Sequelize.STRING,
    require: true,
  },
  expiredDate: {
    type: Sequelize.DATE,
    require: true,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
};
