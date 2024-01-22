'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';

import { CredentialTypeController } from '../../../controllers';
import {
  createCredentialTypeSchema,
  updateCredentialTypeSchema,
} from '../../../validations';

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

CredentialTypeRouter.put(
  '/',
  validator.body(updateCredentialTypeSchema),
  (req, res) => {
    return CredentialTypeController.update(req, res);
  },
);

export { CredentialTypeRouter };
