import Sequelize from 'sequelize';
const { Model } = Sequelize;
import ModelTypes from './credential-levels.model.types.cjs';
import { safeMirrorDbHandler, sequelize } from '../../database';
import { Credential } from '../credentials';
import { CredentialLevelMirror } from './credential-levels.model.mirror';

class CredentialLevel extends Model {
  static associate() {
    CredentialLevel.hasMany(Credential, {
      foreignKey: 'credentialLevelId', // This should match the foreign key in the Credential model
      as: 'credentials',
    });

    safeMirrorDbHandler(() => {
      CredentialLevelMirror.hasMany(Credential, {
        foreignKey: 'credentialLevelId',
        as: 'credentials',
      });
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
  tableName: 'credential_levels',
  timestamps: true,
});

export { CredentialLevel };
