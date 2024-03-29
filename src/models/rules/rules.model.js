'use strict';

import _ from 'lodash';
import * as rxjs from 'rxjs';
import Sequelize from 'sequelize';
const { Model } = Sequelize;

import { safeMirrorDbHandler, sequelize } from '../../database';
import { Issuance, Organization, Staging, Project, Unit } from '../';
import { rulesPostSchema } from '../../validations/index';

import dataLayer from '../../datalayer';
import { keyValueToChangeList } from '../../utils/datalayer-utils';
import { getDeletedItems } from '../../utils/model-utils.js';
import {
  createXlsFromSequelizeResults,
  transformFullXslsToChangeList,
} from '../../utils/xls';

import { RuleMirror } from './rules.model.mirror';
import ModelTypes from './rules.modeltypes.cjs';

class Rule extends Model {
  static stagingTableName = 'Rules';
  static changes = new rxjs.Subject();
  static validateImport = rulesPostSchema;
  static defaultColumns = Object.keys(ModelTypes);

  static getAssociatedModels = () => [
    {
      model: Project,
      pluralize: false,
      foreignKey: 'warehouse_project_id',
      as: 'project',
    },
    {
      model: Issuance,
      pluralize: false,
      foreignKey: 'issuance_id',
      as: 'issuance',
    },
    {
      model: Unit,
      pluralize: false,
      foreignKey: 'warehouse_unit_id',
      as: 'unit',
    },
    {
      model: Staging,
      pluralize: false,
      foreignKey: 'cat_id',
    },
  ];

  static associate() {
    Rule.belongsTo(Project, {
      foreignKey: 'warehouse_project_id',
    });
    Rule.belongsTo(Issuance, {
      foreignKey: 'issuance_id',
    });

    Rule.belongsTo(Unit, {
      foreignKey: 'warehouse_unit_id',
    });
    Rule.hasOne(Staging, {
      foreignKey: 'uuid',
    });

    safeMirrorDbHandler(() => {
      Rule.belongsTo(Project, {
        foreignKey: 'warehouse_project_id',
      });
      Rule.belongsTo(Issuance, {
        foreignKey: 'issuance_id',
      });

      Rule.belongsTo(Unit, {
        foreignKey: 'warehouse_unit_id',
      });
      Rule.hasOne(Staging, {
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
      await RuleMirror.create(values, mirrorOptions);
    });

    const createResult = await super.create(values, options);

    return createResult;
  }

  static async destroy(options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await RuleMirror.destroy(mirrorOptions);
    });
    Rule.changes.next([this.stagingTableName.toLocaleLowerCase()]);
    return await super.destroy(options);
  }

  // Upsert will only be called if the rule is committed.
  static async upsert(values, options) {
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
      await RuleMirror.upsert(newRecord, mirrorOptions);
    });

    const result = await super.upsert(newRecord, options);
    Rule.changes.next([
      this.stagingTableName.toLocaleLowerCase(),
      values.orgUid,
    ]);
    return result;
  }

  static async generateChangeListFromStagedData(stagedData, comment, author) {
    const [insertRecords, updateRecords, deleteChangeList] =
      Staging.seperateStagingDataIntoActionGroups(stagedData, 'Rules');

    const primaryKeyMap = {
      rules: 'cat_id',
    };

    const deletedRecords = await getDeletedItems(
      updateRecords,
      primaryKeyMap,
      Rule,
      'rules',
    );

    const insertXslsSheets = createXlsFromSequelizeResults({
      rows: insertRecords,
      model: Rule,
      toStructuredCsv: true,
    });

    const updateXslsSheets = createXlsFromSequelizeResults({
      rows: updateRecords,
      model: Rule,
      toStructuredCsv: true,
    });

    const deleteXslsSheets = createXlsFromSequelizeResults({
      rows: deletedRecords,
      model: Rule,
      toStructuredCsv: true,
    });

    if (deleteXslsSheets.labels?.data.length > 1) {
      const warehouseProjectIdIndex =
        deleteXslsSheets.labels.data[0].indexOf('warehouseProjectId');
      if (warehouseProjectIdIndex >= 0) {
        for (
          let index = deleteXslsSheets.labels.data.length - 1;
          index > 0;
          --index
        ) {
          if (
            deleteXslsSheets.labels.data[index][warehouseProjectIdIndex] != null
          ) {
            deleteXslsSheets.labels.data.splice(index, 1);
          }
        }
      }

      if (deleteXslsSheets.labels.data.length === 1) {
        delete deleteXslsSheets.labels;
      }
    }

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
      rules: [
        ..._.get(insertChangeList, 'rules', []),
        ..._.get(updateChangeList, 'rules', []),
        ...deleteChangeList,
      ],
      comment: commentChangeList,
      author: authorChangeList,
    };
  }
}

Rule.init(ModelTypes, {
  sequelize,
  modelName: 'rules',
  tableName: 'rules',
  timestamps: true,
});

export { Rule };
