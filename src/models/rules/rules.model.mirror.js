'use strict';

import Sequelize from 'sequelize';
const { Model } = Sequelize;

import { safeMirrorDbHandler, sequelizeMirror } from '../../database';
import ModelTypes from './rules.modeltypes.cjs';

class RuleMirror extends Model {}

safeMirrorDbHandler(() => {
  RuleMirror.init(ModelTypes, {
    sequelize: sequelizeMirror,
    modelName: 'rule',
    foreignKey: 'cat_id',
    timestamps: true,
    timezone: '+00:00',
    useHooks: true,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true,
    },
  });
});

export { RuleMirror };
