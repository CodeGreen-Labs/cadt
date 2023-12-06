import _ from 'lodash';

import { Sequelize } from 'sequelize';

import { Project, Rule, Staging } from '../models';

import {
  genericFilterRegex,
  genericSortColumnRegex,
  isArrayRegex,
} from '../utils/string-utils';

import {
  columnsToInclude,
  optionallyPaginatedResponse,
  paginationParams,
} from '../utils/helpers';

import {
  assertHomeOrgExists,
  assertIfReadOnlyMode,
  assertNoPendingCommits,
} from '../utils/data-assertions';

import { formatModelAssociationName } from '../utils/model-utils.js';

export const create = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();

    const newRecord = _.cloneDeep(req.body);

    await Staging.create({
      uuid: newRecord.cat_id,
      action: 'INSERT',
      table: Rule.stagingTableName,
      data: JSON.stringify([newRecord]),
    });

    res.json({
      message: 'Rules staged successfully',
      uuid: newRecord.cat_id,
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
    let { page, limit, search, orgUid, columns, xls, filter, order } =
      req.query;

    let where = orgUid != null && orgUid !== 'all' ? { orgUid } : undefined;

    if (filter) {
      if (!where) {
        where = {};
      }

      const matches = filter.match(genericFilterRegex);
      // check if the value param is an array so we can parse it
      const valueMatches = matches[2].match(isArrayRegex);
      where[matches[1]] = {
        [Sequelize.Op[matches[3]]]: valueMatches
          ? JSON.parse(matches[2])
          : matches[2],
      };
    }

    if (orgUid === 'all') {
      // 'ALL' orgUid is just a UI concept but they keep forgetting this and send it
      // So delete this value if its sent so nothing breaks
      orgUid = undefined;
    }

    const includes = Project.getAssociatedModels();

    if (columns) {
      // Remove any unsupported columns
      columns = columns.filter((col) =>
        Project.defaultColumns
          .concat(includes.map(formatModelAssociationName))
          .includes(col),
      );
    } else {
      columns = Project.defaultColumns.concat(
        includes.map(formatModelAssociationName),
      );
    }

    // If only FK fields have been specified, select just ID
    if (!columns.length) {
      columns = ['warehouseProjectId'];
    }

    let pagination = paginationParams(page, limit);

    if (xls) {
      pagination = { page: undefined, limit: undefined };
    }

    if (search) {
      // we cant add methodology2 to the fts table because you cant alter virtual tables without deleting the whole thig
      // so we need a migration that deletes the entire fts table and then repopulates it. This will be a new story
      const ftsResults = await Project.fts(
        search,
        orgUid,
        {},
        columns.filter((col) => col !== 'methodology2'),
      );
      const mappedResults = ftsResults.rows.map((ftsResult) =>
        _.get(ftsResult, 'dataValues.warehouseProjectId'),
      );

      if (!where) {
        where = {};
      }

      where.warehouseProjectId = {
        [Sequelize.Op.in]: mappedResults,
      };
    }

    const query = {
      ...columnsToInclude(columns, includes),
      ...pagination,
    };

    // default to DESC
    let resultOrder = [['timeStaged', 'DESC']];

    if (order?.match(genericSortColumnRegex)) {
      const matches = order.match(genericSortColumnRegex);
      resultOrder = [[matches[1], matches[2]]];
    }

    const results = await Project.findAndCountAll({
      distinct: true,
      where,
      order: resultOrder,
      ...query,
    });

    const response = optionallyPaginatedResponse(results, page, limit);

    return res.json(response);
  } catch (error) {
    console.trace(error);
    res.status(400).json({
      message: 'Error retrieving projects',
      error: error.message,
      success: false,
    });
  }
};
