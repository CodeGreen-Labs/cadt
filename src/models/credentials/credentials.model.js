import Sequelize from 'sequelize';
const { Model } = Sequelize;
import _ from 'lodash';
import * as rxjs from 'rxjs';
import ModelTypes from './credentials.model.types.cjs';
import { WalletUser, Staging } from '../';
import { CredentialMirror } from './credentials.model.mirror';
import { sequelize, safeMirrorDbHandler } from '../../database';
import { transformStageToCommitData } from '../../utils/model-utils.js';

import { credentialPostSchema } from '../../validations';

class Credential extends Model {
  static stagingTableName = 'Credentials';
  static changes = new rxjs.Subject();
  static defaultColumns = Object.keys(ModelTypes);
  static validateImport = credentialPostSchema;

  static getAssociatedModels = () => [
    {
      model: WalletUser,
      pluralize: true,
      foreignKey: 'wallet_user_id',
    },
    {
      model: Staging,
      pluralize: true,
      foreignKey: 'id',
    },
  ];

  static associate() {
    Credential.belongsTo(WalletUser, {
      foreignKey: 'wallet_user_id',
    });

    Credential.hasOne(Staging, {
      foreignKey: 'uuid',
    });
    safeMirrorDbHandler(() => {
      Credential.belongsTo(WalletUser, {
        foreignKey: 'wallet_user_id',
      });

      Credential.hasOne(Staging, {
        foreignKey: 'uuid',
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
    return await super.destroy(options);
  }

  // Upsert will only be called if the credential is committed.
  static async upsert(values, options) {
    const { walletUser, ...data } = values;
    const newRecord = {
      ...data,
      commit_status: 'committed',
      updatedAt: new Date(),
    };
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      // if use simulator mode we need to create walletUser before creating credential
      if (walletUser) await WalletUser.upsert(walletUser);

      await CredentialMirror.upsert(newRecord, mirrorOptions);
    });

    if (walletUser) await WalletUser.upsert(walletUser);

    const result = await super.upsert(newRecord, options);

    Credential.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      values.orgUid,
    ]);

    return result;
  }

  static async generateChangeListFromStagedData(stageData) {
    const commitData = transformStageToCommitData(stageData);

    const uuids = stageData.map((stage) => stage.uuid);
    await Staging.update(
      { commited: true },
      { where: { uuid: { [Sequelize.Op.in]: uuids } } },
    );

    return commitData;
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
