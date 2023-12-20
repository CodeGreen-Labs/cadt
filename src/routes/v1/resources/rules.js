'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';
import { RuleController } from '../../../controllers';

const validator = joiExpress.createValidator({ passError: true });
const RuleRouter = express.Router();

import {
  rulesDeleteSchema,
  rulesGetQuerySchema,
  rulesPostSchema,
} from '../../../validations';

RuleRouter.get(
  '/',
  validator.query(rulesGetQuerySchema),
  RuleController.findAll,
);
RuleRouter.get(
  '/:cat_id',
  validator.query(rulesGetQuerySchema),
  RuleController.findOne,
);

RuleRouter.post('/', validator.body(rulesPostSchema), RuleController.create);

RuleRouter.put('/', validator.body(rulesPostSchema), RuleController.update);

RuleRouter.delete(
  '/',
  validator.body(rulesDeleteSchema),
  RuleController.destroy,
);

export { RuleRouter };
