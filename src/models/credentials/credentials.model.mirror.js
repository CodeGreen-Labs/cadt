import Sequelize from 'sequelize';
import { sequelizeMirror, safeMirrorDbHandler } from '../../database';
const { Model } = Sequelize;
import ModelTypes from './credentials.modeltypes.cjs';

class CredentialMirror extends Model {}

safeMirrorDbHandler(() => {
  CredentialMirror.init(ModelTypes, {
    sequelize: sequelizeMirror,
    modelName: 'credential',
    foreignKey: 'credentialId',
    timestamps: true,
    timezone: '+00:00',
    useHooks: true,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true,
    },
  });
});

export { CredentialMirror };
