'use strict';

import Sequelize from 'sequelize';
const { Model } = Sequelize;
import { sequelize, safeMirrorDbHandler } from '../../database';

import ModelTypes from './users.modeltypes.cjs';
import { UserMirror } from './user.model.mirror';
import { Credential } from '../credentials';

class User extends Model {
  static associate() {
    User.belongsTo(Credential, {
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
      await UserMirror.create(values, mirrorOptions);
    });
    return super.create(values, options);
  }

  static async destroy(options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await UserMirror.destroy(mirrorOptions);
    });
    return super.destroy(options);
  }

  static async upsert(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await UserMirror.upsert(values, mirrorOptions);
    });
    return super.upsert(values, options);
  }
}

User.init(ModelTypes, {
  sequelize,
  modelName: 'user',
  timestamps: true,
});

export { User };
