import Sequelize from 'sequelize';
const { Model } = Sequelize;
import ModelTypes from './credential-types.model.types.cjs';
import { safeMirrorDbHandler, sequelize } from '../../database';
import { transformStageToCommitData } from '../../utils/model-utils.js';
import { CredentialTypeMirror, Staging } from '../';
import * as rxjs from 'rxjs';

class CredentialType extends Model {
  static stagingTableName = 'credentialType';
  static changes = new rxjs.Subject();
  static defaultColumns = Object.keys(ModelTypes);
  static associate() {}

  static async create(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialTypeMirror.create(values, mirrorOptions);
    });

    return await super.create(values, options);
  }

  static async destroy(options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialTypeMirror.destroy(mirrorOptions);
    });
    return await super.destroy(options);
  }

  static async upsert(values, options) {
    console.log('type upsert', values);
    const newRecord = {
      ...values,
      commit_status: 'committed',
      updatedAt: new Date(),
    };
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await CredentialTypeMirror.upsert(newRecord, mirrorOptions);
    });

    CredentialType.changes.next([this.stagingTableName, values.orgUid]);
    return await super.upsert(newRecord, options);
  }

  static async generateChangeListFromStagedData(stageData) {
    const commitData = transformStageToCommitData(stageData);
    console.log('type ' + commitData);
    const uuids = stageData.map((stage) => stage.uuid);
    await Staging.update(
      { commited: true },
      { where: { uuid: { [Sequelize.Op.in]: uuids } } },
    );
    console.log('generateChangeListFromStagedData', commitData);
    return commitData;
  }
}

CredentialType.init(ModelTypes, {
  sequelize,
  modelName: 'credentialType',
  tableName: 'credential_types',
  timestamps: true,
});

export { CredentialType };
