'use strict';

import stub from '../../models/credential-levels/credential-levels.stub';

export default {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('credential_levels', stub, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('credential_levels', null, {});
  },
};
