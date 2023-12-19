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
  ];

  static associate() {
    Credential.belongsTo(WalletUser, {
      foreignKey: 'wallet_user_id',
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
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialMirror.upsert(values, mirrorOptions);
    });

    const { id, ...data } = values;

    const exist = await super.findByPk(id);

    let result;

    if (exist)
      result = await super.update(
        { ...data, commit_status: 'committed' },
        {
          ...options,
          where: { id },
        },
      );
    else {
      result = await super.upsert(
        { ...values, commit_status: 'committed' },
        options,
      );
    }

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
