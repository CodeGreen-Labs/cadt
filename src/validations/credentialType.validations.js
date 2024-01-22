import Joi from 'joi';

const baseCredentialTypeSchema = {
  name: Joi.string().required(),
  description: Joi.string(),
};

const createCredentialTypeSchema = Joi.object({
  ...baseCredentialTypeSchema,
});

export { createCredentialTypeSchema };
