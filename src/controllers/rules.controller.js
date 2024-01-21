import _ from 'lodash';

import { Sequelize } from 'sequelize';

import { Rule, Staging, Organization } from '../models';

import { paginationParams } from '../utils/helpers';

import {
  assertCredentialTypeRecordExists,
  assertHomeOrgExists,
  assertIfReadOnlyMode,
  assertNoPendingCommits,
  assertRuleRecordExists,
} from '../utils/data-assertions';

import { getQuery } from '../utils/sql-utils';
import { transformResult, transformStagingData } from '../utils/format-utils';
export const create = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();

    const newRecord = _.cloneDeep(req.body);

    await assertCredentialTypeRecordExists([
      newRecord.kyc_receiving,
      newRecord.kyc_retirement,
      newRecord.kyc_sending,
    ]);
    const { orgUid } = await Organization.getHomeOrg();
    await Rule.create({ ...newRecord, commit_status: 'staged', orgUid });

    await Staging.upsert({
      uuid: newRecord.cat_id,
      action: 'INSERT',
      commited: true,
      table: Rule.stagingTableName,
      data: JSON.stringify([newRecord]),
    });

    res.json({
      message: 'Rules staged successfully',
      data: req.body,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error creating new rule',
      error: err.message,
      success: false,
    });
  }
};

export const findAll = async (req, res) => {
  try {
    let { page, limit, search, orgUid, filter, order } = req.query;

    let where = {};
    if (search) {
      where = {
        [Sequelize.Op.or]: [
          {
            '$project.warehouseProjectId$': {
              [Sequelize.Op.like]: `%${search}%`,
            },
          },
          { '$project.projectName$': { [Sequelize.Op.like]: `%${search}%` } },
          { $cat_id$: { [Sequelize.Op.like]: `%${search}%` } },
          { '$unit.vintageYear$': { [Sequelize.Op.like]: `%${search}%` } },
          {
            '$unit.serialNumberBlock$': { [Sequelize.Op.like]: `%${search}%` },
          },
        ],
      };
    }
    if (orgUid) {
      where.orgUid = orgUid;
    }

    const { orderCondition, whereCondition } = getQuery(filter, order);

    const pagination = paginationParams(page, limit);

    let rules = await Rule.findAndCountAll({
      where: { ...where, ...whereCondition },
      include: Rule.getAssociatedModels(),
      order: orderCondition,
      ...pagination,
    });

    res.status(200).json({
      success: true,
      data: transformResult(rules),
    });
  } catch (error) {
    console.trace(error);
    res.status(400).json({
      message: 'Error on retrieving rules',
      error: error.message,
      success: false,
    });
  }
};

export const findOne = async (req, res) => {
  try {
    const result = await Rule.findByPk(req.params.cat_id, {
      include: Rule.getAssociatedModels().map((association) => {
        return association.model;
      }),
    });

    res.json({
      success: true,
      data: {
        ...result.dataValues,
        staging: transformStagingData(result.staging),
      },
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error on retrieving rule',
      error: error.message,
      success: false,
    });
  }
};

export const update = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();
    const existingRecord = await assertRuleRecordExists(req.body.cat_id);

    const updatedRecord = _.cloneDeep(req.body);

    await assertCredentialTypeRecordExists([
      updatedRecord.kyc_receiving,
      updatedRecord.kyc_retirement,
      updatedRecord.kyc_sending,
    ]);
    await Rule.update(
      { commit_status: 'staged' },
      {
        where: {
          cat_id: existingRecord.cat_id,
        },
      },
    );
    //  Will only be received updated fields, we need to include all the fields for upsetting
    const stagedData = {
      uuid: req.body.cat_id,
      action: 'UPDATE',
      table: Rule.stagingTableName,
      data: JSON.stringify([
        { ...existingRecord, ...updatedRecord, commit_status: 'staged' },
      ]),
    };

    await Staging.upsert(stagedData);

    res.json({
      message: 'Rule update added to staging',
      success: true,
      data: req.body,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error updating new rule',
      error: err.message,
      success: false,
    });
  }
};

export const destroy = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();
    const existingRecord = await assertRuleRecordExists(req.body.cat_id);

    const stagedData = {
      uuid: req.body.cat_id,
      action: 'DELETE',
      table: Rule.stagingTableName,
    };

    await Rule.update(
      { commit_status: 'staged' },
      {
        where: {
          cat_id: existingRecord.cat_id,
        },
      },
    );

    await Staging.upsert(stagedData);
    res.json({
      message: 'Rule deleted successfully',
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error deleting rule',
      error: err.message,
      success: false,
    });
  }
};
