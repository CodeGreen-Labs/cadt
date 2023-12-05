'use strict';

import * as rxjs from 'rxjs';
import Sequelize from 'sequelize';
const { Model } = Sequelize;

import { safeMirrorDbHandler, sequelize } from '../../database';

import { rulesUpdateSchema } from '../../validations/index';

import { RuleMirror } from './rules.model.mirror';
import ModelTypes from './rules.modeltypes.cjs';

class Rule extends Model {
  static stagingTableName = 'Rules';
  static changes = new rxjs.Subject();
  static validateImport = rulesUpdateSchema;

  static getAssociatedModels = () => [];

  static associate() {}

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
}

Rule.init(ModelTypes, {
  sequelize,
  modelName: 'rules',
  timestamps: true,
});

export { Rule };
