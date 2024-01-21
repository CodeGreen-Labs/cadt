import Sequelize from 'sequelize';
const { Model } = Sequelize;
import ModelTypes from './credential-types.model.types.cjs';
import { safeMirrorDbHandler, sequelize } from '../../database';

class CredentialType extends Model {
  static associate() {}

  static async create(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialType.create(values, mirrorOptions);
    });
    return super.create(values, options);
  }

  static async destroy(options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialType.destroy(mirrorOptions);
    });
    return super.destroy(options);
  }

  static async upsert(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialType.upsert(values, mirrorOptions);
    });
    return super.upsert(values, options);
  }
}

CredentialType.init(ModelTypes, {
  sequelize,
  modelName: 'CredentialType',
  tableName: 'credential_types',
  timestamps: true,
});

export { CredentialType };
