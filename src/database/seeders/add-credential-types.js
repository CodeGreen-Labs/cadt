'use strict';

import stub from '../../models/credential-types/credential-types.stub';

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('credential_types', stub, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('credential_types', null, {});
  },
};
