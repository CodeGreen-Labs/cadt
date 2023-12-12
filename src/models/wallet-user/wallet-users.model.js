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

    const exist = super.findByPk(id);

    let result;

    if (exist) {
      result = super.update({ ...data }, { ...options, where: { id: id } });
    } else {
      result = super.upsert(data, options);
    }

    WalletUser.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      values.orgUid,
    ]);
    return result;
  }

  static async generateChangeListFromStagedData(stagedData, comment, author) {
    const [insertRecords, updateRecords, deleteChangeList] =
      Staging.seperateStagingDataIntoActionGroups(
        stagedData,
        this.stagingTableName,
      );

    const primaryKeyMap = {
      walletUser: 'id',
    };

    const insertXslsSheets = createXlsFromSequelizeResults({
      rows: insertRecords,
      model: WalletUser,
      toStructuredCsv: true,
    });

    const updateXslsSheets = createXlsFromSequelizeResults({
      rows: updateRecords,
      model: WalletUser,
      toStructuredCsv: true,
    });

    const insertChangeList = await transformFullXslsToChangeList(
      insertXslsSheets,
      'insert',
      primaryKeyMap,
    );

    const updateChangeList = await transformFullXslsToChangeList(
      updateXslsSheets,
      'update',
      primaryKeyMap,
    );
    console.log('updateChangeList', updateChangeList);

    const { registryId } = await Organization.getHomeOrg();
    const currentDataLayer = await dataLayer.getCurrentStoreData(registryId);
    const currentComment = currentDataLayer.filter(
      (kv) => kv.key === 'comment',
    );
    const isUpdateComment = currentComment.length > 0;
    const commentChangeList = keyValueToChangeList(
      'comment',
      `{"comment": "${comment}"}`,
      isUpdateComment,
    );

    const currentAuthor = currentDataLayer.filter((kv) => kv.key === 'author');
    const isUpdateAuthor = currentAuthor.length > 0;
    const authorChangeList = keyValueToChangeList(
      'author',
      `{"author": "${author}"}`,
      isUpdateAuthor,
    );
    return {
      walletUsers: [
        ..._.get(insertChangeList, 'walletUser', []),
        ..._.get(updateChangeList, 'walletUser', []),
        ...deleteChangeList,
      ],

      comment: commentChangeList,
      author: authorChangeList,
    };
  }
}

WalletUser.init(ModelTypes, {
  sequelize,
  modelName: 'walletUser',
  tableName: 'wallet_users',
  timestamps: true,
});

export { WalletUser };
