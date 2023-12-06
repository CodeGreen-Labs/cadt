'use strict';

import Sequelize from 'sequelize';
const { Model } = Sequelize;
import { sequelize, safeMirrorDbHandler } from '../../database';

import ModelTypes from './wallet-users.model.types.cjs';
import { WalletUserMirror } from './wallet-users.model.mirror';
import { Credential } from '../credentials';

class WalletUser extends Model {
  static associate() {
    WalletUser.hasMany(Credential, {
      foreignKey: 'walletUserId',
      as: 'credentials',
    });

    safeMirrorDbHandler(() => {
      WalletUserMirror.hasMany(Credential, {
        foreignKey: 'walletUserId',
        as: 'credentialLevel',
      });
    });
  }

  static async create(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await WalletUserMirror.create(values, mirrorOptions);
    });
    return super.create(values, options);
  }

  static async destroy(options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await WalletUserMirror.destroy(mirrorOptions);
    });
    return super.destroy(options);
  }

  static async upsert(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await WalletUserMirror.upsert(values, mirrorOptions);
    });
    return super.upsert(values, options);
  }
}

WalletUser.init(ModelTypes, {
  sequelize,
  modelName: 'WalletUser',
  tableName: 'wallet_users',
  timestamps: true,
});

export { WalletUser };
