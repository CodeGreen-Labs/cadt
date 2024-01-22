import Joi from 'joi';

const baseCredentialTypeSchema = {
  name: Joi.string().required(),
  description: Joi.string(),
};

const createCredentialTypeSchema = Joi.object({
  ...baseCredentialTypeSchema,
});

const updateCredentialTypeSchema = Joi.object({
  ...baseCredentialTypeSchema,
  id: Joi.string().required(),
});

export { createCredentialTypeSchema, updateCredentialTypeSchema };
