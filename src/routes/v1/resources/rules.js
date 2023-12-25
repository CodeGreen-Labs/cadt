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
  updateRuleSchema,
} from '../../../validations';

RuleRouter.get(
  '/',
  validator.query(rulesGetQuerySchema),
  RuleController.findAll,
);
RuleRouter.get('/:cat_id', RuleController.findOne);

RuleRouter.post('/', validator.body(rulesPostSchema), RuleController.create);

RuleRouter.put('/', validator.body(updateRuleSchema), RuleController.update);

RuleRouter.delete(
  '/',
  validator.body(rulesDeleteSchema),
  RuleController.destroy,
);

export { RuleRouter };
