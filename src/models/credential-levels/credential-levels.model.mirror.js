'use strict';

import Sequelize from 'sequelize';
const { Model } = Sequelize;

import { sequelizeMirror, safeMirrorDbHandler } from '../../database';
import ModelTypes from './credential-levels.model.types.cjs';

class CredentialLevelMirror extends Model {}

safeMirrorDbHandler(() => {
  CredentialLevelMirror.init(ModelTypes, {
    sequelize: sequelizeMirror,
    modelName: 'credentialLevel',
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
export { CredentialLevelMirror };
