import Sequelize from 'sequelize';
const { Model } = Sequelize;
import * as rxjs from 'rxjs';
import ModelTypes from './credentials.model.types.cjs';
import { CredentialLevel, WalletUser } from '../';
import { CredentialMirror } from './credentials.model.mirror';
import { sequelize, safeMirrorDbHandler } from '../../database';

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

    Credential.changes.next(['credentials', orgUid]);

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

    Credential.changes.next(['credentials']);
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
    const upsertResult = await super.upsert(values, options);

    const { orgUid } = values;

    Credential.changes.next(['credentials', orgUid]);

    return upsertResult;
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
