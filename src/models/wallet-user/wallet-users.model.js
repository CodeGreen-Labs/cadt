'use strict';

import Sequelize from 'sequelize';
const { Model } = Sequelize;
import { sequelize, safeMirrorDbHandler } from '../../database';
import * as rxjs from 'rxjs';

import ModelTypes from './wallet-users.model.types.cjs';
import { WalletUserMirror } from './wallet-users.model.mirror';
import _ from 'lodash';
import { Organization, Staging } from '../';

import {
  createXlsFromSequelizeResults,
  transformFullXslsToChangeList,
} from '../../utils/xls';
import { Credential } from '../';

import dataLayer from '../../datalayer';
import { keyValueToChangeList } from '../../utils/datalayer-utils';
import { walletUserPostSchema } from '../../validations';
class WalletUser extends Model {
  static stagingTableName = 'WalletUsers';
  static changes = new rxjs.Subject();
  static validateImport = walletUserPostSchema;
  static defaultColumns = Object.keys(ModelTypes);
  static associate() {
    WalletUser.hasOne(Credential, {
      foreignKey: 'wallet_user_id',
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
    WalletUser.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      values.orgUid,
    ]);

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
    WalletUser.changes.next([this.stagingTableName.toLocaleLowerCase()]);
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

    const { id, ...data } = values;

    const exist = await super.findByPk(id);
    let result;

    if (exist) {
      result = await super.update(
        { ...data },
        { ...options, where: { id: id } },
      );
    } else {
      result = await super.upsert({ ...values }, options);
    }
    WalletUser.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      values.orgUid,
    ]);
    return result;
  }
}

WalletUser.init(ModelTypes, {
  sequelize,
  modelName: 'walletUser',
  tableName: 'wallet_users',
  timestamps: true,
});

export { WalletUser };
