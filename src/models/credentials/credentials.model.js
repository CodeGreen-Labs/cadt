import Sequelize from 'sequelize';
const { Model } = Sequelize;
import _ from 'lodash';
import * as rxjs from 'rxjs';
import ModelTypes from './credentials.model.types.cjs';
import { CredentialLevel, WalletUser } from '../';
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
  // static validateImport = projectsUpdateSchema;

  static getAssociatedModels = () => [
    {
      model: CredentialLevel,
      pluralize: true,
    },
    {
      model: WalletUser,
      pluralize: true,
    },
  ];

  static associate() {
    Credential.belongsTo(CredentialLevel, {
      foreignKey: 'credentialLevelId',
      as: 'credentialLevel',
    });
    Credential.belongsTo(WalletUser, {
      foreignKey: 'walletUserId',
      as: 'user',
    });

    safeMirrorDbHandler(() => {
      CredentialMirror.belongsTo(CredentialLevel, {
        foreignKey: 'credentialLevelId',
        as: 'credentialLevel',
      });
      CredentialMirror.belongsTo(WalletUser, {
        foreignKey: 'walletUserId',
        as: 'user',
      });
    });
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
    const {
      orgUid,
      document_id,
      expired_date,
      credential_level,
      wallet_user,
      id,
    } = values;

    const createBody = {
      id,
      document_id,
      expired_date,
      credential_level: credential_level.level,
      wallet_user_public_key: wallet_user.public_key,
      orgUid,
      commit_status: 'committed',
    };
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialMirror.upsert(createBody, mirrorOptions);
    });

    const existWalletUser = await WalletUser.findByPk(wallet_user.public_key);
    if (!existWalletUser) {
      await WalletUser.upsert(wallet_user);
    }

    const upsertResult = await super.upsert(createBody, options);

    Credential.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      orgUid,
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
      project: 'id',
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
