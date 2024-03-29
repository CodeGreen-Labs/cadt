import Joi from 'joi';

import {
  genericFilterRegex,
  genericSortColumnRegex,
} from '../utils/string-utils';

export const ruleBaseSchema = {
  origin_project_id: Joi.string().required(),
  warehouse_project_id: Joi.string().required(),
  warehouse_unit_id: Joi.string().required(),
  issuance_id: Joi.string().required(),
  cat_id: Joi.string().required(),
  kyc_receiving: Joi.number().required(),
  kyc_retirement: Joi.number().required(),
  kyc_sending: Joi.number().required(),
  commit_status: Joi.object().optional(),
  last_modified_time: Joi.string().allow(null).optional(),
};

export const rulesGetQuerySchema = Joi.object()
  .keys({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    columns: Joi.array().items(Joi.string()).single(),
    orgUid: Joi.string(),
    warehouseProjectId: Joi.string(),
    xls: Joi.boolean(),
    projectIds: Joi.array().items(Joi.string()).single(),
    filter: Joi.string().regex(genericFilterRegex),
    onlyMarketplaceProjects: Joi.boolean(),
    cat_id: Joi.string(),
    order: Joi.string().regex(genericSortColumnRegex).default('updatedAt:DESC'), // Adjusted default value
  })
  .with('page', 'limit')
  .with('limit', 'page');

export const rulesPostSchema = Joi.object({
  ...ruleBaseSchema,
});

export const updateRuleSchema = Joi.object({
  cat_id: Joi.string().required(),
  kyc_receiving: Joi.number(),
  kyc_retirement: Joi.number(),
  kyc_sending: Joi.number(),
});

export const rulesDeleteSchema = Joi.object({
  cat_id: Joi.string().required(),
});
