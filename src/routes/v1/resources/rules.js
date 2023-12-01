'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';
import { RuleController } from '../../../controllers';

const validator = joiExpress.createValidator({ passError: true });
const RuleRouter = express.Router();

import {
  projectsGetQuerySchema,
  projectsPostSchema,
} from '../../../validations';

RuleRouter.get('/', validator.query(projectsGetQuerySchema), (req, res) => {
  return RuleController.findAll(req, res);
});

RuleRouter.post('/', validator.body(projectsPostSchema), RuleController.create);

export { RuleRouter };
