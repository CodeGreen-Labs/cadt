// migration.ts
'use strict';

import modelType from '../../models/rules/rules.modeltypes.cjs';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('rules', modelType);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('rules');
  },
};
