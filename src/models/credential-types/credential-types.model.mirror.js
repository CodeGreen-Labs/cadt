'use strict';

import Sequelize from 'sequelize';
const { Model } = Sequelize;

import { sequelizeMirror, safeMirrorDbHandler } from '../../database';
import ModelTypes from './credential-types.model.types.cjs';
class CredentialTypeMirror extends Model {}

safeMirrorDbHandler(() => {
  CredentialTypeMirror.init(ModelTypes, {
    sequelize: sequelizeMirror,
    modelName: 'credentialType',
    tableName: 'credential_types',
    timestamps: true,
    timezone: '+00:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true,
    },
    createdAt: true,
    updatedAt: true,
  });
});
export { CredentialTypeMirror };
