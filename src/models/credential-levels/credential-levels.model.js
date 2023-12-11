import Sequelize from 'sequelize';
const { Model } = Sequelize;
import ModelTypes from './credential-levels.model.types.cjs';
import { safeMirrorDbHandler, sequelize } from '../../database';

class CredentialLevel extends Model {
  static associate() {}

  static async create(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialLevel.create(values, mirrorOptions);
    });
    return super.create(values, options);
  }

  static async destroy(options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialLevel.destroy(mirrorOptions);
    });
    return super.destroy(options);
  }

  static async upsert(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialLevel.upsert(values, mirrorOptions);
    });
    return super.upsert(values, options);
  }
}

CredentialLevel.init(ModelTypes, {
  sequelize,
  modelName: 'credentialLevel',
  tableName: 'credential_levels',
  timestamps: true,
});

export { CredentialLevel };
