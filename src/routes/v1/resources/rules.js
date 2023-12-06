'use strict';

import express from 'express';
import joiExpress from 'express-joi-validation';
import { RuleController } from '../../../controllers';

const validator = joiExpress.createValidator({ passError: true });
const RuleRouter = express.Router();

import { rulesGetQuerySchema, rulesPostSchema } from '../../../validations';

RuleRouter.get('/', validator.query(rulesGetQuerySchema), (req, res) => {
  return req.query.cat_id
    ? RuleController.findOne(req, res)
    : RuleController.findAll(req, res);
});

RuleRouter.post('/', validator.body(rulesPostSchema), RuleController.create);

export { RuleRouter };
