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

RuleRouter.get('/', validator.query(rulesGetQuerySchema), (req, res) => {
  return req.query.cat_id
    ? RuleController.findOne(req, res)
    : RuleController.findAll(req, res);
});

RuleRouter.post('/', validator.body(rulesPostSchema), RuleController.create);

RuleRouter.put('/', validator.body(rulesPostSchema), RuleController.update);

RuleRouter.delete(
  '/',
  validator.body(rulesDeleteSchema),
  RuleController.update,
);

export { RuleRouter };
