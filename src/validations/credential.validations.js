import Joi from 'joi';
import { omitObjectKeys } from '../utils/validation-utils';
import {
  genericFilterRegex,
  genericSortColumnRegex,
} from '../utils/string-utils';

const baseCredentialSchema = {
  document_id: Joi.string().required(),

  expired_date: Joi.date().required(),

  credential_level: Joi.number().integer().required(),

  wallet_user: {
    public_key: Joi.string().required(),

    ein: Joi.string().required(),

    name: Joi.string().required(),

    contact_address: Joi.string().required(),

    email: Joi.string().email().required(),
  },
};

const createCredentialSchema = Joi.object({
  ...baseCredentialSchema,
});

const walletUserPostSchema = {
  id: Joi.string().required(),
  ...baseCredentialSchema.wallet_user,
};

const credentialPostSchema = {
  id: Joi.string().required(),
  wallet_user_id: Joi.string().required(),
  ...omitObjectKeys(baseCredentialSchema, ['wallet_user']),
};

const updateCredentialSchema = Joi.object().keys({
  ...baseCredentialSchema,
  id: Joi.string().required(),
  wallet_user: omitObjectKeys(baseCredentialSchema.wallet_user, [
    'public_key',
    'ein',
    'name',
  ]),
});

const deleteCredentialSchema = Joi.object().keys({
  id: Joi.string().required(),
});

export const credentialGetQuerySchema = Joi.object()
  .keys({
    page: Joi.number().integer().min(1), // Ensures page is a positive integer
    limit: Joi.number().integer().min(1), // Ensures limit is a positive integer
    orgUid: Joi.string(),
    search: Joi.string(),
    order: Joi.string().regex(genericSortColumnRegex).default('updatedAt:DESC'), // Adjusted default value
    filter: Joi.string().regex(genericFilterRegex),
  })
  .with('page', 'limit')
  .with('limit', 'page');

export {
  createCredentialSchema,
  updateCredentialSchema,
  walletUserPostSchema,
  credentialPostSchema,
  deleteCredentialSchema,
};
