'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';

import { CredentialTypeController } from '../../../controllers';
import { createCredentialTypeSchema } from '../../../validations';

const validator = joiExpress.createValidator({ passError: true });
const CredentialTypeRouter = express.Router();

CredentialTypeRouter.get('/', (req, res) => {
  return CredentialTypeController.findAll(req, res);
});

CredentialTypeRouter.post(
  '/',
  validator.body(createCredentialTypeSchema),
  (req, res) => {
    return CredentialTypeController.create(req, res);
  },
);

export { CredentialTypeRouter };
