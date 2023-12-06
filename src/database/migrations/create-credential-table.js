'use strict';
import modelType from '../../models/credentials/credentials.model.types.cjs';
export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('credentials', modelType);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('credentials');
  },
};
