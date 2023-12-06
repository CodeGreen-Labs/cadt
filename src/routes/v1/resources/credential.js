'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';

import { credentialController } from '../../../controllers';
import { createCredentialSchema } from '../../../validations';

const validator = joiExpress.createValidator({ passError: true });

const CredentialRouter = express.Router();

CredentialRouter.post(
  '/',
  validator.body(createCredentialSchema),
  (req, res) => {
    return credentialController.create(req, res);
  },
);

export { CredentialRouter };
