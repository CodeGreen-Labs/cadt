'use strict';

import express from 'express';

import { credentialLevelController } from '../../../controllers';

const CredentialLevelRouter = express.Router();

CredentialLevelRouter.get('/', (req, res) => {
  return credentialLevelController.findAll(req, res);
});

export { CredentialLevelRouter };
