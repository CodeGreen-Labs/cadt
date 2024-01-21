'use strict';

import express from 'express';

import { CredentialTypeController } from '../../../controllers';

const CredentialTypeRouter = express.Router();

CredentialTypeRouter.get('/', (req, res) => {
  return CredentialTypeController.findAll(req, res);
});

export { CredentialTypeRouter };
