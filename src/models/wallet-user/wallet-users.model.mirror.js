'use strict';

import Sequelize from 'sequelize';
const { Model } = Sequelize;

import { sequelizeMirror, safeMirrorDbHandler } from '../../database';
import ModelTypes from './wallet-users.model.types.cjs';

class WalletUserMirror extends Model {}

safeMirrorDbHandler(() => {
  WalletUserMirror.init(ModelTypes, {
    sequelize: sequelizeMirror,
    modelName: 'walletUser',
    tableName: 'wallet_users',
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

export { WalletUserMirror };
