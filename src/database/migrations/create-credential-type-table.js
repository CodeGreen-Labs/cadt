'use strict';

import ModelTypes from '../../models/credential-types/credential-types.model.types.cjs';

export default {
  up: async (queryInterface) => {
    await queryInterface.createTable('credential_types', ModelTypes);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('credential_types');
  },
};
