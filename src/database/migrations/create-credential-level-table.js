'use strict';

import ModelTypes from '../../models/credential-levels/credential-levels.model.types.cjs';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('credential_levels', ModelTypes);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('credential_levels');
  },
};
