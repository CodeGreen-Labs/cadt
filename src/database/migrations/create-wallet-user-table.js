'use strict';

import modelType from '../../models/wallet-user/wallet-users.model.types.cjs';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('wallet_users', modelType);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('wallet_users');
  },
};
