'use strict';
import Sequelize from 'sequelize';
const { Model } = Sequelize;
import { sequelize, safeMirrorDbHandler } from '../../database';
import { Project, Rule, Unit } from '..';

import ModelTypes from './issuances.modeltypes.cjs';
import { IssuanceMirror } from './issuances.model.mirror';

class Issuance extends Model {
  static associate() {
    Issuance.belongsTo(Project, {
      sourceKey: 'warehouseProjectId',
      foreignKey: 'warehouseProjectId',
    });

    Issuance.hasMany(Unit, {
      targetKey: 'issuanceId',
      foreignKey: 'issuanceId',
    });
    Issuance.hasMany(Rule, {
      targetKey: 'issuanceId',
      foreignKey: 'issuance_id',
    });

    safeMirrorDbHandler(() => {
      IssuanceMirror.belongsTo(Project, {
        targetKey: 'warehouseProjectId',
        foreignKey: 'warehouseProjectId',
      });
      IssuanceMirror.hasOne(Unit, {
        targetKey: 'warehouseUnitId',
        foreignKey: 'warehouseUnitId',
      });
      Issuance.hasMany(Rule, {
        targetKey: 'issuanceId',
        foreignKey: 'issuance_id',
      });
    });
  }

  static async create(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await IssuanceMirror.create(values, mirrorOptions);
    });
    return super.create(values, options);
  }

  static async destroy(options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await IssuanceMirror.destroy(mirrorOptions);
    });
    return super.destroy(options);
  }

  static async upsert(values, options) {
    safeMirrorDbHandler(async () => {
      const mirrorOptions = {
        ...options,
        transaction: options?.mirrorTransaction,
      };
      await IssuanceMirror.upsert(values, mirrorOptions);
    });
    return super.upsert(values, options);
  }
}

Issuance.init(ModelTypes, {
  sequelize,
  modelName: 'issuance',
  timestamps: true,
});

export { Issuance };
