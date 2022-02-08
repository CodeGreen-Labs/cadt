import _ from 'lodash';

import xlsx from 'node-xlsx';
import { uuid as uuidv4 } from 'uuidv4';

import {
  Staging,
  Project,
  ProjectLocation,
  Label,
  Issuance,
  CoBenefit,
  RelatedProject,
  Organization,
  Rating,
  Estimation,
  ModelKeys,
} from '../models';

import {
  columnsToInclude,
  optionallyPaginatedResponse,
  paginationParams,
} from '../utils/helpers';

import {
  assertOrgIsHomeOrg,
  assertProjectRecordExists,
  assertCsvFileInRequest,
  assertHomeOrgExists,
  assetNoPendingCommits,
  assertRecordExistance,
} from '../utils/data-assertions';

import { createProjectRecordsFromCsv } from '../utils/csv-utils';
import {
  tableDataFromXlsx,
  createXlsFromSequelizeResults,
  sendXls,
  updateTableWithData,
  collapseTablesData,
} from '../utils/xls';

export const create = async (req, res) => {
  try {
    await assertHomeOrgExists();
    await assetNoPendingCommits();

    const newRecord = _.cloneDeep(req.body);
    // When creating new projects assign a uuid to is so
    // multiple organizations will always have unique ids
    const uuid = uuidv4();

    newRecord.warehouseProjectId = uuid;

    // All new projects are assigned to the home orgUid
    const { orgUid } = await Organization.getHomeOrg();
    newRecord.orgUid = orgUid;

    const childRecordsKeys = [
      'projectLocations',
      'issuances',
      'coBenefits',
      'relatedProjects',
      'projectRatings',
      'estimations',
      'labels',
    ];

    const existingChildRecordKeys = childRecordsKeys.filter((key) =>
      Boolean(newRecord[key]),
    );

    for (let i = 0; i < existingChildRecordKeys.length; i++) {
      const key = existingChildRecordKeys[i];
      await Promise.all(
        newRecord[key].map(async (childRecord) => {
          if (childRecord.id) {
            // If we are reusing an existing child record,
            // Make sure it exists
            await assertRecordExistance(ModelKeys[key], childRecord.id);
          } else {
            childRecord.id = uuidv4();
          }

          childRecord.orgUid = orgUid;
          childRecord.warehouseProjectId = uuid;
          return childRecord;
        }),
      );
    }

    await Staging.create({
      uuid,
      action: 'INSERT',
      table: Project.stagingTableName,
      data: JSON.stringify([newRecord]),
    });

    res.json({ message: 'Project staged successfully' });
  } catch (err) {
    res.status(400).json({
      message: 'Error creating new project',
      error: err.message,
    });
  }
};

export const findAll = async (req, res) => {
  let { page, limit, search, orgUid, columns, xls } = req.query;
  let where = orgUid ? { orgUid } : undefined;

  const includes = Project.getAssociatedModels();

  if (columns) {
    // Remove any unsupported columns
    columns = columns.filter((col) =>
      Project.defaultColumns
        .concat(includes.map((model) => model.name + 's'))
        .includes(col),
    );
  } else {
    columns = Project.defaultColumns.concat(
      includes.map((model) => model.name + 's'),
    );
  }

  // If only FK fields have been specified, select just ID
  if (!columns.length) {
    columns = ['warehouseProjectId'];
  }

  let results;
  let pagination = paginationParams(page, limit);

  if (xls) {
    pagination = { page: undefined, limit: undefined };
  }

  if (search) {
    results = await Project.fts(search, orgUid, pagination, columns);
  }

  if (!results) {
    const query = {
      ...columnsToInclude(columns, includes),
      ...pagination,
    };

    results = await Project.findAndCountAll({
      distinct: true,
      where,
      ...query,
    });
  }

  const response = optionallyPaginatedResponse(results, page, limit);

  if (!xls) {
    return res.json(response);
  } else {
    return sendXls(
      Project.name,
      createXlsFromSequelizeResults(response, Project, false, false, true),
      res,
    );
  }
};

export const findOne = async (req, res) => {
  const query = {
    where: { warehouseProjectId: req.query.warehouseProjectId },
    include: [
      ProjectLocation,
      Label,
      Issuance,
      CoBenefit,
      RelatedProject,
      Rating,
      Estimation,
    ],
  };

  res.json(await Project.findOne(query));
};

export const updateFromXLS = async (req, res) => {
  try {
    await assertHomeOrgExists();
    await assetNoPendingCommits();

    const { files } = req;

    if (!files || !files.xlsx) {
      throw new Error('File Not Received');
    }

    const xlsxParsed = xlsx.parse(files.xlsx.data);
    const stagedDataItems = tableDataFromXlsx(xlsxParsed, Project);
    await updateTableWithData(
      collapseTablesData(stagedDataItems, Project),
      Project,
    );

    res.json({
      message: 'Updates from xlsx added to staging',
    });
  } catch (error) {
    res.status(400).json({
      message: 'Batch Upload Failed.',
      error: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    await assertHomeOrgExists();
    // await assetNoPendingCommits();

    const originalRecord = await assertProjectRecordExists(
      req.body.warehouseProjectId,
    );

    await assertOrgIsHomeOrg(originalRecord.orgUid);

    const newRecord = _.cloneDeep(req.body);
    const { orgUid } = await Organization.getHomeOrg();

    const childRecordsKeys = [
      'projectLocations',
      'issuances',
      'coBenefits',
      'relatedProjects',
      'projectRatings',
      'estimations',
      'labels',
    ];

    const existingChildRecordKeys = childRecordsKeys.filter((key) =>
      Boolean(newRecord[key]),
    );

    for (let i = 0; i < existingChildRecordKeys.length; i++) {
      const key = existingChildRecordKeys[i];
      await Promise.all(
        newRecord[key].map(async (childRecord) => {
          if (childRecord.id) {
            // If we are reusing an existing child record,
            // Make sure it exists
            await assertRecordExistance(ModelKeys[key], childRecord.id);
          } else {
            childRecord.id = uuidv4();
          }

          if (!childRecord.orgUid) {
            childRecord.orgUid = orgUid;
          }

          if (!childRecord.warehouseProjectId) {
            childRecord.warehouseProjectId = newRecord.warehouseProjectId;
          }

          if (key === 'labels' && childRecord.labelUnits) {
            childRecord.labelUnits.orgUid = orgUid;
          }

          return childRecord;
        }),
      );
    }

    // merge the new record into the old record
    let stagedRecord = Array.isArray(newRecord) ? newRecord : [newRecord];

    stagedRecord = stagedRecord.map((record) => {
      return Object.keys(record).reduce((syncedRecord, key) => {
        syncedRecord[key] = record[key];
        return syncedRecord;
      }, originalRecord);
    });

    const stagedData = {
      uuid: req.body.warehouseProjectId,
      action: 'UPDATE',
      table: Project.stagingTableName,
      data: JSON.stringify(stagedRecord),
    };

    await Staging.upsert(stagedData);

    res.json({
      message: 'Project update added to staging',
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error adding update to stage',
      error: err.message,
    });
    console.log(err);
  }
};

export const destroy = async (req, res) => {
  try {
    await assertHomeOrgExists();
    await assetNoPendingCommits();

    const originalRecord = await assertProjectRecordExists(
      req.body.warehouseProjectId,
    );

    await assertOrgIsHomeOrg(originalRecord.orgUid);

    const stagedData = {
      uuid: req.body.warehouseProjectId,
      action: 'DELETE',
      table: Project.stagingTableName,
    };

    await Staging.create(stagedData);

    res.json({
      message: 'Project deleted successfully',
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error adding project removal to stage',
      error: err.message,
    });
  }
};

export const batchUpload = async (req, res) => {
  try {
    await assertHomeOrgExists();
    await assetNoPendingCommits();

    const csvFile = assertCsvFileInRequest(req);
    await createProjectRecordsFromCsv(csvFile);

    res.json({
      message:
        'CSV processing complete, your records have been added to the staging table.',
    });
  } catch (error) {
    res.status(400).json({
      message: 'Batch Upload Failed.',
      error: error.message,
    });
  }
};
