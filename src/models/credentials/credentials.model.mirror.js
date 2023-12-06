import Sequelize from 'sequelize';
import { sequelizeMirror, safeMirrorDbHandler } from '../../database';
const { Model } = Sequelize;
import ModelTypes from './credentials.model.types.cjs';

class CredentialMirror extends Model {}

safeMirrorDbHandler(() => {
  CredentialMirror.init(ModelTypes, {
    sequelize: sequelizeMirror,
    modelName: 'credential',
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

export { CredentialMirror };
