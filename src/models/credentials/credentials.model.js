import Sequelize from 'sequelize';
const { Model } = Sequelize;
import _ from 'lodash';
import * as rxjs from 'rxjs';
import ModelTypes from './credentials.model.types.cjs';
import { WalletUser } from '../';
import { CredentialMirror } from './credentials.model.mirror';
import { sequelize, safeMirrorDbHandler } from '../../database';
import { Organization, Staging } from '../';

import {
  createXlsFromSequelizeResults,
  transformFullXslsToChangeList,
} from '../../utils/xls';

import dataLayer from '../../datalayer';
import { keyValueToChangeList } from '../../utils/datalayer-utils';

class Credential extends Model {
  static stagingTableName = 'Credentials';
  static changes = new rxjs.Subject();
  static defaultColumns = Object.keys(ModelTypes);

  static getAssociatedModels = () => [
    {
      model: WalletUser,
      pluralize: true,
    },
  ];

  static associate() {
    // Credential.belongsTo(WalletUser, {
    //   foreignKey: 'wallet_user',
    //   targetKey: 'public_key',
    // });
  }
  static async create(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialMirror.create(values, mirrorOptions);
    });

    const createResult = await super.create(values, options);

    const { orgUid } = values;

    Credential.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      orgUid,
    ]);

    return createResult;
  }

  static async destroy(options) {
    await safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };

      await CredentialMirror.destroy(mirrorOptions);
    });

    Credential.changes.next([this.stagingTableName.toLocaleLowerCase()]);
    return super.destroy(options);
  }

  static async upsert(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialMirror.upsert(values, mirrorOptions);
    });

    const upsertResult = await super.upsert(
      { ...values, commit_status: 'committed' },
      options,
    );

    Credential.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      values.orgUid,
    ]);

    return upsertResult;
  }

  static async generateChangeListFromStagedData(stagedData, comment, author) {
    const [insertRecords, updateRecords, deleteChangeList] =
      Staging.seperateStagingDataIntoActionGroups(
        stagedData,
        this.stagingTableName,
      );

    const primaryKeyMap = {
      credential: 'id',
    };

    const insertXslsSheets = createXlsFromSequelizeResults({
      rows: insertRecords,
      model: Credential,
      toStructuredCsv: true,
    });
    const updateXslsSheets = createXlsFromSequelizeResults({
      rows: updateRecords,
      model: Credential,
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
      credentials: [
        ..._.get(insertChangeList, 'credential', []),
        ..._.get(updateChangeList, 'credential', []),
        ...deleteChangeList,
      ],

      comment: commentChangeList,
      author: authorChangeList,
    };
  }
}

Credential.init(ModelTypes, {
  sequelize,
  modelName: 'credential',
  tableName: 'credentials',
  freezeTableName: true,
  timestamps: true,
});

export { Credential };
