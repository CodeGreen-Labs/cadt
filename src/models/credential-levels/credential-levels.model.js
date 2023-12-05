import Sequelize from 'sequelize';
const { Model } = Sequelize;
import ModelTypes from './credential-levels.modeltypes.cjs';
import { safeMirrorDbHandler, sequelize } from '../../database';
import { Credential } from '../credentials';

class CredentialLevel extends Model {
  static associate() {
    CredentialLevel.belongsTo(Credential, {
      targetKey: 'credentialId',
      foreignKey: 'credentialId',
    });
  }

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
  timestamps: true,
});

export { CredentialLevel };
