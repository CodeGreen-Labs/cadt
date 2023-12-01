// migration.ts
'use strict';

import { uuid as uuidv4 } from 'uuidv4';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'rules',
      {
        id: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          defaultValue: () => uuidv4(),
          primaryKey: true,
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
        cat_id: {
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
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('rules');
  },
};
