'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';

import { credentialController } from '../../../controllers';
import {
  createCredentialSchema,
  deleteCredentialSchema,
  updateCredentialSchema,
} from '../../../validations';

const validator = joiExpress.createValidator({ passError: true });

const CredentialRouter = express.Router();

CredentialRouter.get('/', (req, res) => {
  return credentialController.findAll(req, res);
});

CredentialRouter.post(
  '/',
  validator.body(createCredentialSchema),
  (req, res) => {
    return credentialController.create(req, res);
  },
);

CredentialRouter.put(
  '/',
  validator.body(updateCredentialSchema),
  (req, res) => {
    return credentialController.update(req, res);
  },
);
CredentialRouter.delete(
  '/',
  validator.body(deleteCredentialSchema),
  (req, res) => {
    return credentialController.destroy(req, res);
  },
);
export { CredentialRouter };
