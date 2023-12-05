'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';

import { credentialLevelController } from '../../../controllers';
import { credentialLevelSchema } from '../../../validations/credential-level-validations';

const validator = joiExpress.createValidator({ passError: true });
const CredentialLevelRouter = express.Router();

CredentialLevelRouter.get('/', (req, res) => {
  return credentialLevelController.findAll(req, res);
});

export { CredentialLevelRouter };
