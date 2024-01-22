import Joi from 'joi';
import {
  genericFilterRegex,
  genericSortColumnRegex,
} from '../utils/string-utils';

const baseCredentialSchema = {
  document_id: Joi.string().required(),

  expired_date: Joi.string().required(),

  credential_type: Joi.string().required(),

  walletUser: {
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
  document_id: Joi.string().required(),

  expired_date: Joi.string().required(),

  credential_type: Joi.number().required(),

  walletUser: {
    public_key: Joi.string().required(),

    ein: Joi.string().required(),

    name: Joi.string().required(),

    contact_address: Joi.string().required(),

    email: Joi.string().email().required(),
  },
};

const updateCredentialSchema = Joi.object().keys({
  id: Joi.string().required(),

  document_id: Joi.string(),

  expired_date: Joi.string(),

  credential_type: Joi.number(),

  walletUser: {
    name: Joi.string(),

    contact_address: Joi.string(),

    email: Joi.string().email(),
  },
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
