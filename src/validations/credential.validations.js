import Joi from 'joi';

const createCredentialSchema = Joi.object({
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
});

export { createCredentialSchema };
